AFRAME.registerComponent('boombox-player', {
  schema: {
    src: { type: 'string', default: '/the_stash_som.mp3' },
    volume: { type: 'number', default: 1 }
  },
  init: function () {
    const el = this.el;
    if (!el.components.sound) {
      el.setAttribute('sound', `src: url(${this.data.src}); autoplay: false; loop: true; volume: ${this.data.volume}`);
    }
    const pulse = () => {
      el.setAttribute('scale', '0.27 0.27 0.27');
      setTimeout(() => el.setAttribute('scale', '0.25 0.25 0.25'), 120);
    };
    el.addEventListener('click', () => {
      const sound = el.components.sound;
      if (!sound) return;
      if (sound.isPlaying) {
        sound.pauseSound();
        el.setAttribute('material', 'color', '#666');
      } else {
        sound.playSound();
        el.setAttribute('material', 'color', '#FFF');
      }
      pulse();
    });
  }
});