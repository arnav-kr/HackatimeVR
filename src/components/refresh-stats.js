AFRAME.registerComponent('refresh-stats', {
  schema: {
    userIdSelector: { type: 'string', default: '#hackUserId' },
    loadingColor: { type: 'color', default: '#335533' },
    idleColor: { type: 'color', default: '#222' }
  },
  init: function () {
    const el = this.el;
    el.classList.add('interactive');
    el.addEventListener('click', async () => {
      const currentUserInput = document.querySelector(this.data.userIdSelector);
      const userId = (currentUserInput && currentUserInput.value) || localStorage.getItem('hackatimeUserId');
      if (!userId || !window.loadHackatime) return;
      el.setAttribute('material', 'color', this.data.loadingColor);
      try {
        const ts = await window.loadHackatime(userId, { force: true });
        if (window.setHackatimeUpdated) window.setHackatimeUpdated(ts);
      } finally {
        setTimeout(() => el.setAttribute('material', 'color', this.data.idleColor), 180);
      }
    });
  }
});
