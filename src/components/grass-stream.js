import 'aframe';

AFRAME.registerComponent('grass-stream', {
  schema: {
    model: { type: 'string' },
    tileSize: { type: 'number', default: 5 },
    radius: { type: 'int', default: 5 },
    scale: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
    y: { type: 'number', default: 0 },
    throttle: { type: 'number', default: 250 },
    autoFit: { type: 'boolean', default: true },
    fitMultiplier: { type: 'number', default: 1 }
  },

  init() {
    this.player = document.querySelector('#playerRig');
    if (!this.player) console.log('[grass-stream] #playerRig not found; using origin');

    this._currentTileSize = this.data.tileSize;
    this._center = { i: NaN, j: NaN };
    this._tiles = new Map();
    this._pool = [];
    this._neededKeys = new Set();
    this._sizeReady = !this.data.autoFit;

    this._throttled = AFRAME.utils.throttleTick(this._update, this.data.throttle, this);

    if (this.data.autoFit && this.data.model) {
      this._spawnProbeForSize();
    }
  },

  remove() {
    this._tiles.forEach(e => e.parentNode && e.parentNode.removeChild(e));
    this._tiles.clear();
    this._pool.length = 0;
  },

  tick(t, dt) { this._throttled(t, dt); },

  _update() {
    if (!this._sizeReady) return;
    const pos = this.player ? this.player.object3D.position : { x: 0, z: 0 };
    const ts = this._currentTileSize;
    if (ts <= 0) return;

    const ci = Math.floor(pos.x / ts);
    const cj = Math.floor(pos.z / ts);
    if (ci === this._center.i && cj === this._center.j) return;

    this._center.i = ci;
    this._center.j = cj;
    this._updateTiles(ci, cj);
  },

  _updateTiles(ci, cj) {
    const { radius } = this.data;
    const needed = this._neededKeys;
    needed.clear();

    for (let i = ci - radius; i <= ci + radius; i++) {
      for (let j = cj - radius; j <= cj + radius; j++) {
        const key = i + ':' + j;
        needed.add(key);
        if (!this._tiles.has(key)) {
          const ent = this._acquireTile();
          ent.object3D.position.set(
            (i + 0.5) * this._currentTileSize,
            this.data.y,
            (j + 0.5) * this._currentTileSize
          );
          this._tiles.set(key, ent);
        }
      }
    }

    for (const [key, ent] of this._tiles) {
      if (!needed.has(key)) {
        this._tiles.delete(key);
        this._releaseTile(ent);
      }
    }
  },

  _acquireTile() {
    let ent = this._pool.pop();
    if (!ent) {
      ent = document.createElement('a-entity');
      if (this.data.model) ent.setAttribute('gltf-model', `url(${this.data.model})`);
      const s = this.data.scale;
      ent.setAttribute('scale', `${s.x} ${s.y} ${s.z}`);
      this.el.appendChild(ent);
    } else {
      ent.object3D.visible = true;
    }
    return ent;
  },

  _releaseTile(ent) {
    ent.object3D.visible = false;
    this._pool.push(ent);
  },

  _spawnProbeForSize() {
    if (!this.data.model) { this._sizeReady = true; return; }
    const probe = document.createElement('a-entity');
    probe.setAttribute('visible', 'false');
    probe.setAttribute('gltf-model', `url(${this.data.model})`);
    const s = this.data.scale;
    probe.setAttribute('scale', `${s.x} ${s.y} ${s.z}`);

    probe.addEventListener('model-loaded', () => {
      const mesh = probe.getObject3D('mesh');
      if (!mesh) {
        console.log('[grass-stream] Probe mesh missing; using fallback tileSize');
        this._sizeReady = true;
        return;
      }
      const box = new AFRAME.THREE.Box3().setFromObject(mesh);
      const size = new AFRAME.THREE.Vector3();
      box.getSize(size);
      const raw = Math.max(size.x, size.z);
      this._currentTileSize = raw > 0 ? raw * this.data.fitMultiplier : this.data.tileSize;
      this._sizeReady = true;
      probe.parentNode && probe.parentNode.removeChild(probe);
      this._center = { i: NaN, j: NaN };
      this._update();
    }, { once: true });

    this.el.appendChild(probe);
  }
});

