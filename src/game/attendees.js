import * as THREE from 'three';

const SKIN_TONES = [0xf5d0a9, 0xd4a574, 0xc68642, 0x8d5524, 0x6b3a2a, 0xffe0bd];
const SHIRT_COLORS = [0xe05050, 0x5050e0, 0x50b050, 0xe0e050, 0xff8800, 0xcc44cc, 0x44cccc, 0xffffff, 0x222222, 0xff69b4];
const HAT_COLORS = [0x000000, 0xe05050, 0x3366cc, 0xffcc00, 0x33cc33];

const NEED_BUILDINGS = {
  hunger:  ['food_tent', 'bar', 'vip_lounge'],
  thirst:  ['bar', 'fountain', 'vip_lounge'],
  fun:     ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage', 'ferris_wheel', 'art_sculpture'],
  energy:  ['tent_small', 'tent_large', 'glamping_tent', 'hammock_grove', 'rv_spot'],
  bladder: ['toilets']
};

const NEED_SATISFY = {
  hunger:  40,
  thirst:  50,
  fun:     35,
  energy:  30,
  bladder: 60
};

const NEED_DECAY = {
  hunger:  3,
  thirst:  5,
  fun:     4,
  energy:  2,
  bladder: 4
};

const SERVICE_SLOTS = {
  food_tent: 4,
  bar: 5,
  toilets: 3,
  vip_lounge: 6,
  fountain: 8,
  tent_small: 2,
  tent_large: 4,
  glamping_tent: 2,
  hammock_grove: 4,
  rv_spot: 3,
  merch_stand: 3,
  med_tent: 2,
  ferris_wheel: 6,
  medium_stage: 30,
  main_stage: 50,
  dj_booth: 20,
  acoustic_tent: 12,
  mega_stage: 80,
  art_sculpture: 10
};

const MAX_QUEUE = 6;

const NEED_THRESHOLD = 60;
const CRITICAL_THRESHOLD = 85;

const BUBBLE_ICONS = {
  hunger:  '🍔',
  thirst:  '💧',
  fun:     '🎵',
  energy:  '😴',
  bladder: '🚽',
  happy:   '❤️',
  angry:   '😡',
  queue:   '⏳'
};

const _bubbleTextures = {};
function _getBubbleTexture(key, critical) {
  const cacheKey = key + (critical ? '_crit' : '');
  if (_bubbleTextures[cacheKey]) return _bubbleTextures[cacheKey];

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext('2d');

  c.beginPath();
  c.roundRect(4, 4, size - 8, size - 8, 12);
  c.fillStyle = critical ? 'rgba(220,50,50,0.92)' : 'rgba(255,255,255,0.92)';
  c.fill();
  c.strokeStyle = critical ? 'rgba(180,30,30,0.8)' : 'rgba(0,0,0,0.15)';
  c.lineWidth = 2;
  c.stroke();

  c.font = '32px serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(BUBBLE_ICONS[key] || '?', size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  _bubbleTextures[cacheKey] = tex;
  return tex;
}

const STATE = {
  ENTERING: 0,
  WANDERING: 1,
  SEEKING: 2,
  USING: 3,
  DANCING: 4,
  LEAVING: 5,
  QUEUING: 6
};

function dist2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

class Attendee {
  constructor(mesh, x, z) {
    this.mesh = mesh;
    this.mesh.position.set(x, 0, z);
    this.speed = 2.5 + Math.random() * 1.5;

    this.needs = {
      hunger:  Math.random() * 30,
      thirst:  Math.random() * 30,
      fun:     Math.random() * 20,
      energy:  Math.random() * 15,
      bladder: Math.random() * 25
    };

    this.satisfaction = 80;
    this.state = STATE.ENTERING;
    this.target = null;
    this.targetEntry = null;
    this.useTimer = 0;
    this.useDuration = 0;
    this.wanderTimer = 0;
    this.dancePhase = Math.random() * Math.PI * 2;
    this.spending = 0;
    this.lifetime = 60 + Math.random() * 120;
    this.bubble = null;
    this.bubbleKey = null;
    this.bubbleTimer = 0;
  }

  getMostUrgentNeed() {
    let worst = null;
    let worstVal = 0;
    for (const [need, val] of Object.entries(this.needs)) {
      if (val > worstVal) {
        worstVal = val;
        worst = need;
      }
    }
    return worstVal >= NEED_THRESHOLD ? worst : null;
  }

  getCriticalNeed() {
    for (const [need, val] of Object.entries(this.needs)) {
      if (val >= CRITICAL_THRESHOLD) return need;
    }
    return null;
  }
}

export class AttendeeManager {
  constructor(scene, world, economy) {
    this.scene = scene;
    this.world = world;
    this.economy = economy;
    this.attendees = [];
    this.pool = [];
    this.maxAttendees = 300;
    this.spawnTimer = 0;
    this.stats = { totalSpending: 0, avgSatisfaction: 0, left: 0, unhappyLeft: 0 };
    this._users = new Map();
    this._queues = new Map();
    this._tmpVec = new THREE.Vector3();
    this.staff = null;
    this.events = null;
  }

  setStaff(staffManager) {
    this.staff = staffManager;
  }

  setEvents(eventManager) {
    this.events = eventManager;
  }

  _createMesh() {
    const group = new THREE.Group();
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    const shirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.35, 0.15),
      new THREE.MeshLambertMaterial({ color: shirt })
    );
    body.position.y = 0.45;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      new THREE.MeshLambertMaterial({ color: skin })
    );
    head.position.y = 0.72;
    group.add(head);

    for (const s of [-0.06, 0.06]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.25, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x334466 })
      );
      leg.position.set(s, 0.15, 0);
      group.add(leg);
    }

    if (Math.random() < 0.3) {
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8),
        new THREE.MeshLambertMaterial({ color: HAT_COLORS[Math.floor(Math.random() * HAT_COLORS.length)] })
      );
      hat.position.y = 0.83;
      group.add(hat);
    }

    if (Math.random() < 0.2) {
      const glow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2),
        new THREE.MeshBasicMaterial({ color: [0x00ff88, 0xff00ff, 0x00ffff, 0xffff00][Math.floor(Math.random() * 4)] })
      );
      glow.position.set(0.15, 0.5, 0);
      glow.rotation.z = Math.PI / 6;
      group.add(glow);
    }

    return group;
  }

  _getMesh() {
    return this.pool.length > 0 ? this.pool.pop() : this._createMesh();
  }

  _recycle(att) {
    if (att.bubble) {
      att.mesh.remove(att.bubble);
      att.bubble.material.dispose();
      att.bubble = null;
    }
    this.scene.remove(att.mesh);
    this.pool.push(att.mesh);
  }

  _getMaxSlots(entry) {
    return SERVICE_SLOTS[entry.data.id] || 999;
  }

  _getUserCount(entry) {
    return this._users.get(entry) || 0;
  }

  _getQueue(entry) {
    let q = this._queues.get(entry);
    if (!q) { q = []; this._queues.set(entry, q); }
    return q;
  }

  _occupySlot(entry) {
    this._users.set(entry, (this._users.get(entry) || 0) + 1);
  }

  _releaseSlot(entry) {
    const count = (this._users.get(entry) || 1) - 1;
    if (count <= 0) this._users.delete(entry);
    else this._users.set(entry, count);
  }

  _hasOpenSlot(entry) {
    return this._getUserCount(entry) < this._getMaxSlots(entry);
  }

  _promoteFromQueue(entry) {
    const q = this._queues.get(entry);
    if (!q || q.length === 0) return;
    const next = q.shift();
    if (next.state !== STATE.QUEUING) return;
    this._occupySlot(entry);
    next.state = STATE.USING;
    next.useTimer = 0;
    const baseDur = 2 + Math.random() * 3;
    const speedMult = this.staff ? this.staff.getServiceSpeedMultiplier(entry) : 1;
    next.useDuration = baseDur / speedMult;
  }

  getBuildingStats(entry) {
    return {
      users: this._getUserCount(entry),
      maxSlots: this._getMaxSlots(entry),
      queueLength: this._getQueue(entry).length
    };
  }

  _findBuildingsForNeed(need) {
    const ids = NEED_BUILDINGS[need];
    if (!ids) return [];
    return this.world.placed.filter(e => ids.includes(e.data.id));
  }

  _findNearestBuilding(att, need) {
    const buildings = this._findBuildingsForNeed(need);
    if (buildings.length === 0) return null;

    let best = null;
    let bestScore = Infinity;
    for (const entry of buildings) {
      const d = dist2D(att.mesh.position, { x: entry.gridX, z: entry.gridZ + entry.sizeZ / 2 + 1 });
      const q = this._getQueue(entry).length;
      const full = this._hasOpenSlot(entry) ? 0 : 1;
      if (full && q >= MAX_QUEUE) continue;
      const score = d + full * 10 + q * 3;
      if (score < bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best;
  }

  _pickWanderTarget(att) {
    if (this.world.placed.length === 0) return null;
    const interesting = this.world.placed.filter(e => e.data.capacity || e.data.income);
    const pool = interesting.length > 0 ? interesting : this.world.placed;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    for (let tries = 0; tries < 6; tries++) {
      const ox = (Math.random() - 0.5) * (entry.sizeX + 6);
      const oz = entry.sizeZ / 2 + 1.5 + Math.random() * 2;
      const tx = entry.gridX + ox;
      const tz = entry.gridZ + oz;
      if (!this._isOccupied(tx, tz)) return new THREE.Vector3(tx, 0, tz);
    }
    return new THREE.Vector3(entry.gridX, 0, entry.gridZ + entry.sizeZ / 2 + 2);
  }

  _getEntryPoint() {
    const half = this.world.gridSize / 2;
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: -half, z: (Math.random() - 0.5) * half };
      case 1: return { x: half, z: (Math.random() - 0.5) * half };
      case 2: return { x: (Math.random() - 0.5) * half, z: -half };
      default: return { x: (Math.random() - 0.5) * half, z: half };
    }
  }

  _getExitTarget(att) {
    const half = this.world.gridSize / 2;
    const pos = att.mesh.position;
    const edges = [
      new THREE.Vector3(-half - 3, 0, pos.z),
      new THREE.Vector3(half + 3, 0, pos.z),
      new THREE.Vector3(pos.x, 0, -half - 3),
      new THREE.Vector3(pos.x, 0, half + 3)
    ];
    let nearest = edges[0];
    let nd = dist2D(pos, nearest);
    for (let i = 1; i < edges.length; i++) {
      const d = dist2D(pos, edges[i]);
      if (d < nd) { nearest = edges[i]; nd = d; }
    }
    return nearest;
  }

  _showBubble(att, key, critical) {
    if (att.bubbleKey === key + (critical ? '_c' : '')) return;
    const tex = _getBubbleTexture(key, critical);
    if (!att.bubble) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      att.bubble = new THREE.Sprite(mat);
      att.bubble.scale.set(0.55, 0.55, 1);
      att.bubble.position.y = 1.1;
      att.mesh.add(att.bubble);
    } else {
      att.bubble.material.map = tex;
      att.bubble.material.needsUpdate = true;
    }
    att.bubble.visible = true;
    att.bubbleKey = key + (critical ? '_c' : '');
    att.bubbleTimer = 0;
  }

  _hideBubble(att) {
    if (att.bubble) att.bubble.visible = false;
    att.bubbleKey = null;
  }

  _updateBubble(att, dt) {
    const urgent = att.getMostUrgentNeed();
    const critical = att.getCriticalNeed();

    if (att.state === STATE.LEAVING && att.satisfaction < 20) {
      this._showBubble(att, 'angry', true);
    } else if (att.state === STATE.QUEUING) {
      this._showBubble(att, 'queue', !!critical);
    } else if (att.state === STATE.DANCING) {
      this._showBubble(att, 'happy', false);
    } else if (critical) {
      this._showBubble(att, critical, true);
    } else if (urgent) {
      this._showBubble(att, urgent, false);
    } else if (att.state === STATE.USING) {
      this._hideBubble(att);
    } else {
      att.bubbleTimer += dt;
      if (att.bubbleTimer > 1.5) this._hideBubble(att);
    }

    if (att.bubble && att.bubble.visible) {
      att.bubble.position.y = 1.05 + Math.sin(performance.now() * 0.003 + att.dancePhase) * 0.04;
    }
  }

  _isOccupied(x, z) {
    const key = `${Math.round(x)},${Math.round(z)}`;
    return this.world.occupied.has(key) && !this.world.walkable.has(key);
  }

  _isOnPath(x, z) {
    return this.world.walkable.has(`${Math.round(x)},${Math.round(z)}`);
  }

  _moveToward(att, target, dt) {
    const dir = this._tmpVec;
    dir.set(target.x - att.mesh.position.x, 0, target.z - att.mesh.position.z);
    const d = dir.length();
    if (d < 0.5) return true;
    dir.normalize();

    const onPath = this._isOnPath(att.mesh.position.x, att.mesh.position.z);
    const evtSpeed = this.events ? this.events.getActiveSpeedMult() : 1;
    const step = att.speed * (onPath ? 1.8 : 1) * evtSpeed * dt;

    if (!onPath && d > 3) {
      for (let ox = -1; ox <= 1; ox++) {
        for (let oz = -1; oz <= 1; oz++) {
          if (ox === 0 && oz === 0) continue;
          const px = Math.round(att.mesh.position.x) + ox;
          const pz = Math.round(att.mesh.position.z) + oz;
          if (this._isOnPath(px, pz)) {
            dir.x = dir.x * 0.7 + ox * 0.3;
            dir.z = dir.z * 0.7 + oz * 0.3;
            dir.normalize();
            ox = 2; break;
          }
        }
      }
    }

    let nx = att.mesh.position.x + dir.x * step;
    let nz = att.mesh.position.z + dir.z * step;

    if (this._isOccupied(nx, nz)) {
      const tryX = !this._isOccupied(nx, att.mesh.position.z);
      const tryZ = !this._isOccupied(att.mesh.position.x, nz);

      if (tryX && !tryZ) {
        nz = att.mesh.position.z;
      } else if (tryZ && !tryX) {
        nx = att.mesh.position.x;
      } else if (tryX && tryZ) {
        if (Math.abs(dir.x) > Math.abs(dir.z)) {
          nz = att.mesh.position.z;
        } else {
          nx = att.mesh.position.x;
        }
      } else {
        const nudge = ((att.dancePhase * 1000) & 1) ? 1 : -1;
        nx = att.mesh.position.x + nudge * step * 0.5;
        nz = att.mesh.position.z;
        if (this._isOccupied(nx, nz)) {
          nx = att.mesh.position.x;
          nz = att.mesh.position.z + nudge * step * 0.5;
        }
      }
    }

    const mx = nx - att.mesh.position.x;
    const mz = nz - att.mesh.position.z;
    att.mesh.position.x = nx;
    att.mesh.position.z = nz;
    att.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.008 + att.dancePhase)) * 0.04;
    if (mx !== 0 || mz !== 0) att.mesh.rotation.y = Math.atan2(mx, mz);
    return false;
  }

  spawn() {
    if (this.attendees.length >= this.maxAttendees) return;
    const ep = this._getEntryPoint();
    const mesh = this._getMesh();
    const att = new Attendee(mesh, ep.x, ep.z);

    const wt = this._pickWanderTarget(att);
    if (!wt) return;
    att.target = wt;
    att.state = STATE.ENTERING;

    this.scene.add(mesh);
    this.attendees.push(att);
  }

  update(dt, targetCount) {
    this.spawnTimer -= dt;
    const desired = Math.min(targetCount, this.maxAttendees);

    if (this.attendees.length < desired && this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = 0.2 + Math.random() * 0.3;
    }

    let totalSat = 0;

    for (let i = this.attendees.length - 1; i >= 0; i--) {
      const att = this.attendees[i];

      for (const need of Object.keys(att.needs)) {
        const evtMult = this.events ? this.events.getActiveNeedDecayMult(need) : 1;
        att.needs[need] = Math.min(100, att.needs[need] + NEED_DECAY[need] * evtMult * dt);
      }

      att.lifetime -= dt;

      let unhappy = 0;
      for (const val of Object.values(att.needs)) {
        if (val > CRITICAL_THRESHOLD) unhappy += 2;
        else if (val > NEED_THRESHOLD) unhappy += 1;
      }
      const evtSatRate = this.events ? this.events.getActiveSatisfactionRate() : 0;
      att.satisfaction = Math.max(0, Math.min(100, att.satisfaction - unhappy * dt * 0.5 + (unhappy === 0 ? dt * 2 : 0) + evtSatRate * dt));
      totalSat += att.satisfaction;

      if ((att.satisfaction < 20 || att.lifetime <= 0) && att.state !== STATE.LEAVING) {
        if (att.state === STATE.QUEUING && att.targetEntry) {
          const q = this._getQueue(att.targetEntry);
          const idx = q.indexOf(att);
          if (idx !== -1) q.splice(idx, 1);
        }
        if (att.state === STATE.USING && att.targetEntry) {
          this._releaseSlot(att.targetEntry);
          this._promoteFromQueue(att.targetEntry);
        }
        att.state = STATE.LEAVING;
        att.target = this._getExitTarget(att);
        att.targetEntry = null;
        att._seekingNeed = null;
        if (att.satisfaction < 20) this.stats.unhappyLeft++;
      }

      this._updateBubble(att, dt);

      switch (att.state) {
        case STATE.ENTERING:
        case STATE.WANDERING: {
          if (!att.target) att.target = this._pickWanderTarget(att);
          if (!att.target) break;

          const urgent = att.getMostUrgentNeed();
          if (urgent && !att.targetEntry) {
            const entry = this._findNearestBuilding(att, urgent);
            if (entry) {
              att.state = STATE.SEEKING;
              att.targetEntry = entry;
              att.target = new THREE.Vector3(
                entry.gridX + (Math.random() - 0.5) * entry.sizeX * 0.5,
                0,
                entry.gridZ + entry.sizeZ / 2 + 0.8
              );
              att._seekingNeed = urgent;
              break;
            }
          }

          const arrived = this._moveToward(att, att.target, dt);
          if (arrived) {
            const stageNearby = this.world.placed.find(e => {
              const ids = NEED_BUILDINGS.fun;
              if (!ids.includes(e.data.id)) return false;
              return dist2D(att.mesh.position, { x: e.gridX, z: e.gridZ }) < e.sizeX + 3;
            });
            if (stageNearby && att.needs.fun > 30) {
              att.state = STATE.DANCING;
              att.wanderTimer = 4 + Math.random() * 8;
              att.needs.fun = Math.max(0, att.needs.fun - 15);
              break;
            }

            att.state = STATE.WANDERING;
            att.wanderTimer = 2 + Math.random() * 4;
            att.target = this._pickWanderTarget(att);
          }
          break;
        }

        case STATE.SEEKING: {
          if (!att.target) { att.state = STATE.WANDERING; break; }
          const arrived = this._moveToward(att, att.target, dt);
          if (arrived && att.targetEntry) {
            const entry = att.targetEntry;
            if (this._hasOpenSlot(entry)) {
              this._occupySlot(entry);
              att.state = STATE.USING;
              att.useTimer = 0;
              const baseDur = 2 + Math.random() * 3;
              const speedMult = this.staff ? this.staff.getServiceSpeedMultiplier(entry) : 1;
              att.useDuration = baseDur / speedMult;
            } else {
              const q = this._getQueue(entry);
              if (q.length < MAX_QUEUE) {
                q.push(att);
                att.state = STATE.QUEUING;
                att.wanderTimer = 8 + Math.random() * 6;
                const slot = q.length;
                att.target = new THREE.Vector3(
                  entry.gridX + (slot % 3 - 1) * 0.6,
                  0,
                  entry.gridZ + entry.sizeZ / 2 + 1.2 + Math.floor(slot / 3) * 0.6
                );
              } else {
                att.satisfaction = Math.max(0, att.satisfaction - 3);
                att.state = STATE.WANDERING;
                att.target = this._pickWanderTarget(att);
                att.targetEntry = null;
                att._seekingNeed = null;
              }
            }
          }
          break;
        }

        case STATE.QUEUING: {
          if (!att.targetEntry) { att.state = STATE.WANDERING; break; }
          this._moveToward(att, att.target, dt);
          att.wanderTimer -= dt;
          att.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.005 + att.dancePhase)) * 0.02;
          if (att.wanderTimer <= 0) {
            const q = this._getQueue(att.targetEntry);
            const idx = q.indexOf(att);
            if (idx !== -1) q.splice(idx, 1);
            att.satisfaction = Math.max(0, att.satisfaction - 5);
            att.state = STATE.WANDERING;
            att.target = this._pickWanderTarget(att);
            att.targetEntry = null;
            att._seekingNeed = null;
          }
          break;
        }

        case STATE.USING: {
          att.useTimer += dt;
          att.mesh.position.y = 0;
          if (att.useTimer >= att.useDuration) {
            const need = att._seekingNeed;
            if (need && att.needs[need] !== undefined) {
              att.needs[need] = Math.max(0, att.needs[need] - NEED_SATISFY[need]);
            }

            const entry = att.targetEntry;
            if (entry) {
              if (entry.data.income) {
                const spend = 2 + Math.floor(Math.random() * 5);
                this.economy.earn(spend);
                att.spending += spend;
                this.stats.totalSpending += spend;
              }
              this._releaseSlot(entry);
              this._promoteFromQueue(entry);
            }

            att.satisfaction = Math.min(100, att.satisfaction + 5);
            att.state = STATE.WANDERING;
            att.target = this._pickWanderTarget(att);
            att.targetEntry = null;
            att._seekingNeed = null;
          }
          break;
        }

        case STATE.DANCING: {
          att.dancePhase += dt * 4;
          att.mesh.position.y = Math.abs(Math.sin(att.dancePhase)) * 0.1;
          att.mesh.rotation.y += Math.sin(att.dancePhase * 0.5) * 0.03;
          att.wanderTimer -= dt;
          att.needs.fun = Math.max(0, att.needs.fun - dt * 5);

          if (att.wanderTimer <= 0 || att.getCriticalNeed()) {
            att.state = STATE.WANDERING;
            att.target = this._pickWanderTarget(att);
          }
          break;
        }

        case STATE.LEAVING: {
          if (!att.target) att.target = this._getExitTarget(att);
          const arrived = this._moveToward(att, att.target, dt);
          if (arrived) {
            this._recycle(att);
            this.attendees.splice(i, 1);
            this.stats.left++;
            continue;
          }
          break;
        }
      }
    }

    this.stats.avgSatisfaction = this.attendees.length > 0
      ? Math.round(totalSat / this.attendees.length)
      : 0;
  }

  clear() {
    for (const att of this.attendees) {
      if (att.bubble) {
        att.mesh.remove(att.bubble);
        att.bubble.material.dispose();
      }
      this.scene.remove(att.mesh);
      this.pool.push(att.mesh);
    }
    this.attendees.length = 0;
    this._users.clear();
    this._queues.clear();
    this.stats = { totalSpending: 0, avgSatisfaction: 0, left: 0, unhappyLeft: 0 };
  }

  getCount() {
    return this.attendees.length;
  }

  getLiveSatisfaction() {
    return this.stats.avgSatisfaction;
  }
}
