import * as THREE from 'three';

const _v = new THREE.Vector3();

export class EffectsManager {
  constructor(scene) {
    this.scene = scene;
    this.rain = null;
    this.confetti = null;
    this.smokes = [];
    this.spotlights = [];
    this.ferrisWheels = [];
    this._eventId = null;
    this.dayNight = null;
  }

  setEventVisual(eventId) {
    if (eventId === this._eventId) return;
    this._clearEventEffects();
    this._eventId = eventId;
    if (eventId === 'rain' || eventId === 'mud') {
      this._createRain();
    } else if (eventId === 'surprise_guest' || eventId === 'golden_hour' || eventId === 'vip_arrival') {
      this._createConfetti();
    }
  }

  clearEventVisual() {
    this._clearEventEffects();
    this._eventId = null;
  }

  setupBuildingEffects(placed) {
    this._clearBuildingEffects();
    for (const entry of placed) {
      const id = entry.data.id;
      if (id === 'food_tent' || id === 'bar') {
        this._addSmoke(entry);
      }
      if (id === 'ferris_wheel') {
        this.ferrisWheels.push(entry);
      }
      if (['medium_stage', 'main_stage', 'dj_booth', 'mega_stage'].includes(id)) {
        this._addSpotlights(entry);
      }
    }
  }

  update(dt) {
    if (this.rain) this._updateRain(dt);
    if (this.confetti) this._updateConfetti(dt);
    this._updateSmokes(dt);
    this._updateSpotlights(dt);
    this._updateFerrisWheels(dt);
  }

  _createRain() {
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      vel[i] = 20 + Math.random() * 15;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8899bb,
      size: 0.3,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);
    this.rain = { mesh, vel, count };
  }

  _updateRain(dt) {
    const pos = this.rain.mesh.geometry.attributes.position;
    const arr = pos.array;
    for (let i = 0; i < this.rain.count; i++) {
      arr[i * 3 + 1] -= this.rain.vel[i] * dt;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 35 + Math.random() * 5;
        arr[i * 3] = (Math.random() - 0.5) * 120;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 120;
      }
    }
    pos.needsUpdate = true;
  }

  _createConfetti() {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const palette = [
      [1, 0.2, 0.3], [0.2, 0.8, 0.3], [0.3, 0.4, 1],
      [1, 0.9, 0.1], [1, 0.5, 0.1], [0.8, 0.2, 1]
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = 15 + Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
      vel[i * 3] = (Math.random() - 0.5) * 3;
      vel[i * 3 + 1] = -(1 + Math.random() * 2);
      vel[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);
    this.confetti = { mesh, vel, count };
  }

  _updateConfetti(dt) {
    const pos = this.confetti.mesh.geometry.attributes.position;
    const arr = pos.array;
    const vel = this.confetti.vel;
    for (let i = 0; i < this.confetti.count; i++) {
      arr[i * 3] += vel[i * 3] * dt;
      arr[i * 3 + 1] += vel[i * 3 + 1] * dt;
      arr[i * 3 + 2] += vel[i * 3 + 2] * dt;
      vel[i * 3] += (Math.random() - 0.5) * dt * 4;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3] = (Math.random() - 0.5) * 80;
        arr[i * 3 + 1] = 15 + Math.random() * 10;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
        vel[i * 3] = (Math.random() - 0.5) * 3;
        vel[i * 3 + 1] = -(1 + Math.random() * 2);
        vel[i * 3 + 2] = (Math.random() - 0.5) * 3;
      }
    }
    pos.needsUpdate = true;
  }

  _addSmoke(entry) {
    const count = 12;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const ages = new Float32Array(count);
    const cx = entry.gridX;
    const cz = entry.gridZ;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = cx + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = 3 + Math.random() * 2;
      pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 1.5;
      ages[i] = Math.random() * 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.8,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });
    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);
    this.smokes.push({ mesh, ages, count, cx, cz });
  }

  _updateSmokes(dt) {
    for (const s of this.smokes) {
      const pos = s.mesh.geometry.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < s.count; i++) {
        s.ages[i] += dt;
        arr[i * 3 + 1] += dt * 0.8;
        arr[i * 3] += (Math.random() - 0.5) * dt * 0.3;
        if (s.ages[i] > 3) {
          s.ages[i] = 0;
          arr[i * 3] = s.cx + (Math.random() - 0.5) * 1.5;
          arr[i * 3 + 1] = 3;
          arr[i * 3 + 2] = s.cz + (Math.random() - 0.5) * 1.5;
        }
      }
      s.mesh.material.opacity = 0.25;
      pos.needsUpdate = true;
    }
  }

  _addSpotlights(entry) {
    const cx = entry.gridX;
    const cz = entry.gridZ;
    const colors = [0xff3366, 0x3366ff, 0x33ff66, 0xffcc00];
    for (let i = 0; i < 2; i++) {
      const light = new THREE.PointLight(colors[i % colors.length], 0.5, 15);
      light.position.set(cx + (i === 0 ? -2 : 2), 5, cz);
      this.scene.add(light);
      this.spotlights.push({
        light,
        baseX: light.position.x,
        baseZ: light.position.z,
        colorIdx: i,
        colors,
        time: Math.random() * 10
      });
    }
  }

  _updateSpotlights(dt) {
    const nightBoost = this.dayNight ? Math.max(0, 1 - this.dayNight.timeOfDay * 2.5 + 0.5) : 0;
    for (const s of this.spotlights) {
      s.time += dt;
      const idx = Math.floor(s.time * 0.5) % s.colors.length;
      s.light.color.setHex(s.colors[(idx + s.colorIdx) % s.colors.length]);
      const base = 0.4 + Math.sin(s.time * 3) * 0.2;
      s.light.intensity = base + nightBoost * 0.6;
    }
  }

  _updateFerrisWheels(dt) {
    for (const entry of this.ferrisWheels) {
      const wheel = entry.mesh.children.find(c => c.userData.ferrisWheel);
      if (wheel) {
        wheel.rotation.z += dt * 0.3;
      }
    }
  }

  _clearEventEffects() {
    if (this.rain) {
      this.scene.remove(this.rain.mesh);
      this.rain.mesh.geometry.dispose();
      this.rain.mesh.material.dispose();
      this.rain = null;
    }
    if (this.confetti) {
      this.scene.remove(this.confetti.mesh);
      this.confetti.mesh.geometry.dispose();
      this.confetti.mesh.material.dispose();
      this.confetti = null;
    }
  }

  _clearBuildingEffects() {
    for (const s of this.smokes) {
      this.scene.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    }
    this.smokes = [];
    for (const s of this.spotlights) {
      this.scene.remove(s.light);
    }
    this.spotlights = [];
    this.ferrisWheels = [];
  }

  dispose() {
    this._clearEventEffects();
    this._clearBuildingEffects();
  }
}
