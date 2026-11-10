import * as THREE from 'three';

const GRID_SIZE = 120;
const CELL = 1;

export class World {
  constructor(scene) {
    this.scene = scene;
    this.gridSize = GRID_SIZE;
    this.placed = [];
    this.occupied = new Set();
    this.walkable = new Set();
    this.ghostMesh = null;

    this._buildGround();
    this._buildGrid();
    this._buildTerrain();
  }

  _buildGround() {
    // Main festival field
    const geo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    const mat = new THREE.MeshLambertMaterial({ color: 0x3a7a3a });
    this.ground = new THREE.Mesh(geo, mat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.ground.name = 'ground';
    this.scene.add(this.ground);

    // Surrounding terrain (extends way past the grid for immersion)
    const outerGeo = new THREE.PlaneGeometry(400, 400);
    const outerMat = new THREE.MeshLambertMaterial({ color: 0x2d5e2d });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.02;
    this.scene.add(outer);

    // Zone markers on the ground (subtle colored patches)
    this._addZoneMarker(0, -20, 30, 20, 0x3d7d3d);    // main stage area (front-center)
    this._addZoneMarker(0, 35, 50, 30, 0x4a6e35);      // campground area (back)
    this._addZoneMarker(-35, 5, 20, 20, 0x3a7d42);     // secondary stage area (left)
    this._addZoneMarker(35, 5, 20, 20, 0x3a7d42);      // secondary stage area (right)
  }

  _addZoneMarker(x, z, w, d, color) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.003, z);
    this.scene.add(mesh);
  }

  _buildGrid() {
    const half = GRID_SIZE / 2;
    const points = [];
    // Draw grid lines less densely for the big map (every 2 cells)
    const step = GRID_SIZE > 80 ? 2 : CELL;
    for (let i = -half; i <= half; i += step) {
      points.push(new THREE.Vector3(i, 0.005, -half));
      points.push(new THREE.Vector3(i, 0.005, half));
      points.push(new THREE.Vector3(-half, 0.005, i));
      points.push(new THREE.Vector3(half, 0.005, i));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });
    this.gridLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.gridLines);
  }

  _buildTerrain() {
    const half = GRID_SIZE / 2;

    // Treeline around the perimeter
    const treeMat = new THREE.MeshLambertMaterial({ color: 0x1e5a1e });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
    const darkTreeMat = new THREE.MeshLambertMaterial({ color: 0x1a4a1a });

    for (let i = 0; i < 300; i++) {
      const side = Math.floor(Math.random() * 4);
      let tx, tz;
      const margin = 5 + Math.random() * 20;

      switch (side) {
        case 0: tx = -half - margin; tz = (Math.random() - 0.5) * GRID_SIZE * 1.5; break;
        case 1: tx = half + margin; tz = (Math.random() - 0.5) * GRID_SIZE * 1.5; break;
        case 2: tx = (Math.random() - 0.5) * GRID_SIZE * 1.5; tz = -half - margin; break;
        default: tx = (Math.random() - 0.5) * GRID_SIZE * 1.5; tz = half + margin; break;
      }

      const treeGroup = new THREE.Group();
      const height = 2 + Math.random() * 4;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, height * 0.4),
        trunkMat
      );
      trunk.position.y = height * 0.2;
      treeGroup.add(trunk);

      // Varied tree shapes
      if (Math.random() < 0.6) {
        // Cone tree (pine)
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(0.8 + Math.random() * 0.6, height * 0.7, 6),
          Math.random() < 0.5 ? treeMat : darkTreeMat
        );
        foliage.position.y = height * 0.6;
        treeGroup.add(foliage);
      } else {
        // Round tree
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(0.7 + Math.random() * 0.5, 6, 5),
          Math.random() < 0.5 ? treeMat : darkTreeMat
        );
        foliage.position.y = height * 0.55;
        treeGroup.add(foliage);
      }

      treeGroup.position.set(tx, 0, tz);
      treeGroup.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(treeGroup);
    }

    // Scattered trees inside the grid edges for that forest-festival feel
    for (let i = 0; i < 40; i++) {
      const edge = Math.random() < 0.5;
      let tx, tz;
      if (edge) {
        tx = (Math.random() < 0.5 ? -1 : 1) * (half - 2 - Math.random() * 8);
        tz = (Math.random() - 0.5) * GRID_SIZE;
      } else {
        tx = (Math.random() - 0.5) * GRID_SIZE;
        tz = (Math.random() < 0.5 ? -1 : 1) * (half - 2 - Math.random() * 8);
      }

      const treeGroup = new THREE.Group();
      const height = 2 + Math.random() * 2.5;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.1, height * 0.4),
        trunkMat
      );
      trunk.position.y = height * 0.2;
      treeGroup.add(trunk);
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 6, 5),
        treeMat
      );
      foliage.position.y = height * 0.5;
      treeGroup.add(foliage);
      treeGroup.position.set(tx, 0, tz);
      this.scene.add(treeGroup);

      // Block these cells so you can't build on top of trees
      const gx = Math.round(tx);
      const gz = Math.round(tz);
      this.occupied.add(`${gx},${gz}`);
    }

    // Zone label signs (3D signs sticking up from the ground)
    this._addZoneSign(0, -30, 'MAIN STAGE FIELD', 0xffcc00);
    this._addZoneSign(0, 48, 'CAMPGROUNDS', 0x88cc44);
    this._addZoneSign(-40, 5, 'WEST STAGE', 0x44aaff);
    this._addZoneSign(40, 5, 'EAST STAGE', 0xff8844);
    this._addZoneSign(0, 10, 'VENDOR ROW', 0xff66aa);
  }

  _addZoneSign(x, z, text, color) {
    const group = new THREE.Group();
    // Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2),
      new THREE.MeshLambertMaterial({ color: 0x8b6b3e })
    );
    post.position.y = 1;
    group.add(post);
    // Sign board
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(text.length * 0.25, 0.5, 0.05),
      new THREE.MeshBasicMaterial({ color })
    );
    sign.position.y = 2.2;
    group.add(sign);
    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  snapToGrid(worldX, worldZ) {
    const half = this.gridSize / 2;
    const x = Math.round(worldX);
    const z = Math.round(worldZ);
    return [
      Math.max(-half + 1, Math.min(half - 1, x)),
      Math.max(-half + 1, Math.min(half - 1, z))
    ];
  }

  canPlace(gx, gz, sizeX, sizeZ) {
    const half = this.gridSize / 2;
    for (let dx = 0; dx < sizeX; dx++) {
      for (let dz = 0; dz < sizeZ; dz++) {
        const cx = gx + dx - Math.floor(sizeX / 2);
        const cz = gz + dz - Math.floor(sizeZ / 2);
        if (cx < -half || cx >= half || cz < -half || cz >= half) return false;
        if (this.occupied.has(`${cx},${cz}`)) return false;
      }
    }
    return true;
  }

  place(gx, gz, building, rotation = 0) {
    const [sizeX, sizeZ] = building.size;
    if (!this.canPlace(gx, gz, sizeX, sizeZ)) return null;

    const mesh = building.build(gx, gz);
    mesh.rotation.y = rotation;
    this.scene.add(mesh);

    const isPath = building.id === 'path' || building.id === 'paved_path';
    for (let dx = 0; dx < sizeX; dx++) {
      for (let dz = 0; dz < sizeZ; dz++) {
        const cx = gx + dx - Math.floor(sizeX / 2);
        const cz = gz + dz - Math.floor(sizeZ / 2);
        this.occupied.add(`${cx},${cz}`);
        if (isPath) this.walkable.add(`${cx},${cz}`);
      }
    }

    const entry = { id: building.id, mesh, gridX: gx, gridZ: gz, sizeX, sizeZ, rotation, data: building, upgrades: [] };
    this.placed.push(entry);
    return entry;
  }

  addUpgrade(entry, upgrade) {
    if (entry.upgrades.some(u => u.id === upgrade.id)) return false;
    const mesh = upgrade.build(entry);
    mesh.position.set(entry.gridX, 0, entry.gridZ);
    mesh.rotation.y = entry.rotation;
    this.scene.add(mesh);
    entry.upgrades.push({ id: upgrade.id, mesh });
    return true;
  }

  remove(entry) {
    const idx = this.placed.indexOf(entry);
    if (idx === -1) return;
    this.scene.remove(entry.mesh);
    for (const u of entry.upgrades) {
      this.scene.remove(u.mesh);
    }
    for (let dx = 0; dx < entry.sizeX; dx++) {
      for (let dz = 0; dz < entry.sizeZ; dz++) {
        const cx = entry.gridX + dx - Math.floor(entry.sizeX / 2);
        const cz = entry.gridZ + dz - Math.floor(entry.sizeZ / 2);
        this.occupied.delete(`${cx},${cz}`);
        this.walkable.delete(`${cx},${cz}`);
      }
    }
    this.placed.splice(idx, 1);
  }

  findAtGrid(gx, gz) {
    return this.placed.find(entry => {
      for (let dx = 0; dx < entry.sizeX; dx++) {
        for (let dz = 0; dz < entry.sizeZ; dz++) {
          const cx = entry.gridX + dx - Math.floor(entry.sizeX / 2);
          const cz = entry.gridZ + dz - Math.floor(entry.sizeZ / 2);
          if (cx === gx && cz === gz) return true;
        }
      }
      return false;
    });
  }

  showGhost(gx, gz, building, rotation = 0) {
    this.clearGhost();
    const mesh = building.build(gx, gz);
    mesh.rotation.y = rotation;
    const canPlace = this.canPlace(gx, gz, building.size[0], building.size[1]);

    mesh.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.5;
        child.material.color.set(canPlace ? 0x44ff88 : 0xff4444);
      }
    });

    this.ghostMesh = mesh;
    this.scene.add(mesh);
  }

  clearGhost() {
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      this.ghostMesh = null;
    }
  }

  toJSON() {
    return this.placed.map(e => ({
      id: e.id,
      x: e.gridX,
      z: e.gridZ,
      rotation: e.rotation,
      upgrades: e.upgrades.map(u => u.id)
    }));
  }
}
