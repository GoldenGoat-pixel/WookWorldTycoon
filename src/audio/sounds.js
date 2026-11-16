export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
    this.musicPlaying = false;
    this._bassOsc = null;
    this._padOsc = null;
    this._hihatInterval = null;

    // Festival ambience refs
    this._festBassOsc = null;
    this._festBassGain = null;
    this._festPadOsc = null;
    this._festPadGain = null;
    this._festMurmurInterval = null;
    this._festPadNoteIndex = 0;
    this._festPadInterval = null;
    this._stageLayers = [];
    this._crowdRumbleSource = null;
    this._crowdRumbleGain = null;
    this._crowdReactionInterval = null;
    this._lastCrowdSize = 0;
    this._lastSatisfaction = 50;

    // Weather ambience refs
    this._rainSource = null;
    this._rainGain = null;
    this._windSource = null;
    this._windGain = null;

    // Forest ambience refs
    this._forestWindSource = null;
    this._forestWindGain = null;
    this._forestBirdInterval = null;

    document.addEventListener('pointerdown', () => this._init(), { once: true });
    document.addEventListener('keydown', () => this._init(), { once: true });
  }

  _init() {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.15;
    this.musicGain.connect(this.masterGain);

    this.initialized = true;
  }

  setMasterVolume(v) {
    if (this.masterGain) this.masterGain.gain.value = v * 0.3;
  }

  _makeNoiseBuffer(duration) {
    const len = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playPlace() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain).connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBulldoze() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain).connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playError() {
    if (!this.initialized) return;
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const t = this.ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(200, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  playSelect() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain).connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playCashRegister() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 400, t + i * 0.08);
      gain.gain.setValueAtTime(0.2, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.12);
    }
  }

  // --- Crowd cheering ---
  playCrowdCheer() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    const centerFreq = 1000 + Math.random() * 800;
    const duration = 1.2 + Math.random() * 0.6;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._makeNoiseBuffer(duration);

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = centerFreq;
    bp.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
    gain.gain.setValueAtTime(0.12, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(bp).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + duration);
  }

  // --- Festival ambience (hosting phase) ---
  startFestivalAmbience(stages) {
    if (!this.initialized) return;
    this.stopFestivalAmbience();

    // Deep bass pulse
    this._festBassOsc = this.ctx.createOscillator();
    this._festBassGain = this.ctx.createGain();
    this._festBassOsc.type = 'sine';
    this._festBassOsc.frequency.value = 65;
    this._festBassGain.gain.value = 0.12;
    this._festBassOsc.connect(this._festBassGain).connect(this.musicGain);
    this._festBassOsc.start();

    // Shifting pad (C3 → E3 → G3 → C3)
    const padNotes = [130.81, 164.81, 196.00, 130.81];
    this._festPadOsc = this.ctx.createOscillator();
    this._festPadGain = this.ctx.createGain();
    this._festPadOsc.type = 'sine';
    this._festPadOsc.frequency.value = padNotes[0];
    this._festPadGain.gain.value = 0.07;
    this._festPadOsc.connect(this._festPadGain).connect(this.musicGain);
    this._festPadOsc.start();

    this._festPadNoteIndex = 0;
    this._festPadInterval = setInterval(() => {
      if (!this._festPadOsc) return;
      this._festPadNoteIndex = (this._festPadNoteIndex + 1) % padNotes.length;
      const target = padNotes[this._festPadNoteIndex];
      this._festPadOsc.frequency.exponentialRampToValueAtTime(target, this.ctx.currentTime + 2);
    }, 8000);

    // Crowd murmur bursts
    this._festMurmurInterval = setInterval(() => {
      if (!this.initialized) return;
      const t = this.ctx.currentTime;
      const dur = 0.8 + Math.random() * 0.6;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._makeNoiseBuffer(dur);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 600 + Math.random() * 400;
      bp.Q.value = 0.8;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(bp).connect(gain).connect(this.musicGain);
      noise.start(t);
      noise.stop(t + dur);
    }, 5000 + Math.random() * 3000);

    // Stage-specific music layers
    if (stages && stages.length > 0) {
      this._startStageMusicLayers(stages);
    }
  }

  _startStageMusicLayers(stages) {
    const seen = new Set();
    for (const entry of stages) {
      const id = entry.data.id;
      if (seen.has(id)) continue;
      seen.add(id);

      switch (id) {
        case 'medium_stage': this._layerMediumStage(); break;
        case 'main_stage': this._layerMainStage(); break;
        case 'dj_booth': this._layerDJBooth(); break;
        case 'acoustic_tent': this._layerAcousticTent(); break;
        case 'mega_stage':
          this._layerMediumStage(0.05);
          this._layerMainStage(0.05);
          this._layerDJBooth(0.04);
          this._layerAcousticTent(0.04);
          this._layerMegaSweep();
          break;
      }
    }
  }

  _layerMediumStage(vol = 0.04) {
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = pentatonic[0];
    gain.gain.value = vol;
    osc.connect(gain).connect(this.musicGain);
    osc.start();

    let idx = 0;
    const iv = setInterval(() => {
      if (!osc.frequency) return;
      idx = (idx + 1) % pentatonic.length;
      try {
        osc.frequency.exponentialRampToValueAtTime(pentatonic[idx], this.ctx.currentTime + 0.15);
      } catch {}
    }, 800 + Math.random() * 400);

    this._stageLayers.push({ osc, gain, interval: iv });
  }

  _layerMainStage(vol = 0.04) {
    // Driving bass note
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 82.41; // E2
    gain.gain.value = vol;
    osc.connect(gain).connect(this.musicGain);
    osc.start();
    this._stageLayers.push({ osc, gain });

    // Kick drum pattern
    const iv = setInterval(() => {
      if (!this.initialized) return;
      const t = this.ctx.currentTime;
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, t);
      kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      kickGain.gain.setValueAtTime(0.06, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      kickOsc.connect(kickGain).connect(this.musicGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.12);
    }, 500);
    this._stageLayers.push({ interval: iv });
  }

  _layerDJBooth(vol = 0.035) {
    // Wobble bass with LFO
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 110;
    lfo.type = 'sine';
    lfo.frequency.value = 3;
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.value = vol;
    osc.connect(gain).connect(this.musicGain);
    osc.start();
    lfo.start();
    this._stageLayers.push({ osc, gain, extra: [lfo, lfoGain] });

    // Fast hi-hats
    const iv = setInterval(() => {
      if (!this.initialized) return;
      const t = this.ctx.currentTime;
      const bufLen = Math.floor(this.ctx.sampleRate * 0.02);
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 9000;
      const g = this.ctx.createGain();
      g.gain.value = 0.03;
      src.connect(hp).connect(g).connect(this.musicGain);
      src.start(t);
    }, 250);
    this._stageLayers.push({ interval: iv });
  }

  _layerAcousticTent(vol = 0.035) {
    const notes = [523.25, 659.25, 783.99, 659.25, 523.25, 440.00]; // C5 E5 G5 E5 C5 A4
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[0];
    gain.gain.value = vol;
    osc.connect(gain).connect(this.musicGain);
    osc.start();

    let idx = 0;
    const iv = setInterval(() => {
      if (!osc.frequency) return;
      idx = (idx + 1) % notes.length;
      try {
        osc.frequency.exponentialRampToValueAtTime(notes[idx], this.ctx.currentTime + 0.3);
      } catch {}
    }, 1200);

    this._stageLayers.push({ osc, gain, interval: iv });
  }

  _layerMegaSweep() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 30;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(this.musicGain);
    osc.start();

    const iv = setInterval(() => {
      if (!osc.frequency) return;
      try {
        const t = this.ctx.currentTime;
        osc.frequency.setValueAtTime(30, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 3);
        osc.frequency.exponentialRampToValueAtTime(30, t + 6);
      } catch {}
    }, 6000);

    this._stageLayers.push({ osc, gain, interval: iv });
  }

  _stopStageLayers() {
    for (const layer of this._stageLayers) {
      if (layer.osc) { try { layer.osc.stop(); } catch {} }
      if (layer.extra) {
        for (const node of layer.extra) {
          if (node.stop) { try { node.stop(); } catch {} }
        }
      }
      if (layer.interval) clearInterval(layer.interval);
    }
    this._stageLayers.length = 0;
  }

  // --- Dynamic crowd ambience ---
  updateCrowdAmbience(crowdSize, satisfaction) {
    if (!this.initialized) return;
    this._lastCrowdSize = crowdSize;
    this._lastSatisfaction = satisfaction;

    // Adjust murmur interval based on crowd size
    if (this._festMurmurInterval) {
      clearInterval(this._festMurmurInterval);
      const baseInterval = Math.max(1500, 5000 - crowdSize * 15);
      this._festMurmurInterval = setInterval(() => {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const dur = 0.8 + Math.random() * 0.6;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._makeNoiseBuffer(dur);
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 600 + Math.random() * 400;
        bp.Q.value = 0.8;
        const vol = Math.min(0.07, 0.02 + crowdSize * 0.0002);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(bp).connect(gain).connect(this.musicGain);
        noise.start(t);
        noise.stop(t + dur);
      }, baseInterval + Math.random() * 1000);
    }

    // Crowd rumble for large crowds
    if (crowdSize > 200 && !this._crowdRumbleSource) {
      const buf = this._makeNoiseBuffer(4);
      this._crowdRumbleSource = this.ctx.createBufferSource();
      this._crowdRumbleSource.buffer = buf;
      this._crowdRumbleSource.loop = true;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 200;
      this._crowdRumbleGain = this.ctx.createGain();
      this._crowdRumbleGain.gain.value = 0.03;
      this._crowdRumbleSource.connect(lp).connect(this._crowdRumbleGain).connect(this.musicGain);
      this._crowdRumbleSource.start();
    } else if (crowdSize <= 150 && this._crowdRumbleSource) {
      try { this._crowdRumbleSource.stop(); } catch {}
      this._crowdRumbleSource = null;
      this._crowdRumbleGain = null;
    }

    // Scale rumble volume with crowd
    if (this._crowdRumbleGain) {
      this._crowdRumbleGain.gain.value = Math.min(0.06, 0.02 + (crowdSize - 200) * 0.0001);
    }

    // Crowd reactions based on satisfaction
    if (!this._crowdReactionInterval) {
      this._crowdReactionInterval = setInterval(() => {
        if (!this.initialized) return;
        const sat = this._lastSatisfaction;
        const size = this._lastCrowdSize;
        if (size < 20) return;

        if (sat > 70 && Math.random() < 0.4) {
          this._playWoo();
        } else if (sat < 40 && Math.random() < 0.3) {
          this._playBoo();
        }
      }, 4000 + Math.random() * 3000);
    }
  }

  _playWoo() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const base = 400 + Math.random() * 200;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 2.2, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(base * 1.8, t + 0.3);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  _playBoo() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  stopFestivalAmbience() {
    if (this._festBassOsc) { try { this._festBassOsc.stop(); } catch {} this._festBassOsc = null; }
    this._festBassGain = null;
    if (this._festPadOsc) { try { this._festPadOsc.stop(); } catch {} this._festPadOsc = null; }
    this._festPadGain = null;
    if (this._festPadInterval) { clearInterval(this._festPadInterval); this._festPadInterval = null; }
    if (this._festMurmurInterval) { clearInterval(this._festMurmurInterval); this._festMurmurInterval = null; }
    this._stopStageLayers();
    if (this._crowdRumbleSource) { try { this._crowdRumbleSource.stop(); } catch {} this._crowdRumbleSource = null; }
    this._crowdRumbleGain = null;
    if (this._crowdReactionInterval) { clearInterval(this._crowdReactionInterval); this._crowdReactionInterval = null; }
  }

  // --- Weather / event sounds ---
  playRainAmbience() {
    if (!this.initialized || this._rainSource) return;
    const buf = this._makeNoiseBuffer(4);
    this._rainSource = this.ctx.createBufferSource();
    this._rainSource.buffer = buf;
    this._rainSource.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.6;
    this._rainGain = this.ctx.createGain();
    this._rainGain.gain.value = 0.04;
    this._rainSource.connect(bp).connect(this._rainGain).connect(this.musicGain);
    this._rainSource.start();
  }

  stopRainAmbience() {
    if (this._rainSource) { try { this._rainSource.stop(); } catch {} this._rainSource = null; }
    this._rainGain = null;
  }

  playWindSound() {
    if (!this.initialized || this._windSource) return;
    const buf = this._makeNoiseBuffer(4);
    this._windSource = this.ctx.createBufferSource();
    this._windSource.buffer = buf;
    this._windSource.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 0.8;
    this._windGain = this.ctx.createGain();
    this._windGain.gain.value = 0.05;
    this._windSource.connect(bp).connect(this._windGain).connect(this.musicGain);
    this._windSource.start();
  }

  stopWindSound() {
    if (this._windSource) { try { this._windSource.stop(); } catch {} this._windSource = null; }
    this._windGain = null;
  }

  playThunderClap() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;

    // Low rumble noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._makeNoiseBuffer(1.5);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.15, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    noise.connect(lp).connect(nGain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 1.5);

    // Descending sine sweep
    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);
    oGain.gain.setValueAtTime(0.1, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(oGain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.8);
  }

  // --- Vendor sale chime ---
  playVendorSale() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.setValueAtTime(2200, t + 0.04);
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // --- Forest ambience (planning phase) ---
  startForestAmbience() {
    if (!this.initialized) return;
    this.stopForestAmbience();

    // Gentle wind — looping noise buffer through bandpass
    const windBuf = this._makeNoiseBuffer(4);
    this._forestWindSource = this.ctx.createBufferSource();
    this._forestWindSource.buffer = windBuf;
    this._forestWindSource.loop = true;

    const windBP = this.ctx.createBiquadFilter();
    windBP.type = 'bandpass';
    windBP.frequency.value = 400;
    windBP.Q.value = 0.5;

    this._forestWindGain = this.ctx.createGain();
    this._forestWindGain.gain.value = 0.025;

    this._forestWindSource.connect(windBP).connect(this._forestWindGain).connect(this.musicGain);
    this._forestWindSource.start();

    // Bird chirps
    const chirp = () => {
      if (!this.initialized) return;
      const t = this.ctx.currentTime;
      const baseFreq = 2000 + Math.random() * 1000;

      // Two-note chirp
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = t + i * 0.12;
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, start + 0.06);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, start + 0.1);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        osc.connect(gain).connect(this.musicGain);
        osc.start(start);
        osc.stop(start + 0.1);
      }
    };

    this._forestBirdInterval = setInterval(chirp, 3000 + Math.random() * 5000);
    // Reschedule with random interval each time
    const reschedule = () => {
      if (this._forestBirdInterval === null) return;
      clearInterval(this._forestBirdInterval);
      this._forestBirdInterval = setInterval(() => {
        chirp();
        reschedule();
      }, 3000 + Math.random() * 5000);
    };
  }

  stopForestAmbience() {
    if (this._forestWindSource) { try { this._forestWindSource.stop(); } catch {} this._forestWindSource = null; }
    this._forestWindGain = null;
    if (this._forestBirdInterval) { clearInterval(this._forestBirdInterval); this._forestBirdInterval = null; }
  }

  // --- Victory fanfare (results screen) ---
  playVictoryFanfare() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = t + i * 0.15;
      const isLast = i === notes.length - 1;
      const dur = isLast ? 0.6 : 0.14;

      osc.frequency.setValueAtTime(notes[i], start);
      gain.gain.setValueAtTime(0.25, start);
      if (isLast) {
        gain.gain.setValueAtTime(0.25, start + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      }

      osc.connect(gain).connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + dur);
    }
  }

  // --- Objective complete ---
  playObjectiveComplete() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const start = t + i * 0.08;
      osc.frequency.setValueAtTime(notes[i], start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.12);
    }
  }

  // --- Unlock sound ---
  playUnlock() {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;

    // Click blip
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(2400, t);
    clickGain.gain.setValueAtTime(0.25, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    click.connect(clickGain).connect(this.sfxGain);
    click.start(t);
    click.stop(t + 0.04);

    // Rising sweep
    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(200, t + 0.05);
    sweep.frequency.exponentialRampToValueAtTime(800, t + 0.35);
    sweepGain.gain.setValueAtTime(0.18, t + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    sweep.connect(sweepGain).connect(this.sfxGain);
    sweep.start(t + 0.05);
    sweep.stop(t + 0.4);
  }

  startAmbientMusic(crowdSize) {
    if (!this.initialized || this.musicPlaying) return;
    this.musicPlaying = true;

    // Ambient pad
    this._padOsc = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    this._padOsc.type = 'sine';
    this._padOsc.frequency.value = 130.81; // C3
    padGain.gain.value = 0.06;
    this._padOsc.connect(padGain).connect(this.musicGain);
    this._padOsc.start();

    // Sub bass pulse
    this._bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    this._bassOsc.type = 'sine';
    this._bassOsc.frequency.value = 55;
    bassGain.gain.value = 0.08;
    this._bassOsc.connect(bassGain).connect(this.musicGain);
    this._bassOsc.start();

    // Hi-hat pattern (noise bursts)
    this._startHihats();
  }

  _startHihats() {
    const playHat = () => {
      if (!this.initialized) return;
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hipass = this.ctx.createBiquadFilter();
      hipass.type = 'highpass';
      hipass.frequency.value = 8000;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.04;

      noise.connect(hipass).connect(gain).connect(this.musicGain);
      noise.start();
    };

    this._hihatInterval = setInterval(playHat, 500);
  }

  stopAmbientMusic() {
    if (!this.musicPlaying) return;
    this.musicPlaying = false;
    if (this._padOsc) { this._padOsc.stop(); this._padOsc = null; }
    if (this._bassOsc) { this._bassOsc.stop(); this._bassOsc = null; }
    if (this._hihatInterval) { clearInterval(this._hihatInterval); this._hihatInterval = null; }
  }

  updateMusicIntensity(crowdSize) {
    if (!this.initialized || !this.musicGain) return;
    const intensity = Math.min(1, crowdSize / 300);
    this.musicGain.gain.value = 0.05 + intensity * 0.2;
  }
}
