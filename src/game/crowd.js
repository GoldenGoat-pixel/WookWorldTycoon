import * as THREE from 'three';

const SKIN_TONES = [0xf5d0a9, 0xd4a574, 0xc68642, 0x8d5524, 0x6b3a2a, 0xffe0bd];
const SHIRT_COLORS = [0xe05050, 0x5050e0, 0x50b050, 0xe0e050, 0xff8800, 0xcc44cc, 0x44cccc, 0xffffff, 0x222222, 0xff69b4];
const HAT_COLORS = [0x000000, 0xe05050, 0x3366cc, 0xffcc00, 0x33cc33];

export class CrowdSystem {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.npcs = [];
    this.maxNPCs = 500;
    this.spawnTimer = 0;
    this.pool = [];
  }

  _createNPC() {
    const group = new THREE.Group();
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    const shirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.35, 0.15),
      new THREE.MeshLambertMaterial({ color: shirt })
    );
    body.position.y = 0.45;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      new THREE.MeshLambertMaterial({ color: skin })
    );
    head.position.y = 0.72;
    group.add(head);

    // Legs
    for (const s of [-0.06, 0.06]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.25, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x334466 })
      );
      leg.position.set(s, 0.15, 0);
      group.add(leg);
    }

    // Random hat (30% chance)
    if (Math.random() < 0.3) {
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8),
        new THREE.MeshLambertMaterial({ color: HAT_COLORS[Math.floor(Math.random() * HAT_COLORS.length)] })
      );
      hat.position.y = 0.83;
      group.add(hat);
    }

    // Random glow stick (20% chance, shows at night)
    if (Math.random() < 0.2) {
      const glow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2),
        new THREE.MeshBasicMaterial({ color: [0x00ff88, 0xff00ff, 0x00ffff, 0xffff00][Math.floor(Math.random() * 4)] })
      );
      glow.position.set(0.15, 0.5, 0);
      glow.rotation.z = Math.PI / 6;
      glow.name = 'glowstick';
      group.add(glow);
    }

    return group;
  }

  _pickTarget() {
    if (this.world.placed.length === 0) return null;

    // Bias toward stages and facilities
    const interesting = this.world.placed.filter(e =>
      e.data.capacity || e.data.income
    );
    const pool = interesting.length > 0 ? interesting : this.world.placed;
    const entry = pool[Math.floor(Math.random() * pool.length)];

    const offsetX = (Math.random() - 0.5) * (entry.sizeX + 3);
    const offsetZ = (Math.random() - 0.5) * (entry.sizeZ + 3);

    return new THREE.Vector3(
      entry.gridX + offsetX,
      0,
      entry.gridZ + offsetZ + 2
    );
  }

  _spawnNPC() {
    if (this.world.placed.length === 0) return;

    const mesh = this.pool.length > 0 ? this.pool.pop() : this._createNPC();
    const half = this.world.gridSize / 2;
    const edge = Math.floor(Math.random() * 4);
    let x, z;
    switch (edge) {
      case 0: x = -half; z = (Math.random() - 0.5) * half * 2; break;
      case 1: x = half; z = (Math.random() - 0.5) * half * 2; break;
      case 2: x = (Math.random() - 0.5) * half * 2; z = -half; break;
      default: x = (Math.random() - 0.5) * half * 2; z = half; break;
    }

    mesh.position.set(x, 0, z);
    this.scene.add(mesh);

    const target = this._pickTarget();
    if (!target) { this.pool.push(mesh); return; }

    const npc = {
      mesh,
      target,
      speed: 1.5 + Math.random() * 1.5,
      waitTime: 0,
      maxWait: 3 + Math.random() * 8,
      state: 'walking', // walking, waiting, dancing, leaving
      dancePhase: Math.random() * Math.PI * 2,
      lifetime: 30 + Math.random() * 60
    };

    this.npcs.push(npc);
  }

  update(dt, targetCount) {
    this.spawnTimer -= dt;

    // Spawn NPCs up to target
    const desired = Math.min(targetCount, this.maxNPCs);
    if (this.npcs.length < desired && this.spawnTimer <= 0) {
      this._spawnNPC();
      this.spawnTimer = 0.3;
    }

    // Remove excess
    while (this.npcs.length > desired + 10) {
      const npc = this.npcs.pop();
      this.scene.remove(npc.mesh);
      this.pool.push(npc.mesh);
    }

    for (let i = this.npcs.length - 1; i >= 0; i--) {
      const npc = this.npcs[i];
      npc.lifetime -= dt;

      if (npc.lifetime <= 0 && npc.state !== 'leaving') {
        npc.state = 'leaving';
        const half = this.world.gridSize / 2;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: npc.target = new THREE.Vector3(-half - 2, 0, npc.mesh.position.z); break;
          case 1: npc.target = new THREE.Vector3(half + 2, 0, npc.mesh.position.z); break;
          case 2: npc.target = new THREE.Vector3(npc.mesh.position.x, 0, -half - 2); break;
          default: npc.target = new THREE.Vector3(npc.mesh.position.x, 0, half + 2); break;
        }
      }

      if (npc.state === 'walking' || npc.state === 'leaving') {
        const dir = new THREE.Vector3().subVectors(npc.target, npc.mesh.position);
        dir.y = 0;
        const dist = dir.length();

        if (dist < 0.5) {
          if (npc.state === 'leaving') {
            this.scene.remove(npc.mesh);
            this.pool.push(npc.mesh);
            this.npcs.splice(i, 1);
            continue;
          }
          npc.state = Math.random() < 0.6 ? 'dancing' : 'waiting';
          npc.waitTime = 0;
        } else {
          dir.normalize();
          npc.mesh.position.addScaledVector(dir, npc.speed * dt);
          npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);

          // Bob while walking
          npc.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.008)) * 0.04;
        }
      } else if (npc.state === 'dancing') {
        npc.dancePhase += dt * 4;
        npc.mesh.position.y = Math.abs(Math.sin(npc.dancePhase)) * 0.08;
        npc.mesh.rotation.y += Math.sin(npc.dancePhase * 0.5) * 0.03;
        npc.waitTime += dt;
        if (npc.waitTime > npc.maxWait) {
          npc.state = 'walking';
          npc.target = this._pickTarget() || npc.target;
          npc.maxWait = 3 + Math.random() * 8;
        }
      } else if (npc.state === 'waiting') {
        npc.waitTime += dt;
        if (npc.waitTime > npc.maxWait * 0.5) {
          npc.state = 'walking';
          npc.target = this._pickTarget() || npc.target;
          npc.maxWait = 3 + Math.random() * 8;
        }
      }
    }
  }
}
