import * as THREE from 'three';

const STAFF_TYPES = {
  vendor: {
    name: 'Vendor',
    icon: '👨‍🍳',
    salary: 200,
    buildings: ['food_tent', 'bar', 'merch_stand', 'vip_lounge'],
    effect: 'Faster service, +25% income'
  },
  security: {
    name: 'Security',
    icon: '💂',
    salary: 300,
    buildings: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage', 'entrance_gate'],
    effect: '+10 satisfaction per guard'
  },
  medic: {
    name: 'Medic',
    icon: '🩺',
    salary: 350,
    buildings: ['med_tent'],
    effect: 'Faster healing, +15 satisfaction'
  },
  janitor: {
    name: 'Janitor',
    icon: '🧹',
    salary: 150,
    buildings: ['toilets', 'shower_block'],
    effect: 'Faster service, reduces need buildup'
  },
  attendant: {
    name: 'Attendant',
    icon: '🎪',
    salary: 180,
    buildings: ['ferris_wheel', 'fountain', 'glamping_tent', 'hammock_grove', 'rv_spot', 'tent_large'],
    effect: 'Faster service, +5 satisfaction'
  }
};

const MAX_STAFF_PER_BUILDING = 3;

export class StaffManager {
  constructor(scene) {
    this.scene = scene;
    this.assignments = new Map();
    this._meshes = new Map();
  }

  getStaffTypeFor(buildingId) {
    for (const [type, def] of Object.entries(STAFF_TYPES)) {
      if (def.buildings.includes(buildingId)) return type;
    }
    return null;
  }

  getStaffDef(type) {
    return STAFF_TYPES[type] || null;
  }

  getCount(entry) {
    return this.assignments.get(entry) || 0;
  }

  getMaxStaff() {
    return MAX_STAFF_PER_BUILDING;
  }

  hire(entry) {
    const type = this.getStaffTypeFor(entry.data.id);
    if (!type) return false;
    const current = this.getCount(entry);
    if (current >= MAX_STAFF_PER_BUILDING) return false;
    this.assignments.set(entry, current + 1);
    this._updateVisuals(entry);
    return true;
  }

  fire(entry) {
    const current = this.getCount(entry);
    if (current <= 0) return false;
    const next = current - 1;
    if (next <= 0) this.assignments.delete(entry);
    else this.assignments.set(entry, next);
    this._updateVisuals(entry);
    return true;
  }

  getTotalSalary() {
    let total = 0;
    for (const [entry, count] of this.assignments) {
      const type = this.getStaffTypeFor(entry.data.id);
      if (type) total += STAFF_TYPES[type].salary * count;
    }
    return total;
  }

  getServiceSpeedMultiplier(entry) {
    const count = this.getCount(entry);
    if (count === 0) return 1;
    return 1 + count * 0.3;
  }

  getIncomeMultiplier(entry) {
    const count = this.getCount(entry);
    const type = this.getStaffTypeFor(entry.data.id);
    if (type !== 'vendor' || count === 0) return 1;
    return 1 + count * 0.25;
  }

  getSatisfactionBonus(entry) {
    const count = this.getCount(entry);
    if (count === 0) return 0;
    const type = this.getStaffTypeFor(entry.data.id);
    if (type === 'security') return count * 10;
    if (type === 'medic') return count * 15;
    if (type === 'attendant') return count * 5;
    return 0;
  }

  _updateVisuals(entry) {
    const existing = this._meshes.get(entry);
    if (existing) {
      for (const m of existing) this.scene.remove(m);
    }
    const count = this.getCount(entry);
    if (count === 0) {
      this._meshes.delete(entry);
      return;
    }
    const meshes = [];
    for (let i = 0; i < count; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.12),
        new THREE.MeshLambertMaterial({ color: 0xffaa00 })
      );
      body.position.y = 0.4;
      g.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 5),
        new THREE.MeshLambertMaterial({ color: 0xf5d0a9 })
      );
      head.position.y = 0.62;
      g.add(head);
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8),
        new THREE.MeshLambertMaterial({ color: 0xffaa00 })
      );
      hat.position.y = 0.72;
      g.add(hat);

      const angle = (i / Math.max(count, 1)) * Math.PI * 0.8 - Math.PI * 0.4;
      const radius = entry.sizeX * 0.5 + 1.2;
      g.position.set(
        entry.gridX + Math.sin(angle) * radius,
        0,
        entry.gridZ + entry.sizeZ * 0.5 + 0.8 + Math.cos(angle) * 0.5
      );
      g.rotation.y = Math.PI + angle;
      this.scene.add(g);
      meshes.push(g);
    }
    this._meshes.set(entry, meshes);
  }

  removeBuilding(entry) {
    this.assignments.delete(entry);
    const existing = this._meshes.get(entry);
    if (existing) {
      for (const m of existing) this.scene.remove(m);
      this._meshes.delete(entry);
    }
  }

  clear() {
    for (const [, meshes] of this._meshes) {
      for (const m of meshes) this.scene.remove(m);
    }
    this._meshes.clear();
  }

  toJSON() {
    const result = [];
    for (const [entry, count] of this.assignments) {
      result.push({ gx: entry.gridX, gz: entry.gridZ, count });
    }
    return result;
  }

  loadJSON(data, world) {
    if (!data) return;
    for (const s of data) {
      const entry = world.placed.find(e => e.gridX === s.gx && e.gridZ === s.gz);
      if (entry && s.count > 0) {
        this.assignments.set(entry, Math.min(s.count, MAX_STAFF_PER_BUILDING));
        this._updateVisuals(entry);
      }
    }
  }
}
