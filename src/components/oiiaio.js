AFRAME.registerComponent('oiiaio-cat', {
  schema: {
    hoverScale: { type: 'number', default: 1.05 },
    idleLoop: { type: 'boolean', default: false }
  },

  init() {
    this._hovering = false;
    this._baseScale = this.el.object3D.scale.clone();
    this._mixer = null;
    this._activeAction = null;
    this._initialAnimationsStarted = false;

    this._onModelLoaded = this._onModelLoaded.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onLeave = this._onLeave.bind(this);

    this.el.addEventListener('model-loaded', this._onModelLoaded);
    this.el.addEventListener('mouseenter', this._onEnter);
    this.el.addEventListener('mouseleave', this._onLeave);
  },

  remove() {
    this.el.removeEventListener('model-loaded', this._onModelLoaded);
    this.el.removeEventListener('mouseenter', this._onEnter);
    this.el.removeEventListener('mouseleave', this._onLeave);
  },

  _onModelLoaded(e) {
    const comp = this.el.components['animation-mixer'];
    if (comp && comp.mixer && comp.mixer._actions && comp.mixer._actions.length) {
      this._mixer = comp.mixer;
      comp.mixer._actions.forEach(a => {
        a.reset();
        a.paused = true;
        a.enabled = true;
      });
    }
  },

  _onEnter() {
    this._hovering = true;
    this.el.object3D.scale.set(
      this._baseScale.x * this.data.hoverScale,
      this._baseScale.y * this.data.hoverScale,
      this._baseScale.z * this.data.hoverScale
    );

    const comp = this.el.components['animation-mixer'];
    if (comp && comp.mixer) {
      const acts = comp.mixer._actions;
      if (acts && acts.length) {
        const first = acts[0];
  first.reset();
  first.paused = false;
  first.setLoop(AFRAME.THREE.LoopRepeat, Infinity);
  first.play();
        this._activeAction = first;
      }
    }

    if (this.el.components.sound) {
      const s = this.el.components.sound;
      if (!s.isPlaying) s.playSound();
    }
  },

  _onLeave() {
    this._hovering = false;
    this.el.object3D.scale.copy(this._baseScale);
    if (this._activeAction) {
  this._activeAction.reset();
  this._activeAction.paused = true;
      this._activeAction = null;
    }
    if (this.el.components.sound && this.el.components.sound.isPlaying) {
      this.el.components.sound.stopSound();
    }
  }
});
