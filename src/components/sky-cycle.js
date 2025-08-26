AFRAME.registerComponent('sky-cycle-button', {
  init: function () {
    const sky = document.querySelector('a-sky');
    if (!sky) return;
    const maxIndex = 3;
    let current = 0;
    const updateSky = () => {
      sky.setAttribute('src', `/sky-${current}.png`);
      this.el.emit('sky-changed', { index: current });
    };
    updateSky();
    this.el.setAttribute('cursor-listener', '');
    this.el.classList.add('interactive');
    this.el.addEventListener('click', () => {
      current = (current + 1) % (maxIndex + 1);
      updateSky();
      this.el.setAttribute('material', 'color', '#444');
      setTimeout(() => this.el.setAttribute('material', 'color', '#222'), 120);
    });
  }
});