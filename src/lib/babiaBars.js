function ensureSceneLoaded(scene) {
  return new Promise(resolve => {
    if (!scene) return resolve(null);
    if (scene.hasLoaded) return resolve(scene);
    scene.addEventListener('loaded', () => resolve(scene), { once: true });
  });
}

function serializeBarsOptions(opts) {
  if (!opts) return '';
  if (typeof opts === 'string') return opts.trim();
  return Object.entries(opts)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

export async function createBabiaBars({
  data,
  parent = document.querySelector('a-scene'),
  id,
  position = '0 0 -5',
  scale = '1 1 1',
  rotation = '0 0 0',
  xAxis,
  heightKey,
  title = '',
  palette = 'sunset',
  barsOptions = {},
  queryComponent = 'babia-queryjson',
  visualizer = 'babia-bars'
} = {}) {
  if (!Array.isArray(data)) throw new Error('[babiaBars] data must be an array');
  if (!xAxis || !heightKey) throw new Error('[babiaBars] xAxis and heightKey are required');

  await ensureSceneLoaded(parent);
  if (!parent) throw new Error('[babiaBars] parent scene not found');

  let el;
  if (id) {
    el = document.getElementById(id);
  }
  if (!el) {
    el = document.createElement('a-entity');
    if (id) el.id = id;
    parent.appendChild(el);
  }

  const jsonStr = JSON.stringify(data);
  el.setAttribute(queryComponent, { data: jsonStr });

  const baseOptions = {
    legend: true,
    axis: true,
    x_axis: xAxis,
    height: heightKey,
    pallete: palette,
    title
  };
  const merged = { ...baseOptions, ...(typeof barsOptions === 'object' ? barsOptions : {}) };
  const mergedString = serializeBarsOptions(merged);
  el.setAttribute(visualizer, mergedString);

  el.setAttribute('position', position);
  el.setAttribute('scale', scale);
  el.setAttribute('rotation', rotation);

  el.setAttribute(visualizer, mergedString);
  return el;
}