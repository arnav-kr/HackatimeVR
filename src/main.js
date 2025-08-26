import "./style.css";
import Hackatime from "./lib/hackatime.js";
import { createBabiaBars } from "./lib/babiaBars.js";
import { createStatTile } from "./lib/overview.js";
import { createBabiaPie } from "./lib/babiaPie.js";
import "./components/oiiaio.js";
import "./components/boombox.js";
import "./components/sky-cycle.js";
import "./components/refresh-stats.js";


let globalHackatime = null;
async function loadHackatime(userId, { force = false } = {}) {
  globalHackatime = new Hackatime(userId);
  const key = `hackatimeCache:${userId}`;
  const cache = JSON.parse(localStorage.getItem(key)) || {
    last7: null,
    last4Weeks: null,
    last12Weeks: null,
    overview: null,
    updatedAt: null
  };
  const save = () => localStorage.setItem(key, JSON.stringify(cache));

  const MAX_AGE = 2 * 60 * 60 * 1000; // 2h
  const expired = !force && cache.updatedAt && (Date.now() - cache.updatedAt > MAX_AGE);

  try {
    await loadLeaderboard();
  } catch (e) { console.error("leaderboard fetch failed", e); }

  if (force || expired) {
    ['last7bars', 'last4weeksbars', 'last12weeksbars', 'tile-total', 'tile-daily', 'tile-fav', 'tile-top-languages', 'tile-top-languages-pie']
      .forEach(id => { const n = document.getElementById(id); if (n) n.remove(); });
  }

  let mutated = false;
  if (force || expired || !cache.last7) { cache.last7 = await globalHackatime.range("7days"); mutated = true; }
  if (force || expired || !cache.last4Weeks) { cache.last4Weeks = await globalHackatime.range("1month"); mutated = true; }
  if (force || expired || !cache.last12Weeks) { cache.last12Weeks = await globalHackatime.range("3months"); mutated = true; }
  if (force || expired || !cache.overview) { cache.overview = await globalHackatime.overview(); mutated = true; }
  if (mutated) { cache.updatedAt = Date.now(); save(); }

  const root = document.querySelector('#scene');
  await createBabiaBars({ data: cache.last7, parent: root, id: 'last7bars', position: '-4.25 0 -5', scale: '0.5 0.5 0.5', xAxis: 'days', heightKey: 'time', title: 'Last 7 Days Stats', palette: 'sunset' });
  await createBabiaBars({ data: cache.last4Weeks, parent: root, id: 'last4weeksbars', position: '3.75 0 -5', scale: '0.5 0.5 0.5', xAxis: 'x_axis', heightKey: 'time', title: 'Last 4 Weeks Stats', palette: 'sunset' });
  await createBabiaBars({ data: cache.last12Weeks, parent: root, id: 'last12weeksbars', position: '3 0 5', scale: '0.5 0.5 0.5', xAxis: 'x_axis', rotation: '0 -180 0', heightKey: 'time', title: 'Last 12 Weeks Stats', palette: 'sunset' });

  const ovRoot = document.querySelector('#overview');
  const ov = cache.overview;
  await createStatTile({ id: 'tile-total', parent: ovRoot, position: '-2 0.2 -3', label: 'Total', value: ov.total_time, width: 1.9, height: 0.8, valueScale: 0.85, labelScale: 1 });
  await createStatTile({ id: 'tile-daily', parent: ovRoot, position: '0 0.2 -3', label: 'Daily Avg', value: ov.daily_average, width: 1.9, height: 0.8, valueScale: 0.85, labelScale: 1 });
  await createStatTile({ id: 'tile-fav', parent: ovRoot, position: '2 0.2 -3', label: 'Favourite', value: ov.favourite, width: 1.9, height: 0.8, valueScale: 0.85, labelScale: 1 });
  await createStatTile({ id: 'tile-top-languages', parent: ovRoot, position: '0 0.95 -3', label: 'Top Languages', width: 1.9, height: 0.52, valueScale: 0.85, labelScale: 1 });
  await createBabiaPie({ id: 'tile-top-languages-pie', parent: ovRoot, position: '0 2.25 -3', scale: '0.9 0.9 0.9', rotation: '90 0 0', data: ov.top_languages, keyField: 'name', sizeField: 'hours', palette: 'sunset', legend: true });

  setUpdated(cache.updatedAt);
  return cache.updatedAt;
}

async function loadLeaderboard() {
  if (!globalHackatime) {
    const uid = localStorage.getItem('hackatimeUserId');
    if (!uid) return;
    globalHackatime = new Hackatime(uid);
  }
  const container = document.getElementById('userCards');
  if (!container) return;
  [...container.querySelectorAll('[data-user-card]')].forEach(n => n.remove());
  let data = [];
  try { data = await globalHackatime.leaderboard(); } catch (e) { console.error('Failed fetching leaderboard', e); }
  const template = document.getElementById('userCardTemplate');
  if (!template) return;
  const baseY = 2.25;
  const gap = 0.17;
  data.forEach((user, idx) => {
    const card = template.cloneNode(true);
    card.id = `userCard-${idx + 1}`;
    card.dataset.userCard = '1';
    card.setAttribute('visible', 'true');
    const y = baseY - idx * gap;
    card.setAttribute('position', `0 ${y} 0`);

    const rank = card.querySelector('.userRank');
    if (rank) rank.setAttribute('value', `${idx + 1}`);

    const avatar = card.querySelector('.userAvatar');
    if (avatar) avatar.setAttribute('material', `src: url(${user.avatar}); transparent: true; side: double; opacity: 0.95`);

    const uname = card.querySelector('.userName');
    if (uname) uname.setAttribute('value', user.username.trim());

    const hours = card.querySelector('.userHours');
    if (hours) hours.setAttribute('value', user.hours);

    if (user.profileUrl) {
      card.setAttribute('class', (card.getAttribute('class') || '') + ' clickable');
      card.addEventListener('click', () => window.open(user.profileUrl, '_blank'));
    }
    container.appendChild(card);
  });
}
function setUpdated(ts) {
  const label = document.querySelector('#lastUpdated + a-text, a-text[lastupdated]');
  if (!label) return;
  if (!ts) { label.setAttribute('value', 'Updated —'); return; }
  const now = Date.now();
  let diffSec = Math.round((ts - now) / 1000);
  const abs = Math.abs(diffSec);
  let unit = 'second';
  if (abs >= 60 && abs < 3600) { unit = 'minute'; diffSec = Math.round(diffSec / 60); }
  else if (abs >= 3600 && abs < 86400) { unit = 'hour'; diffSec = Math.round(diffSec / 3600); }
  else if (abs >= 86400) { unit = 'day'; diffSec = Math.round(diffSec / 86400); }
  const rel = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'short' }).format(diffSec, unit);
  const t = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  label.setAttribute('value', `Updated ${rel}\n(${t})`);
}

window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('hackatimeUserId');
  const rememberPref = localStorage.getItem('hackatimeRemember') !== 'false';
  const promptEl = document.getElementById('userPrompt');
  const inputEl = document.getElementById('hackUserId');
  const startBtn = document.getElementById('startHackBtn');
  const rememberBtn = document.getElementById('rememberToggle');
  if (savedUser) inputEl.value = savedUser;
  rememberBtn.textContent = rememberPref ? 'Remember ✔' : 'Remember ✖';
  rememberBtn.addEventListener('click', () => {
    const newVal = !(localStorage.getItem('hackatimeRemember') !== 'false');
    localStorage.setItem('hackatimeRemember', newVal);
    rememberBtn.textContent = newVal ? 'Remember ✔' : 'Remember ✖';
  });
  let currentPoll = null;
  const pollCurrent = (userId) => {
    if (currentPoll) return;
    const periodMs = 5 * 60 * 1000;
    const fetchOnce = async () => {
      try {
        const c = await new Hackatime(userId).current();
        updateCurrentlyActive(c);
      } catch (e) { console.error('current poll failed', e); }
    };
    fetchOnce();
    currentPoll = setInterval(fetchOnce, periodMs);
  };

  const begin = async () => {
    const userId = inputEl.value.trim();
    if (!userId) { inputEl.focus(); return; }
    if (localStorage.getItem('hackatimeRemember') !== 'false') {
      localStorage.setItem('hackatimeUserId', userId);
    }
    promptEl.style.display = 'none';
    await loadHackatime(userId);
    pollCurrent(userId);
  };
  startBtn.addEventListener('click', begin);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') begin(); });
  if (savedUser && rememberPref) begin();

  loadLeaderboard();
});

window.loadHackatime = loadHackatime;
window.setHackatimeUpdated = setUpdated;
window.loadLeaderboard = loadLeaderboard;

function updateCurrentlyActive(count) {
  const label = document.getElementById('currentlyActiveLabel');
  if (label) label.setAttribute('value', `Currently Active: ${count}`);
}