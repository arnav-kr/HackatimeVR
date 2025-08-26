function ensureSceneLoaded(scene) {
  return new Promise(resolve => {
    if (!scene) return resolve(null);
    if (scene.hasLoaded) return resolve(scene);
    scene.addEventListener('loaded', () => resolve(scene), { once: true });
  });
}

function buildAttr(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}
export async function createBabiaPie({
  data,
  parent = document.querySelector('a-scene'),
  id,
  position = '0 1 -3',
  rotation = '0 0 0',
  scale = '1 1 1',
  keyField = 'name',
  sizeField = 'hours',
  legend = true,
  palette = 'sunset',
  queryComponent = 'babia-queryjson',
  visualizer = 'babia-pie'
} = {}) {
  if (!Array.isArray(data)) throw new Error('[babiaPie] data must be an array');

  const clean = data.map(d => ({ ...d, [sizeField]: Number(d[sizeField]) || 0 }));
  if (clean.every(d => d[sizeField] === 0)) {
  }

  await ensureSceneLoaded(parent);
  if (!parent) throw new Error('[babiaPie] parent scene not found');

  let el = id ? document.getElementById(id) : null;
  if (!el) {
    el = document.createElement('a-entity');
    if (id) el.id = id;
    parent.appendChild(el);
  }

  const jsonStr = JSON.stringify(clean);
  el.setAttribute(queryComponent, { data: jsonStr });

  const attr = buildAttr({ legend, pallete: palette, palette, key: keyField, size: sizeField });
  el.setAttribute(visualizer, attr);
  el.setAttribute('position', position);
  el.setAttribute('rotation', rotation);
  el.setAttribute('scale', scale);
  el.setAttribute(visualizer, attr);
  return el;
}