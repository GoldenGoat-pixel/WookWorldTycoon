import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.el = domElement;

    this.target = new THREE.Vector3(0, 0, 0);
    this.distance = 35;
    this.minDistance = 8;
    this.maxDistance = 120;
    this.angle = Math.PI / 4;   // horizontal orbit
    this.pitch = Math.PI / 3;   // tilt from vertical
    this.minPitch = 0.3;
    this.maxPitch = Math.PI / 2 - 0.05;

    // Input state
    this._pointers = new Map();
    this._lastPinchDist = 0;
    this._lastPinchMid = null;
    this._isPanning = false;
    this._isRotating = false;
    this._isTouchPanning = false;
    this._prevX = 0;
    this._prevY = 0;
    this._touchStartPos = null;

    // Flag for main.js: true if the last touch gesture was a pan (not a tap)
    this.didPan = false;

    this._bindEvents();
    this.update();
  }

  _bindEvents() {
    this.el.addEventListener('pointerdown', e => this._onPointerDown(e));
    this.el.addEventListener('pointermove', e => this._onPointerMove(e));
    this.el.addEventListener('pointerup', e => this._onPointerUp(e));
    this.el.addEventListener('pointercancel', e => this._onPointerUp(e));
    this.el.addEventListener('wheel', e => this._onWheel(e), { passive: false });
    this.el.addEventListener('contextmenu', e => e.preventDefault());
  }

  _onPointerDown(e) {
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

    if (this._pointers.size === 2) {
      this._lastPinchDist = this._pinchDistance();
      this._lastPinchMid = this._pinchMidpoint();
      this._isPanning = false;
      this._isRotating = false;
      this._isTouchPanning = false;
    } else if (e.pointerType === 'touch' && this._pointers.size === 1) {
      // Single touch: prepare for pan (confirmed on move past threshold)
      this._touchStartPos = { x: e.clientX, y: e.clientY };
      this._prevX = e.clientX;
      this._prevY = e.clientY;
      this.didPan = false;
    } else if (e.button === 2 || e.button === 1) {
      this._isRotating = true;
      this._prevX = e.clientX;
      this._prevY = e.clientY;
    } else if (e.button === 0 && e.shiftKey) {
      this._isPanning = true;
      this._prevX = e.clientX;
      this._prevY = e.clientY;
    }
  }

  _onPointerMove(e) {
    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

    if (this._pointers.size === 2) {
      const dist = this._pinchDistance();
      const mid = this._pinchMidpoint();
      if (this._lastPinchDist > 0) {
        const scale = this._lastPinchDist / dist;
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance * scale));
      }
      if (this._lastPinchMid) {
        const mdx = mid.x - this._lastPinchMid.x;
        const mdy = mid.y - this._lastPinchMid.y;
        const panSpeed = this.distance * 0.003;
        const right = new THREE.Vector3();
        this.camera.getWorldDirection(right).cross(this.camera.up).normalize();
        const forward = new THREE.Vector3();
        forward.copy(right).cross(new THREE.Vector3(0, 1, 0)).normalize();
        this.target.addScaledVector(right, -mdx * panSpeed);
        this.target.addScaledVector(forward, mdy * panSpeed);
      }
      this._lastPinchDist = dist;
      this._lastPinchMid = mid;
      this.update();
      return;
    }

    // Single-finger touch pan
    if (e.pointerType === 'touch' && this._touchStartPos && this._pointers.size === 1) {
      const totalDx = e.clientX - this._touchStartPos.x;
      const totalDy = e.clientY - this._touchStartPos.y;
      const totalDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);

      if (!this._isTouchPanning && totalDist > 10) {
        this._isTouchPanning = true;
        this.didPan = true;
        this._prevX = e.clientX;
        this._prevY = e.clientY;
      }

      if (this._isTouchPanning) {
        const dx = e.clientX - this._prevX;
        const dy = e.clientY - this._prevY;
        this._prevX = e.clientX;
        this._prevY = e.clientY;

        const panSpeed = this.distance * 0.003;
        const right = new THREE.Vector3();
        this.camera.getWorldDirection(right).cross(this.camera.up).normalize();
        const forward = new THREE.Vector3();
        forward.copy(right).cross(new THREE.Vector3(0, 1, 0)).normalize();
        this.target.addScaledVector(right, -dx * panSpeed);
        this.target.addScaledVector(forward, dy * panSpeed);
        this.update();
        return;
      }
    }

    const dx = e.clientX - this._prevX;
    const dy = e.clientY - this._prevY;
    this._prevX = e.clientX;
    this._prevY = e.clientY;

    if (this._isRotating) {
      this.angle -= dx * 0.005;
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch - dy * 0.005));
      this.update();
    } else if (this._isPanning) {
      const panSpeed = this.distance * 0.002;
      const right = new THREE.Vector3();
      this.camera.getWorldDirection(right).cross(this.camera.up).normalize();
      const forward = new THREE.Vector3();
      forward.copy(right).cross(new THREE.Vector3(0, 1, 0)).normalize();
      this.target.addScaledVector(right, -dx * panSpeed);
      this.target.addScaledVector(forward, dy * panSpeed);
      this.update();
    }
  }

  _onPointerUp(e) {
    this._pointers.delete(e.pointerId);
    if (this._pointers.size < 2) {
      this._lastPinchDist = 0;
      this._lastPinchMid = null;
    }
    if (this._pointers.size === 0) {
      this._isTouchPanning = false;
      this._touchStartPos = null;
    }
    this._isPanning = false;
    this._isRotating = false;
  }

  _onWheel(e) {
    e.preventDefault();
    this.distance *= 1 + e.deltaY * 0.001;
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    this.update();
  }

  _pinchDistance() {
    const pts = [...this._pointers.values()];
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _pinchMidpoint() {
    const pts = [...this._pointers.values()];
    if (pts.length < 2) return null;
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }

  update() {
    const x = this.target.x + this.distance * Math.sin(this.pitch) * Math.sin(this.angle);
    const y = this.target.y + this.distance * Math.cos(this.pitch);
    const z = this.target.z + this.distance * Math.sin(this.pitch) * Math.cos(this.angle);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
