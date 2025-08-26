function ensureSceneLoaded(scene) {
  return new Promise(r => {
    if (!scene) return r(null);
    if (scene.hasLoaded) return r(scene);
    scene.addEventListener('loaded', () => r(scene), { once: true });
  });
}

export async function createTextTile({
  id,
  parent = document.querySelector('a-scene'),
  position = '0 1 -3',
  width = 2,
  height = 1,
  text = '',
  align = 'left',
  textScale = '1 1 1',
  backgroundColor = '#111',
  backgroundOpacity = 0.6,
  color = '#FFF'
} = {}) {
  await ensureSceneLoaded(parent);
  let root = id && document.getElementById(id);
  if (!root) {
    root = document.createElement('a-entity');
    if (id) root.id = id;
    parent.appendChild(root);
  }
  root.setAttribute('position', position);

  let bg = root.querySelector('.ov-bg');
  if (!bg) {
    bg = document.createElement('a-plane');
    bg.classList.add('ov-bg');
    root.appendChild(bg);
  }
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('material', `color:${backgroundColor};opacity:${backgroundOpacity};side:double`);

  let txtNode = root.querySelector('.ov-text');
  if (!txtNode) {
    txtNode = document.createElement('a-text');
    txtNode.classList.add('ov-text');
    root.appendChild(txtNode);
  }
  txtNode.setAttribute('value', text);
  txtNode.setAttribute('align', align);
  txtNode.setAttribute('color', color);
  txtNode.setAttribute('width', width * 0.96);
  txtNode.setAttribute('wrap-count', 40);
  txtNode.setAttribute('position', `0 ${height / 2 - 0.22} 0.01`);
  txtNode.setAttribute('baseline', 'top');
  txtNode.setAttribute('scale', textScale);
  return root;
}

export async function createStatTile({
  id,
  parent = document.querySelector('a-scene'),
  position = '0 1 -3',
  width = 1.8,
  height = 0.7,
  label = 'LABEL',
  value = '—',
  labelColor = '#EEE',
  valueColor = '#FFF',
  labelScale = 0.55,
  valueScale = 0.7,
  align = 'center',
  backgroundColor = '#111',
  backgroundOpacity = 0.65
} = {}) {
  await ensureSceneLoaded(parent);
  let root = id && document.getElementById(id);
  if (!root) {
    root = document.createElement('a-entity');
    if (id) root.id = id;
    parent.appendChild(root);
  }
  root.setAttribute('position', position);

  let bg = root.querySelector('.stat-bg');
  if (!bg) {
    bg = document.createElement('a-plane');
    bg.classList.add('stat-bg');
    root.appendChild(bg);
  }
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('material', `color:${backgroundColor};opacity:${backgroundOpacity};side:double`);

  const labelY = height / 2 - 0.27;
  const offsets = [[0, 0], [0.0025, 0], [-0.0025, 0], [0, 0.0025]];
  offsets.forEach((off, i) => {
    const node = document.createElement('a-text');
    node.classList.add(`stat-label-${i}`);
    root.appendChild(node);
    node.setAttribute('value', label.toUpperCase());
    node.setAttribute('align', align);
    node.setAttribute('color', labelColor);
    node.setAttribute('wrap-count', 18);
    node.setAttribute('width', width * 0.94);
    node.setAttribute('position', `${off[0]} ${labelY + off[1]} 0.01`);
    node.setAttribute('baseline', 'center');
    node.setAttribute('scale', `${labelScale} ${labelScale} 1`);
  });

  const valueY = labelY - 0.28;
  let valueNode = root.querySelector('.stat-value');
  if (!valueNode) {
    valueNode = document.createElement('a-text');
    valueNode.classList.add('stat-value');
    root.appendChild(valueNode);
  }
  valueNode.setAttribute('value', value);
  valueNode.setAttribute('align', align);
  valueNode.setAttribute('color', valueColor);
  valueNode.setAttribute('wrap-count', 20);
  valueNode.setAttribute('width', width * 0.94);
  valueNode.setAttribute('position', `0 ${valueY} 0.01`);
  valueNode.setAttribute('baseline', 'center');
  valueNode.setAttribute('scale', `${valueScale} ${valueScale} 1`);

  return root;
}