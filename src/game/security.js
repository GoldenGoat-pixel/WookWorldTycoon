import * as THREE from 'three';

const STATE = {
  PATROLLING: 0,
  CHASING: 1,
  CONFRONTING: 2,
  RETURNING: 3,
  GATE_CHECK: 4
};

const DETECTION_RADIUS = 8;
const SCAN_INTERVAL = 1.0;
const CONFRONT_TIME = 1.5;

const _bubbleCache = {};
function _bubbleTex(icon) {
  if (_bubbleCache[icon]) return _bubbleCache[icon];
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = s; cv.height = s;
  const c = cv.getContext('2d');
  c.beginPath();
  c.roundRect(4, 4, s - 8, s - 8, 12);
  c.fillStyle = 'rgba(30,30,80,0.92)';
  c.fill();
  c.strokeStyle = 'rgba(255,200,0,0.5)';
  c.lineWidth = 2;
  c.stroke();
  c.font = '30px serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(icon, s / 2, s / 2);
  const tex = new THREE.CanvasTexture(cv);
  _bubbleCache[icon] = tex;
  return tex;
}

const SKIN_TONES = [0xf5d0a9, 0xd4a574, 0xc68642, 0x8d5524];

export class SecurityGuardManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.guards = [];
    this.stats = { catches: 0, ejections: 0, confiscations: 0, fines: 0 };
    this._tv = new THREE.Vector3();
  }

  _createMesh() {
    const g = new THREE.Group();
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.38, 0.16),
      new THREE.MeshLambertMaterial({ color: 0x1a1a4e })
    );
    body.position.y = 0.47;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 6, 5),
      new THREE.MeshLambertMaterial({ color: skin })
    );
    head.position.y = 0.75;
    g.add(head);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.12, 0.07, 8),
      new THREE.MeshLambertMaterial({ color: 0x111133 })
    );
    cap.position.y = 0.87;
    g.add(cap);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x111133 })
    );
    visor.position.set(0, 0.84, 0.1);
    g.add(visor);

    const badge = new THREE.Mesh(
      new THREE.CircleGeometry(0.04, 5),
      new THREE.MeshBasicMaterial({ color: 0xffcc00, side: THREE.DoubleSide })
    );
    badge.position.set(0.06, 0.55, 0.09);
    g.add(badge);

    for (const s of [-0.07, 0.07]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.28, 0.09),
        new THREE.MeshLambertMaterial({ color: 0x111133 })
      );
      leg.position.set(s, 0.16, 0);
      g.add(leg);
    }

    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.04, 0.18),
      new THREE.MeshLambertMaterial({ color: 0x222222 })
    );
    belt.position.y = 0.32;
    g.add(belt);

    g.scale.setScalar(1.15);
    return g;
  }

  spawnGuards(staffManager) {
    this.clear();
    const posts = this.world.placed.filter(e => e.data.id === 'security_post');
    for (const post of posts) {
      for (let i = 0; i < 2; i++) this._spawn(post, 'patrol', i);
    }
    const gates = this.world.placed.filter(e => e.data.id === 'entrance_gate');
    for (const gate of gates) {
      if (staffManager && staffManager.getCount(gate) > 0) {
        this._spawn(gate, 'gate', 0);
      }
    }
  }

  _spawn(building, role, idx) {
    const mesh = this._createMesh();
    const angle = (idx / 2) * Math.PI - Math.PI * 0.25;
    const rx = building.sizeX * 0.5 + 1.5;
    const x = building.gridX + Math.sin(angle) * rx;
    const z = building.gridZ + building.sizeZ / 2 + 1.5;
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);

    const guard = {
      mesh, role, building,
      state: role === 'gate' ? STATE.GATE_CHECK : STATE.PATROLLING,
      target: null, targetAtt: null,
      timer: 0, scanTimer: Math.random(),
      phase: Math.random() * Math.PI * 2,
      homeX: x, homeZ: z, speed: 3.2,
      bubble: null, _bIcon: null
    };
    guard.target = this._patrolPt(guard);
    this.guards.push(guard);
  }

  _patrolPt(guard) {
    const b = guard.building;
    const r = Math.max(b.sizeX, b.sizeZ) + 8;
    return new THREE.Vector3(
      b.gridX + (Math.random() - 0.5) * r,
      0,
      b.gridZ + Math.random() * r * 0.5 + b.sizeZ / 2
    );
  }

  _move(guard, tx, tz, dt) {
    const d = this._tv;
    d.set(tx - guard.mesh.position.x, 0, tz - guard.mesh.position.z);
    const len = d.length();
    if (len < 0.5) return true;
    d.normalize();
    const step = guard.speed * dt;
    guard.mesh.position.x += d.x * step;
    guard.mesh.position.z += d.z * step;
    guard.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.007 + guard.phase)) * 0.03;
    guard.mesh.rotation.y = Math.atan2(d.x, d.z);
    return false;
  }

  _d2(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  _setBubble(guard, icon) {
    if (guard._bIcon === icon) return;
    const tex = _bubbleTex(icon);
    if (!guard.bubble) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      guard.bubble = new THREE.Sprite(mat);
      guard.bubble.scale.set(0.5, 0.5, 1);
      guard.bubble.position.y = 1.2;
      guard.mesh.add(guard.bubble);
    } else {
      guard.bubble.material.map = tex;
      guard.bubble.material.needsUpdate = true;
    }
    guard.bubble.visible = true;
    guard._bIcon = icon;
  }

  _hideBubble(guard) {
    if (guard.bubble) guard.bubble.visible = false;
    guard._bIcon = null;
  }

  update(dt, crowd, economy) {
    for (const guard of this.guards) {
      switch (guard.state) {

        case STATE.PATROLLING: {
          this._setBubble(guard, '🔍');
          if (!guard.target) guard.target = this._patrolPt(guard);
          if (this._move(guard, guard.target.x, guard.target.z, dt)) {
            guard.target = this._patrolPt(guard);
          }
          guard.scanTimer -= dt;
          if (guard.scanTimer <= 0) {
            guard.scanTimer = SCAN_INTERVAL + Math.random() * 0.5;
            const t = this._scan(guard, crowd);
            if (t) { guard.targetAtt = t; guard.state = STATE.CHASING; }
          }
          break;
        }

        case STATE.CHASING: {
          this._setBubble(guard, '🚨');
          const att = guard.targetAtt;
          if (!att || att.state === 5) {
            guard.state = STATE.RETURNING;
            guard.targetAtt = null;
            break;
          }
          if (this._move(guard, att.mesh.position.x, att.mesh.position.z, dt)) {
            guard.state = STATE.CONFRONTING;
            guard.timer = CONFRONT_TIME;
          }
          break;
        }

        case STATE.CONFRONTING: {
          this._setBubble(guard, '🛑');
          guard.timer -= dt;
          if (guard.timer <= 0) {
            this._handle(guard, economy);
            guard.targetAtt = null;
            guard.state = STATE.RETURNING;
          }
          break;
        }

        case STATE.RETURNING: {
          this._hideBubble(guard);
          if (this._move(guard, guard.homeX, guard.homeZ, dt)) {
            guard.state = guard.role === 'gate' ? STATE.GATE_CHECK : STATE.PATROLLING;
            guard.target = this._patrolPt(guard);
          }
          break;
        }

        case STATE.GATE_CHECK: {
          this._setBubble(guard, '🔍');
          guard.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.003)) * 0.02;
          for (const att of crowd.attendees) {
            if (att.state !== 0) continue;
            if (!att.hasContraband) continue;
            if (this._d2(guard.mesh.position, att.mesh.position) > 5) continue;
            att.hasContraband = false;
            att.satisfaction = Math.max(0, att.satisfaction - 5);
            this.stats.confiscations++;
            this.stats.catches++;
            const fine = 5 + Math.floor(Math.random() * 10);
            economy.earn(fine);
            this.stats.fines += fine;
            guard.targetAtt = att;
            guard.state = STATE.CONFRONTING;
            guard.timer = 0.8;
            break;
          }
          break;
        }
      }

      if (guard.bubble && guard.bubble.visible) {
        guard.bubble.position.y = 1.15 + Math.sin(performance.now() * 0.003 + guard.phase) * 0.03;
      }
    }
  }

  _scan(guard, crowd) {
    let best = null, bestP = Infinity;
    for (const att of crowd.attendees) {
      if (att.state === 5) continue;
      if (att._securityCooldown > 0) continue;
      const d = this._d2(guard.mesh.position, att.mesh.position);
      if (d > DETECTION_RADIUS) continue;

      let p = d;
      if (att.isDealer) p -= 20;
      else if (att.state === 8) p -= 15;
      else if (att.intoxLevel === 'wasted') p -= 12;
      else if (att.partyFavor) p -= 8;
      else if (att.intoxLevel === 'drunk') p -= 4;
      else continue;

      if (p < bestP) { bestP = p; best = att; }
    }
    if (best) best._securityCooldown = 25;
    return best;
  }

  _handle(guard, economy) {
    const att = guard.targetAtt;
    if (!att) return;

    if (att.isDealer) {
      att.state = 5;
      att.target = null;
      att.isDealer = false;
      if (att._glowLight) { att.mesh.remove(att._glowLight); att._glowLight = null; }
      att.partyFavor = null;
      this.stats.ejections++;
      this.stats.catches++;
      const fine = 25 + Math.floor(Math.random() * 25);
      economy.earn(fine);
      this.stats.fines += fine;
    } else if (att.partyFavor) {
      if (att._glowLight) { att.mesh.remove(att._glowLight); att._glowLight = null; }
      att.partyFavor = null;
      att.favorTimer = 0;
      att.satisfaction = Math.max(0, att.satisfaction - 10);
      this.stats.confiscations++;
      this.stats.catches++;
      const fine = 10 + Math.floor(Math.random() * 15);
      economy.earn(fine);
      this.stats.fines += fine;
    } else if (att.intoxLevel === 'wasted' || att.state === 8) {
      const med = this.world.placed.find(e => e.data.id === 'med_tent');
      if (med) {
        att.state = 2;
        att.targetEntry = med;
        att._seekingNeed = 'energy';
        att.target = new THREE.Vector3(
          med.gridX + (Math.random() - 0.5), 0,
          med.gridZ + med.sizeZ / 2 + 0.8
        );
        att.mesh.position.y = 0;
        att.mesh.rotation.x = 0;
        att.mesh.rotation.z = 0;
        att.drinks = Math.max(0, att.drinks - 2);
      }
      this.stats.catches++;
    } else if (att.intoxLevel === 'drunk') {
      att.drinks = Math.max(0, att.drinks - 1);
      att.satisfaction = Math.max(0, att.satisfaction - 5);
      this.stats.catches++;
    }
  }

  clear() {
    for (const guard of this.guards) {
      if (guard.bubble) {
        guard.mesh.remove(guard.bubble);
        guard.bubble.material.dispose();
      }
      this.scene.remove(guard.mesh);
    }
    this.guards.length = 0;
    this.stats = { catches: 0, ejections: 0, confiscations: 0, fines: 0 };
  }

  getGuardCount() { return this.guards.length; }
}
