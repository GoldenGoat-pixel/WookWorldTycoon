import * as THREE from 'three';

// Shared bubble texture cache (green-tinted for service workers)
const _bubbleCache = {};
function _bubbleTex(icon, bg) {
  const key = icon + bg;
  if (_bubbleCache[key]) return _bubbleCache[key];
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = s; cv.height = s;
  const c = cv.getContext('2d');
  c.beginPath();
  c.roundRect(4, 4, s - 8, s - 8, 12);
  c.fillStyle = bg;
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.3)';
  c.lineWidth = 2;
  c.stroke();
  c.font = '30px serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(icon, s / 2, s / 2);
  const tex = new THREE.CanvasTexture(cv);
  _bubbleCache[key] = tex;
  return tex;
}

const SKIN_TONES = [0xf5d0a9, 0xd4a574, 0xc68642, 0x8d5524];

const WORKER_STATE = {
  PATROLLING: 0,
  MOVING_TO: 1,
  WORKING: 2,
  ESCORTING: 3,
  RETURNING: 4
};

// ─── Litter system ───
const LITTER_SPAWN_INTERVAL = 4;
const LITTER_RADIUS_FROM_BUILDING = 4;
const MAX_LITTER = 40;
const LITTER_SAT_PENALTY = 0.3;
const LITTER_DETECT_RADIUS = 10;

// ─── Medic system ───
const MEDIC_SCAN_RADIUS = 12;
const MEDIC_SCAN_INTERVAL = 1.2;
const HEAL_TIME = 2.0;

export class ServiceWorkerManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.janitors = [];
    this.medics = [];
    this.litter = [];
    this._litterTimer = 0;
    this._tv = new THREE.Vector3();
    this.stats = { litterCleaned: 0, attendeesHealed: 0, attendeesEscorted: 0 };
  }

  // ─── Mesh builders ───

  _createJanitorMesh() {
    const g = new THREE.Group();
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.35, 0.14),
      new THREE.MeshLambertMaterial({ color: 0x2d8a4e })
    );
    body.position.y = 0.45;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      new THREE.MeshLambertMaterial({ color: skin })
    );
    head.position.y = 0.72;
    g.add(head);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.11, 0.06, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a5e32 })
    );
    cap.position.y = 0.83;
    g.add(cap);

    // Broom handle
    const broom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.7, 4),
      new THREE.MeshLambertMaterial({ color: 0x8b6914 })
    );
    broom.position.set(0.15, 0.45, 0);
    broom.rotation.z = -0.3;
    g.add(broom);

    // Broom head
    const broomHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.04, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x8b6914 })
    );
    broomHead.position.set(0.25, 0.1, 0);
    g.add(broomHead);

    for (const s of [-0.06, 0.06]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.26, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x1a5e32 })
      );
      leg.position.set(s, 0.15, 0);
      g.add(leg);
    }

    g.scale.setScalar(1.05);
    return g;
  }

  _createMedicMesh() {
    const g = new THREE.Group();
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.35, 0.14),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    body.position.y = 0.45;
    g.add(body);

    // Red cross on chest
    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.04, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    crossH.position.set(0, 0.5, 0.08);
    g.add(crossH);
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    crossV.position.set(0, 0.5, 0.08);
    g.add(crossV);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      new THREE.MeshLambertMaterial({ color: skin })
    );
    head.position.y = 0.72;
    g.add(head);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.11, 0.06, 8),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    cap.position.y = 0.83;
    g.add(cap);

    // Red stripe on cap
    const capCross = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    capCross.position.set(0, 0.85, 0.12);
    g.add(capCross);

    // Med bag
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.08),
      new THREE.MeshLambertMaterial({ color: 0xcc0000 })
    );
    bag.position.set(-0.14, 0.38, 0);
    g.add(bag);

    for (const s of [-0.06, 0.06]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.26, 0.08),
        new THREE.MeshLambertMaterial({ color: 0xdddddd })
      );
      leg.position.set(s, 0.15, 0);
      g.add(leg);
    }

    g.scale.setScalar(1.1);
    return g;
  }

  _createLitterMesh() {
    const g = new THREE.Group();
    const types = Math.floor(Math.random() * 3);
    if (types === 0) {
      // Cup
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.04, 0.12, 6),
        new THREE.MeshLambertMaterial({ color: 0xdddddd })
      );
      cup.position.y = 0.06;
      cup.rotation.x = Math.random() * 0.5;
      cup.rotation.z = Math.random() * Math.PI * 2;
      g.add(cup);
    } else if (types === 1) {
      // Wrapper / paper
      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.02, 0.08),
        new THREE.MeshLambertMaterial({ color: [0xffcc00, 0xff6600, 0x44aaff][Math.floor(Math.random() * 3)] })
      );
      paper.position.y = 0.01;
      paper.rotation.y = Math.random() * Math.PI;
      g.add(paper);
    } else {
      // Scattered bits
      for (let i = 0; i < 3; i++) {
        const bit = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.02, 0.04),
          new THREE.MeshLambertMaterial({ color: [0xaaaaaa, 0x996633, 0xffee88][i] })
        );
        bit.position.set((Math.random() - 0.5) * 0.15, 0.01, (Math.random() - 0.5) * 0.15);
        g.add(bit);
      }
    }
    return g;
  }

  // ─── Spawning ───

  spawnWorkers(staffManager) {
    this.clearWorkers();

    // Janitors from toilets/shower blocks with janitor staff
    const janitBuildings = this.world.placed.filter(
      e => e.data.id === 'toilets' || e.data.id === 'shower_block'
    );
    for (const b of janitBuildings) {
      const count = staffManager ? staffManager.getCount(b) : 0;
      if (count > 0) {
        this._spawnJanitor(b);
      }
    }

    // Medics from med tents with medic staff
    const medBuildings = this.world.placed.filter(e => e.data.id === 'med_tent');
    for (const b of medBuildings) {
      const count = staffManager ? staffManager.getCount(b) : 0;
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 2); i++) {
          this._spawnMedic(b, i);
        }
      }
    }
  }

  _spawnJanitor(building) {
    const mesh = this._createJanitorMesh();
    const x = building.gridX + (Math.random() - 0.5) * 2;
    const z = building.gridZ + building.sizeZ / 2 + 1;
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);

    this.janitors.push({
      mesh, building,
      state: WORKER_STATE.PATROLLING,
      target: null, targetLitter: null,
      timer: 0, phase: Math.random() * Math.PI * 2,
      homeX: x, homeZ: z, speed: 2.5,
      bubble: null, _bIcon: null
    });
  }

  _spawnMedic(building, idx) {
    const mesh = this._createMedicMesh();
    const angle = (idx / 2) * Math.PI - Math.PI * 0.25;
    const x = building.gridX + Math.sin(angle) * (building.sizeX * 0.5 + 1.2);
    const z = building.gridZ + building.sizeZ / 2 + 1;
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);

    this.medics.push({
      mesh, building,
      state: WORKER_STATE.PATROLLING,
      target: null, targetAtt: null,
      timer: 0, scanTimer: Math.random(),
      phase: Math.random() * Math.PI * 2,
      homeX: x, homeZ: z, speed: 3.0,
      bubble: null, _bIcon: null
    });
  }

  // ─── Movement helpers ───

  _move(worker, tx, tz, dt) {
    const d = this._tv;
    d.set(tx - worker.mesh.position.x, 0, tz - worker.mesh.position.z);
    const len = d.length();
    if (len < 0.5) return true;
    d.normalize();
    const step = worker.speed * dt;
    worker.mesh.position.x += d.x * step;
    worker.mesh.position.z += d.z * step;
    worker.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.007 + worker.phase)) * 0.03;
    worker.mesh.rotation.y = Math.atan2(d.x, d.z);
    return false;
  }

  _d2(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  _patrolPt(worker) {
    const b = worker.building;
    const r = Math.max(b.sizeX, b.sizeZ) + 10;
    return new THREE.Vector3(
      b.gridX + (Math.random() - 0.5) * r,
      0,
      b.gridZ + Math.random() * r * 0.5 + b.sizeZ / 2
    );
  }

  _setBubble(worker, icon, bg) {
    if (worker._bIcon === icon) return;
    const tex = _bubbleTex(icon, bg);
    if (!worker.bubble) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      worker.bubble = new THREE.Sprite(mat);
      worker.bubble.scale.set(0.45, 0.45, 1);
      worker.bubble.position.y = 1.1;
      worker.mesh.add(worker.bubble);
    } else {
      worker.bubble.material.map = tex;
      worker.bubble.material.needsUpdate = true;
    }
    worker.bubble.visible = true;
    worker._bIcon = icon;
  }

  _hideBubble(worker) {
    if (worker.bubble) worker.bubble.visible = false;
    worker._bIcon = null;
  }

  // ─── Litter spawning ───

  _spawnLitter(dt, crowd) {
    this._litterTimer += dt;
    if (this._litterTimer < LITTER_SPAWN_INTERVAL) return;
    this._litterTimer = 0;
    if (this.litter.length >= MAX_LITTER) return;

    // Litter spawns near food/bar buildings proportional to crowd size
    const litterSources = this.world.placed.filter(
      e => e.data.id === 'food_tent' || e.data.id === 'bar' || e.data.id === 'merch_stand' || e.data.id === 'vip_lounge'
    );
    if (litterSources.length === 0) return;

    // Chance scales with crowd
    const chance = Math.min(0.8, crowd.attendees.length / 150);
    if (Math.random() > chance) return;

    const src = litterSources[Math.floor(Math.random() * litterSources.length)];
    const mesh = this._createLitterMesh();
    const x = src.gridX + (Math.random() - 0.5) * LITTER_RADIUS_FROM_BUILDING * 2;
    const z = src.gridZ + src.sizeZ / 2 + Math.random() * LITTER_RADIUS_FROM_BUILDING;
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);
    this.litter.push({ mesh, x, z });
  }

  // ─── Satisfaction penalty from litter ───

  getLitterPenalty(crowd) {
    if (this.litter.length === 0) return 0;
    return this.litter.length * LITTER_SAT_PENALTY;
  }

  // ─── Janitor update ───

  _updateJanitors(dt) {
    for (const j of this.janitors) {
      switch (j.state) {
        case WORKER_STATE.PATROLLING: {
          this._setBubble(j, '🧹', 'rgba(30,100,40,0.92)');
          if (!j.target) j.target = this._patrolPt(j);
          if (this._move(j, j.target.x, j.target.z, dt)) {
            j.target = this._patrolPt(j);
          }
          // Scan for nearby litter
          let nearest = null, nearDist = LITTER_DETECT_RADIUS;
          for (const l of this.litter) {
            const d = this._d2(j.mesh.position, l.mesh.position);
            if (d < nearDist) { nearDist = d; nearest = l; }
          }
          if (nearest) {
            j.targetLitter = nearest;
            j.state = WORKER_STATE.MOVING_TO;
          }
          break;
        }

        case WORKER_STATE.MOVING_TO: {
          this._setBubble(j, '🚮', 'rgba(30,100,40,0.92)');
          const l = j.targetLitter;
          if (!l || !this.litter.includes(l)) {
            j.state = WORKER_STATE.PATROLLING;
            j.targetLitter = null;
            break;
          }
          if (this._move(j, l.x, l.z, dt)) {
            j.state = WORKER_STATE.WORKING;
            j.timer = 1.0;
          }
          break;
        }

        case WORKER_STATE.WORKING: {
          this._setBubble(j, '✨', 'rgba(30,100,40,0.92)');
          // Sweeping animation
          j.mesh.rotation.y += Math.sin(performance.now() * 0.015) * 0.02;
          j.timer -= dt;
          if (j.timer <= 0) {
            const l = j.targetLitter;
            if (l && this.litter.includes(l)) {
              this.scene.remove(l.mesh);
              const idx = this.litter.indexOf(l);
              if (idx !== -1) this.litter.splice(idx, 1);
              this.stats.litterCleaned++;
            }
            j.targetLitter = null;
            j.state = WORKER_STATE.PATROLLING;
            j.target = this._patrolPt(j);
          }
          break;
        }

        case WORKER_STATE.RETURNING: {
          this._hideBubble(j);
          if (this._move(j, j.homeX, j.homeZ, dt)) {
            j.state = WORKER_STATE.PATROLLING;
          }
          break;
        }
      }

      if (j.bubble && j.bubble.visible) {
        j.bubble.position.y = 1.05 + Math.sin(performance.now() * 0.003 + j.phase) * 0.03;
      }
    }
  }

  // ─── Medic update ───

  _updateMedics(dt, crowd) {
    for (const m of this.medics) {
      switch (m.state) {
        case WORKER_STATE.PATROLLING: {
          this._setBubble(m, '🩺', 'rgba(200,30,30,0.85)');
          if (!m.target) m.target = this._patrolPt(m);
          if (this._move(m, m.target.x, m.target.z, dt)) {
            m.target = this._patrolPt(m);
          }
          m.scanTimer -= dt;
          if (m.scanTimer <= 0) {
            m.scanTimer = MEDIC_SCAN_INTERVAL + Math.random() * 0.5;
            const att = this._scanForPatient(m, crowd);
            if (att) {
              m.targetAtt = att;
              m.state = WORKER_STATE.MOVING_TO;
            }
          }
          break;
        }

        case WORKER_STATE.MOVING_TO: {
          this._setBubble(m, '🚑', 'rgba(200,30,30,0.85)');
          const att = m.targetAtt;
          if (!att || att.state === 5) {
            m.state = WORKER_STATE.PATROLLING;
            m.targetAtt = null;
            break;
          }
          if (this._move(m, att.mesh.position.x, att.mesh.position.z, dt)) {
            m.state = WORKER_STATE.WORKING;
            m.timer = HEAL_TIME;
          }
          break;
        }

        case WORKER_STATE.WORKING: {
          this._setBubble(m, '💊', 'rgba(200,30,30,0.85)');
          m.timer -= dt;
          if (m.timer <= 0) {
            this._treatPatient(m);
            m.targetAtt = null;
            m.state = WORKER_STATE.RETURNING;
          }
          break;
        }

        case WORKER_STATE.ESCORTING: {
          this._setBubble(m, '🏥', 'rgba(200,30,30,0.85)');
          const att = m.targetAtt;
          if (!att || att.state === 5) {
            m.state = WORKER_STATE.RETURNING;
            m.targetAtt = null;
            break;
          }
          const med = m.building;
          const tx = med.gridX + (Math.random() - 0.5) * 0.3;
          const tz = med.gridZ + med.sizeZ / 2 + 0.8;
          if (this._move(m, tx, tz, dt)) {
            // Deliver patient
            att.state = 3; // USING
            att.targetEntry = med;
            att.useTimer = 3;
            att.mesh.position.set(med.gridX + (Math.random() - 0.5), 0, med.gridZ + med.sizeZ / 2 + 0.5);
            att.mesh.rotation.x = 0;
            att.mesh.rotation.z = 0;
            att.mesh.position.y = 0;
            att.drinks = Math.max(0, att.drinks - 2);
            att.needs.energy = Math.max(0, att.needs.energy - 30);
            att.satisfaction = Math.min(100, att.satisfaction + 10);
            this.stats.attendeesEscorted++;
            m.targetAtt = null;
            m.state = WORKER_STATE.PATROLLING;
            m.target = this._patrolPt(m);
          }
          // Move the patient along with the medic
          if (att && att.state !== 3 && att.state !== 5) {
            att.mesh.position.x += (m.mesh.position.x - att.mesh.position.x) * dt * 3;
            att.mesh.position.z += (m.mesh.position.z - att.mesh.position.z) * dt * 3;
          }
          break;
        }

        case WORKER_STATE.RETURNING: {
          this._hideBubble(m);
          if (this._move(m, m.homeX, m.homeZ, dt)) {
            m.state = WORKER_STATE.PATROLLING;
            m.target = this._patrolPt(m);
          }
          break;
        }
      }

      if (m.bubble && m.bubble.visible) {
        m.bubble.position.y = 1.05 + Math.sin(performance.now() * 0.003 + m.phase) * 0.03;
      }
    }
  }

  _scanForPatient(medic, crowd) {
    let best = null, bestP = Infinity;
    for (const att of crowd.attendees) {
      if (att.state === 5) continue; // leaving
      if (att._medicCooldown > 0) continue;
      const d = this._d2(medic.mesh.position, att.mesh.position);
      if (d > MEDIC_SCAN_RADIUS) continue;

      let p = d;
      if (att.state === 8) p -= 20; // PASSED_OUT — highest priority
      else if (att.intoxLevel === 'wasted') p -= 15;
      else if (att.needs.energy > 90) p -= 8;
      else continue;

      if (p < bestP) { bestP = p; best = att; }
    }
    if (best) best._medicCooldown = 30;
    return best;
  }

  _treatPatient(medic) {
    const att = medic.targetAtt;
    if (!att) return;

    if (att.state === 8) {
      // Passed out — pick them up and escort to med tent
      att.mesh.rotation.x = 0;
      att.mesh.rotation.z = 0;
      att.mesh.position.y = 0;
      medic.state = WORKER_STATE.ESCORTING;
      this.stats.attendeesHealed++;
      return;
    }

    if (att.intoxLevel === 'wasted') {
      // Escort wasted to med tent too
      medic.state = WORKER_STATE.ESCORTING;
      this.stats.attendeesHealed++;
      return;
    }

    // Low energy — quick field treatment
    att.needs.energy = Math.max(0, att.needs.energy - 20);
    att.satisfaction = Math.min(100, att.satisfaction + 5);
    this.stats.attendeesHealed++;
  }

  // ─── Main update ───

  update(dt, crowd, economy) {
    this._spawnLitter(dt, crowd);
    this._updateJanitors(dt);
    this._updateMedics(dt, crowd);
  }

  // ─── Cleanup ───

  clearWorkers() {
    for (const j of this.janitors) {
      if (j.bubble) { j.mesh.remove(j.bubble); j.bubble.material.dispose(); }
      this.scene.remove(j.mesh);
    }
    this.janitors.length = 0;

    for (const m of this.medics) {
      if (m.bubble) { m.mesh.remove(m.bubble); m.bubble.material.dispose(); }
      this.scene.remove(m.mesh);
    }
    this.medics.length = 0;
  }

  clear() {
    this.clearWorkers();
    for (const l of this.litter) this.scene.remove(l.mesh);
    this.litter.length = 0;
    this._litterTimer = 0;
    this.stats = { litterCleaned: 0, attendeesHealed: 0, attendeesEscorted: 0 };
  }

  getJanitorCount() { return this.janitors.length; }
  getMedicCount() { return this.medics.length; }
}
