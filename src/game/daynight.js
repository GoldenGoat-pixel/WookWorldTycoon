import * as THREE from 'three';

export class DayNightCycle {
  constructor(scene, sun) {
    this.scene = scene;
    this.sun = sun;
    this.timeOfDay = 0.35; // Start at late morning (0=midnight, 0.5=noon, 1=midnight)
    this.speed = 0.002;     // Full day in ~8 minutes
    this.paused = false;
    this.locked = true;     // Lock to daytime during building; unlock during festival

    // Store original colors
    this._origFog = 0x87ceeb;

    // Stage lights that turn on at night
    this.stageLights = [];

    // Stars
    this._createStars();

    // Create time display inside the HUD top bar
    this._timeEl = document.createElement('div');
    this._timeEl.id = 'time-display';
    const hudTop = document.getElementById('hud-top');
    if (hudTop) {
      hudTop.appendChild(this._timeEl);
    } else {
      document.body.appendChild(this._timeEl);
    }
  }

  _createStars() {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 180;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 10;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0 });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  _getTimeString() {
    const hours24 = (this.timeOfDay * 24) % 24;
    const h = Math.floor(hours24);
    const m = Math.floor((hours24 - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  _getPeriodEmoji() {
    const h = (this.timeOfDay * 24) % 24;
    if (h >= 5 && h < 8) return '🌅';
    if (h >= 8 && h < 17) return '☀️';
    if (h >= 17 && h < 20) return '🌇';
    return '🌙';
  }

  lockToDay() {
    this.locked = true;
    this.timeOfDay = 0.35;
    this.update(0);
  }

  unlockCycle() {
    this.locked = false;
    this.timeOfDay = 0.3;
  }

  update(dt) {
    if (this.paused) return;
    if (this.locked) {
      this.timeOfDay = 0.35;
    } else {
      this.timeOfDay = (this.timeOfDay + this.speed * dt) % 1.0;
    }

    const t = this.timeOfDay;
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;

    // Sun position (arc across the sky)
    const sunHeight = Math.sin(sunAngle);
    this.sun.position.set(
      Math.cos(sunAngle) * 25,
      Math.max(0.5, sunHeight * 25 + 5),
      10
    );

    // Daylight factor (1 at noon, 0 at midnight)
    const daylight = Math.max(0, Math.min(1, sunHeight * 1.5 + 0.3));

    // Sun intensity
    this.sun.intensity = 0.3 + daylight * 0.7;

    // Sun color (warm at sunrise/sunset, white at noon)
    const sunColorFactor = Math.abs(sunHeight);
    const sunR = 1.0;
    const sunG = 0.85 + sunColorFactor * 0.15;
    const sunB = 0.7 + sunColorFactor * 0.3;
    this.sun.color.setRGB(sunR, sunG, sunB);

    // Ambient light
    const ambientScene = this.scene.children.find(c => c.isAmbientLight);
    if (ambientScene) {
      ambientScene.intensity = 0.35 + daylight * 0.35;
      const ambR = 0.55 + daylight * 0.45;
      const ambG = 0.55 + daylight * 0.45;
      const ambB = 0.6 + daylight * 0.4;
      ambientScene.color.setRGB(ambR, ambG, ambB);
    }

    // Sky color
    const skyR = Math.floor((0.18 + daylight * 0.35) * 255);
    const skyG = Math.floor((0.18 + daylight * 0.63) * 255);
    const skyB = Math.floor((0.25 + daylight * 0.67) * 255);
    const skyColor = (skyR << 16) | (skyG << 8) | skyB;

    this.scene.background = new THREE.Color(skyColor);
    if (this.scene.fog) {
      this.scene.fog.color.set(skyColor);
    }

    // Stars visibility
    const nightFactor = Math.max(0, 1 - daylight * 2);
    this.stars.material.opacity = nightFactor * 0.8;

    // Time display
    this._timeEl.textContent = `${this._getPeriodEmoji()} ${this._getTimeString()}`;
  }

  get isNight() {
    const h = (this.timeOfDay * 24) % 24;
    return h < 6 || h > 20;
  }

  get isDusk() {
    const h = (this.timeOfDay * 24) % 24;
    return (h >= 17 && h <= 20) || (h >= 5 && h <= 7);
  }
}
