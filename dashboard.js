let DATA = [];
let ALL_PLAYERS = [];

// ── FILE LOADING ──────────────────────────────────────────────────────────────

const dropZone  = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// Intento automático: si el bot generó historial.js en la misma carpeta,
// lo habrá inyectado como window.__HISTORIAL__ via <script src="historial.js">
if (Array.isArray(window.__HISTORIAL__)) {
  DATA = window.__HISTORIAL__;
  document.addEventListener('DOMContentLoaded', initDashboard);
}

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
});
fileInput.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });

function readFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      DATA = JSON.parse(ev.target.result);
      if (!Array.isArray(DATA)) throw new Error('Formato inválido');
      initDashboard();
    } catch(err) {
      alert('Error al leer el archivo: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ── INIT ──────────────────────────────────────────────────────────────────────

function initDashboard() {
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('app').classList.add('visible');

  // Collect all players
  const playerSet = new Set();
  DATA.forEach(r => (r.roster ?? []).forEach(n => playerSet.add(n)));
  ALL_PLAYERS = Array.from(playerSet).sort();

  buildPlayerMaps();
  buildHeaderMeta();
  buildResumen();
  buildFF();
  buildMuertes();
  buildMecanicas();
  buildHistorial();
  buildPorRaid();
  buildProgresion();
  buildVerguenza();
  buildTimeRecords();
  setupJugador();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmtDmg(n) {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n/1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${String(rem).padStart(2,'0')}s`;
}

function fmtDate(d) {
  const [y, mo, day] = d.split('-');
  return `${day}/${mo}/${y}`;
}

function rankClass(i) {
  return i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
}
function medalEmoji(i) {
  return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
}

function makeBar(pct, cls='') {
  return `<div class="bar-wrap"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>`;
}

function aggregateMap(field, key) {
  const m = new Map();
  DATA.forEach(r => {
    (r[field] ?? []).forEach(e => {
      m.set(e[key] ?? e.name, (m.get(e[key] ?? e.name) ?? 0) + (e.damage ?? e.count ?? e.total ?? e.ms ?? 0));
    });
  });
  return Array.from(m.entries()).map(([name,val]) => ({name,val})).sort((a,b) => b.val - a.val);
}

function calcShame() {
  const scores = new Map();
  DATA.forEach(raid => {
    const participants = raid.roster ? new Set(raid.roster)
      : new Set([...raid.leaderboard.map(e=>e.name), ...(raid.deathStats?.deaths??[]).map(e=>e.name), ...(raid.deathStats?.timeDead??[]).map(e=>e.name)]);
    const n = participants.size;
    if (n <= 1) return;
    const pct = (list, name) => {
      const idx = list.findIndex(e => e.name === name);
      return idx === -1 ? 0 : (n - 1 - idx) / (n - 1);
    };
    for (const name of participants) {
      const avg = (pct(raid.leaderboard, name) + pct(raid.deathStats?.deaths??[], name) + pct(raid.deathStats?.timeDead??[], name)) / 3;
      const curr = scores.get(name) ?? {total:0, count:0};
      scores.set(name, {total: curr.total + avg, count: curr.count + 1});
    }
  });
  const minRaids = Math.max(1, Math.ceil(DATA.length * 0.3));
  return Array.from(scores.entries())
    .filter(([,v]) => v.count >= minRaids)
    .map(([name,{total,count}]) => ({name, score: total/count, count}))
    .sort((a,b) => b.score - a.score);
}

// ── HEADER META ───────────────────────────────────────────────────────────────

function buildHeaderMeta() {
  const lastDate = DATA.length ? fmtDate(DATA[DATA.length-1].fecha) : '-';
  document.getElementById('header-meta').innerHTML =
    `<span>${DATA.length}</span> raids registradas · Última: <span>${lastDate}</span> · <span>${ALL_PLAYERS.length}</span> jugadores en total`;
}

// ── RESUMEN ───────────────────────────────────────────────────────────────────

function buildResumen() {
  const totalFF = DATA.reduce((s,r) => s + r.leaderboard.reduce((ss,e) => ss + e.damage, 0), 0);
  let maxFF = {name: null, damage: 0};
  DATA.forEach(r => {
    if (r.leaderboard[0] && r.leaderboard[0].damage > maxFF.damage)
      maxFF = {name: r.leaderboard[0].name, damage: r.leaderboard[0].damage};
  });

  const totalKills    = DATA.reduce((s,r) => s + (r.bossStats?.totalKills ?? 0), 0);
  const totalWipes    = DATA.reduce((s,r) => s + (r.bossStats?.totalWipes ?? 0), 0);
  const totalTries    = totalKills + totalWipes;
  const globalEff     = totalTries > 0 ? Math.round(totalKills / totalTries * 100) : 0;
  const effColor      = globalEff >= 80 ? 'var(--gold)' : globalEff >= 50 ? 'var(--purple2)' : 'var(--red2)';

  const totalDeaths = DATA.reduce((s,r) => s + (r.deathStats?.deaths ?? []).reduce((ss,e) => ss + e.count, 0), 0);

  const avgDeaths = DATA.length > 0 ? (totalDeaths / DATA.length).toFixed(1) : 0;

  let bestDpsRaid = null, bestHpsRaid = null;
  DATA.forEach(raid => {
    const s = calcRaidDpsHps(raid);
    if (!s) return;
    if (!bestDpsRaid || s.dps > bestDpsRaid.dps) bestDpsRaid = { dps: s.dps, fecha: raid.fecha };
    if (!bestHpsRaid || s.hps > bestHpsRaid.hps) bestHpsRaid = { hps: s.hps, fecha: raid.fecha };
  });

  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card">
      <div class="label">Jugadores</div>
      <div class="value purple">${ALL_PLAYERS.length}</div>
      <div class="sub">han pisado la raid</div>
    </div>
    <div class="stat-card">
      <div class="label">Boss Kills</div>
      <div class="value">${totalKills}</div>
      <div class="sub">${totalWipes} wipes · ${totalTries} intentos totales</div>
    </div>
    <div class="stat-card">
      <div class="label">Efectividad Global</div>
      <div class="value" style="color:${effColor}">${totalTries > 0 ? globalEff + '%' : '—'}</div>
      <div class="sub">kills / (kills + wipes)</div>
    </div>
    <div class="stat-card">
      <div class="label">Rey de la Resaca</div>
      <div class="value red" style="font-size:1.3rem">${maxFF.name ?? '-'}</div>
      <div class="sub">${maxFF.name ? fmtDmg(maxFF.damage) + ' FF en una sola raid' : ''}</div>
    </div>
    <div class="stat-card">
      <div class="label">Mejor DPS de Raid</div>
      <div class="value" style="color:#7ec8e3">${bestDpsRaid ? fmtDmg(bestDpsRaid.dps) : '—'}</div>
      <div class="sub">${bestDpsRaid ? fmtDate(bestDpsRaid.fecha) + ' · media 3 kills' : 'Sin datos'}</div>
    </div>
    <div class="stat-card">
      <div class="label">Mejor HPS de Raid</div>
      <div class="value" style="color:#4ec97e">${bestHpsRaid ? fmtDmg(bestHpsRaid.hps) : '—'}</div>
      <div class="sub">${bestHpsRaid ? fmtDate(bestHpsRaid.fecha) + ' · media 3 kills' : 'Sin datos'}</div>
    </div>
  `;

  const ffPodio    = aggregateMap('leaderboard', 'name').slice(0,3);
  const dMap = new Map();
  DATA.forEach(r => (r.deathStats?.deaths??[]).forEach(e => dMap.set(e.name,(dMap.get(e.name)??0)+e.count)));
  const deathArr = [...dMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val).slice(0,3);
  const shame = calcShame().slice(0,3);

  const podiumHTML = (title, arr, valFn) => `
    <div class="podium-card">
      <div class="podium-title">${title}</div>
      ${arr.map((e,i) => `<div class="podium-entry">
        <span class="medal">${medalEmoji(i)}</span>
        <span class="podium-name player-link" data-player="${e.name}">${e.name}</span>
        <span class="podium-val">${valFn(e)}</span>
      </div>`).join('')}
    </div>`;

  document.getElementById('podiums').innerHTML =
    podiumHTML('Podio Friendly Fire (Gruul)', ffPodio, e => fmtDmg(e.val)) +
    podiumHTML('Podio Muertes', deathArr, e => e.val + ' muertes') +
    podiumHTML('Podio Vergüenza', shame, e => (e.score*100).toFixed(0)+'% vergüenza');

  document.querySelectorAll('.player-link').forEach(el => {
    el.addEventListener('click', () => openPlayer(el.dataset.player));
  });

  // Global records
  const records = calcGlobalRecords();
  const recCard = (icon, label, rec, nameFn, targetFn) => {
    if (!rec) return `<div class="record-card"><div class="record-icon">${icon}</div><div class="record-label">${label}</div><div class="record-val td-dim">Sin datos</div></div>`;
    const abilityLine = rec.ability ? `<div class="record-ability">${rec.ability}</div>` : '';
    return `<div class="record-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount">${fmtDmg(rec.amount)}</div>
      <div class="record-who"><span class="player-link record-link" data-player="${nameFn(rec)}">${nameFn(rec)}</span> → <span class="player-link record-link" data-player="${targetFn(rec)}">${targetFn(rec)}</span></div>
      ${abilityLine}
      <div class="record-date">${fmtDate(rec.fecha)}</div>
    </div>`;
  };
  const recEl = document.getElementById('global-records');
  recEl.innerHTML = `
    <div class="section-title" style="margin-top:2rem">Récords Históricos</div>
    <div class="records-grid">
      ${recCard('⚔️', 'Golpe más fuerte', records.biggestHit, r => r.heroe, r => r.objetivo)}
      ${recCard('💚', 'Curación más gorda', records.biggestHeal, r => r.healer, r => r.target)}
      ${recCard('💀', 'Golpe más bestia recibido', records.biggestReceived, r => r.agresor, r => r.victima)}
    </div>
  `;
  recEl.querySelectorAll('.record-link').forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.player)));
}

function calcRaidDpsHps(raid) {
  const bosses = raid.dpsStats ?? [];
  if (!bosses.length) return null;
  const totalDmg  = bosses.reduce((s, b) => s + b.totalDmg,  0);
  const totalHeal = bosses.reduce((s, b) => s + b.totalHeal, 0);
  const totalSec  = bosses.reduce((s, b) => s + b.durationMs / 1000, 0);
  if (totalSec <= 0) return null;
  return { dps: Math.round(totalDmg / totalSec), hps: Math.round(totalHeal / totalSec) };
}

function calcGlobalRecords() {
  let biggestHit = null, biggestHeal = null, biggestReceived = null;
  for (const raid of DATA) {
    const bh = raid.biggestHits;
    if (!bh) continue;
    if (bh.biggestDealt?.amount > 0 && (!biggestHit || bh.biggestDealt.amount > biggestHit.amount))
      biggestHit = { ...bh.biggestDealt, fecha: raid.fecha };
    if (bh.biggestHeal?.amount > 0 && (!biggestHeal || bh.biggestHeal.amount > biggestHeal.amount))
      biggestHeal = { ...bh.biggestHeal, fecha: raid.fecha };
    if (bh.biggestReceived?.amount > 0 && (!biggestReceived || bh.biggestReceived.amount > biggestReceived.amount))
      biggestReceived = { ...bh.biggestReceived, fecha: raid.fecha };
  }
  return { biggestHit, biggestHeal, biggestReceived };
}

function raidCountMap() {
  const m = new Map();
  DATA.forEach(r => {
    const players = r.roster
      ? new Set(r.roster)
      : new Set([
          ...r.leaderboard.map(e => e.name),
          ...(r.deathStats?.deaths ?? []).map(e => e.name),
          ...(r.deathStats?.timeDead ?? []).map(e => e.name),
          ...(r.interrupts ?? []).map(e => e.name),
          ...(r.dispels ?? []).map(e => e.name),
        ]);
    players.forEach(name => m.set(name, (m.get(name) ?? 0) + 1));
  });
  return m;
}

// ── FRIENDLY FIRE ─────────────────────────────────────────────────────────────

function buildFF() {
  const data = aggregateMap('leaderboard', 'name');
  const max  = data[0]?.val ?? 1;

  // Stat cards
  const totalFF    = data.reduce((s, e) => s + e.val, 0);
  const mediaRaid  = DATA.length > 0 ? totalFF / DATA.length : 0;
  const raidMaxFF  = DATA.reduce((best, r) => {
    const sum = r.leaderboard.reduce((s, e) => s + e.damage, 0);
    return sum > (best.sum ?? 0) ? { sum, fecha: r.fecha } : best;
  }, {});
  const uniqueFF   = data.length;

  document.getElementById('ff-stats').innerHTML = `
    <div class="stat-cards" style="margin-bottom:2rem">
      <div class="stat-card">
        <div class="label">FF Total Histórico</div>
        <div class="value">${fmtDmg(totalFF)}</div>
        <div class="sub">daño a aliados acumulado</div>
      </div>
      <div class="stat-card">
        <div class="label">Media por Raid</div>
        <div class="value">${fmtDmg(Math.round(mediaRaid))}</div>
        <div class="sub">daño medio entre todos</div>
      </div>
      <div class="stat-card">
        <div class="label">Raid más Caótica</div>
        <div class="value red" style="font-size:1.3rem">${raidMaxFF.fecha ? fmtDate(raidMaxFF.fecha) : '—'}</div>
        <div class="sub">${raidMaxFF.sum ? fmtDmg(raidMaxFF.sum) + ' de FF total' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="label">Jugadores con FF</div>
        <div class="value purple">${uniqueFF}</div>
        <div class="sub">han dañado a un aliado</div>
      </div>
    </div>
  `;

  // Table
  const rcMap = raidCountMap();
  const tbl = document.getElementById('table-ff');
  tbl.innerHTML = `<thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Daño</th><th>Media/Raid</th><th>Raids</th></tr></thead><tbody>
    ${data.map((e,i) => { const rc = rcMap.get(e.name) ?? 1; return `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.val/max*100)}</td>
      <td class="val-cell">${fmtDmg(e.val)}</td>
      <td class="val-cell td-dim">${fmtDmg(Math.round(e.val / rc))}</td>
      <td class="td-dim">${rcMap.get(e.name) ?? '—'}</td>
    </tr>`; }).join('')}
  </tbody>`;
  tbl.querySelectorAll('.player-link').forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.player)));
}

// ── PROGRESIÓN ────────────────────────────────────────────────────────────────

// ── CLASES WOW ────────────────────────────────────────────────────────────────

const CLASS_COLOR = {
  Warrior: '#C69B3A', Paladin: '#F48CBA', Hunter: '#AAD372', Rogue:   '#FFF468',
  Priest:  '#FFFFFF', Shaman:  '#0070DD', Mage:   '#3FC7EB', Warlock: '#8788EE',
  Druid:   '#FF7C0A',
};
const CLASS_ES = {
  Warrior: 'Guerrero', Paladin: 'Paladín', Hunter: 'Cazador', Rogue:   'Pícaro',
  Priest:  'Sacerdote', Shaman: 'Chamán',  Mage:   'Mago',    Warlock: 'Brujo',
  Druid:   'Druida',
};

let PLAYER_CLASS_MAP = {};
let PLAYER_SPEC_MAP  = {};

function buildPlayerMaps() {
  PLAYER_CLASS_MAP = {};
  PLAYER_SPEC_MAP  = {};
  DATA.forEach(r => {
    Object.entries(r.playerClasses ?? {}).forEach(([n, c]) => { if (!PLAYER_CLASS_MAP[n]) PLAYER_CLASS_MAP[n] = c; });
    Object.entries(r.playerSpecs   ?? {}).forEach(([n, s]) => { if (!PLAYER_SPEC_MAP[n])  PLAYER_SPEC_MAP[n]  = s; });
  });
}

function getPlayerClass(name) { return PLAYER_CLASS_MAP[name] ?? null; }
function getPlayerSpec(name)  { return PLAYER_SPEC_MAP[name]  ?? null; }

function classIcon(cls, spec) {
  if (!cls) return '';
  const slug    = cls.toLowerCase();
  const tooltip = [CLASS_ES[cls] ?? cls, spec].filter(Boolean).join(' · ');
  return `<img src="https://wow.zamimg.com/images/wow/icons/medium/classicon_${slug}.jpg" class="class-icon" title="${tooltip}" alt="${cls}">`;
}

function playerBadge(name) {
  const cls = PLAYER_CLASS_MAP[name];
  if (!cls) return '';
  const spec    = PLAYER_SPEC_MAP[name] ?? '';
  const tooltip = [CLASS_ES[cls] ?? cls, spec].filter(Boolean).join(' · ');
  return `<img src="https://wow.zamimg.com/images/wow/icons/medium/classicon_${cls.toLowerCase()}.jpg" class="class-icon-sm" title="${tooltip}" alt="${cls}">`;
}

const PROG_BOSSES = ['High King Maulgar', 'Gruul the Dragonkiller', 'Magtheridon'];
const PROG_SHORT  = ['Maulgar', 'Gruul', 'Magth'];
const PROG_COLORS = ['#f0c84a', '#ff6060', '#c090f0'];

function progLegend(labels, colors) {
  return `<div class="prog-legend">${labels.map((l,i) =>
    `<span class="prog-legend-item"><span class="prog-legend-dot" style="background:${colors[i]}"></span>${l}</span>`
  ).join('')}</div>`;
}

function drawLineChart(xLabels, series, yFormat) {
  const W = 800, H = 240;
  const pad = { top: 20, right: 20, bottom: 44, left: 64 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const n = xLabels.length;

  const allVals = series.flatMap(s => s.values.filter(v => v != null));
  if (!allVals.length) return '<p class="section-note">Sin datos suficientes.</p>';

  const yMax = Math.max(...allVals);
  const yBottom = Math.max(0, Math.min(...allVals) * 0.8);
  const yRange = yMax - yBottom || 1;

  const xPos = i => pad.left + (n <= 1 ? cW / 2 : i * cW / (n - 1));
  const yPos = v => pad.top + cH - (v - yBottom) / yRange * cH;

  const GRID = 4;
  let grid = '', yAxis = '';
  for (let g = 0; g <= GRID; g++) {
    const v = yBottom + yRange * g / GRID;
    const y = yPos(v);
    grid  += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#2e3550" stroke-width="1"/>`;
    yAxis += `<text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#a0aabc" font-size="11">${yFormat(v)}</text>`;
  }

  let xAxis = '';
  xLabels.forEach((l, i) => {
    xAxis += `<text x="${xPos(i).toFixed(1)}" y="${H - pad.bottom + 16}" text-anchor="middle" fill="#a0aabc" font-size="11">${l}</text>`;
  });

  let seriesSVG = '';
  series.forEach(s => {
    let d = '', started = false;
    s.values.forEach((v, i) => {
      if (v == null) { started = false; return; }
      const x = xPos(i).toFixed(1), y = yPos(v).toFixed(1);
      d += started ? ` L${x},${y}` : `M${x},${y}`;
      started = true;
    });
    if (d) seriesSVG += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`;
    s.values.forEach((v, i) => {
      if (v == null) return;
      const x = xPos(i).toFixed(1), y = yPos(v).toFixed(1);
      const tip = s.label ? `${xLabels[i]} · ${s.label}: ${yFormat(v)}` : `${xLabels[i]}: ${yFormat(v)}`;
      seriesSVG += `<circle cx="${x}" cy="${y}" r="5" fill="${s.color}" stroke="#0f1117" stroke-width="2" class="prog-pt" data-tip="${tip}"/>`;
    });
  });

  return `<svg viewBox="0 0 ${W} ${H}" class="prog-svg">
    ${grid}
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="#2e3550" stroke-width="1"/>
    ${yAxis}${xAxis}${seriesSVG}
  </svg>`;
}

function drawStackedBar(xLabels, series) {
  const W = 800, H = 240;
  const pad = { top: 20, right: 20, bottom: 44, left: 40 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const n = xLabels.length;

  const totals = xLabels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0));
  const yMax = Math.max(...totals, 1);
  const gridMax = yMax <= 4 ? yMax : Math.ceil(yMax / Math.ceil(yMax / 4)) * Math.ceil(yMax / 4);
  const gridStep = gridMax <= 4 ? 1 : Math.ceil(gridMax / 4);

  const barSlot = cW / n;
  const barW = Math.min(barSlot * 0.55, 60);
  const xCenter = i => pad.left + i * barSlot + barSlot / 2;
  const yPos = v => pad.top + cH - v / (gridMax || 1) * cH;
  const barH = v => v / (gridMax || 1) * cH;

  let grid = '', yAxis = '';
  for (let g = 0; g <= gridMax; g += gridStep) {
    const y = yPos(g);
    grid  += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#2e3550" stroke-width="1"/>`;
    yAxis += `<text x="${pad.left - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#a0aabc" font-size="11">${g}</text>`;
  }

  let bars = '', xAxis = '';
  xLabels.forEach((label, i) => {
    let stackY = pad.top + cH;
    series.forEach(s => {
      const v = s.values[i] ?? 0;
      if (v <= 0) return;
      const h = barH(v);
      stackY -= h;
      const tip = `${label} · ${s.label}: ${v} wipe${v !== 1 ? 's' : ''}`;
      bars += `<rect x="${(xCenter(i) - barW / 2).toFixed(1)}" y="${stackY.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${s.color}" opacity="0.85" rx="2" class="prog-pt" data-tip="${tip}"/>`;
    });
    const total = totals[i];
    if (total > 0) {
      bars += `<text x="${xCenter(i).toFixed(1)}" y="${(yPos(total) - 5).toFixed(1)}" text-anchor="middle" fill="#a0aabc" font-size="11">${total}</text>`;
    } else {
      bars += `<text x="${xCenter(i).toFixed(1)}" y="${(pad.top + cH - 6).toFixed(1)}" text-anchor="middle" fill="#3d4a6a" font-size="11">0</text>`;
    }
    xAxis += `<text x="${xCenter(i).toFixed(1)}" y="${H - pad.bottom + 16}" text-anchor="middle" fill="#a0aabc" font-size="11">${label}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" class="prog-svg">
    ${grid}
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="#2e3550" stroke-width="1"/>
    ${yAxis}${bars}${xAxis}
  </svg>`;
}

const DPS_COLOR = '#7ec8e3';
const HPS_COLOR = '#4ec97e';

// ── POR RAID ──────────────────────────────────────────────────────────────────

function buildPorRaid() {
  const el = document.getElementById('tab-por-raid');
  if (!DATA.length) { el.innerHTML = '<div class="empty-msg">No hay raids registradas.</div>'; return; }

  const raids = [...DATA].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
      <span style="color:var(--text-dim);font-size:1rem;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.05em;line-height:1;align-self:center">Raid</span>
      <select id="raid-selector" class="loot-select" style="min-width:160px">
        ${raids.map((r, i) => `<option value="${i}">${fmtDate(r.fecha)}</option>`).join('')}
      </select>
    </div>
    <div id="por-raid-content"></div>
  `;

  function bossShort(n) {
    if (n.includes('Maulgar'))     return 'Maulgar';
    if (n.includes('Gruul'))       return 'Gruul';
    if (n.includes('Magtheridon')) return 'Magtheridon';
    return n;
  }

  function miniTable(headers, rows, emptyMsg) {
    if (!rows.length) return `<div class="section-note">${emptyMsg}</div>`;
    return `<table class="ranked-list"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }

  function renderRaid(raid) {
    const bs  = raid.bossStats;
    const dps = calcRaidDpsHps(raid);

    // ── Stat cards ──
    const dur = bs?.totalRaidTimeMs > 0 ? fmtMs(bs.totalRaidTimeMs) : '—';
    const statCards = `
      <div class="stat-cards" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="label">Duración</div>
          <div class="value" style="font-size:1.3rem">${dur}</div>
          <div class="sub">tiempo total de raid</div>
        </div>
        <div class="stat-card">
          <div class="label">Resultado</div>
          <div class="value">${bs?.totalKills ?? 0} <span style="font-size:.85rem;color:var(--text-dim)">kills</span></div>
          <div class="sub">${bs?.totalWipes ?? 0} wipes</div>
        </div>
        ${dps ? `
        <div class="stat-card">
          <div class="label">DPS Medio</div>
          <div class="value" style="color:${DPS_COLOR}">${fmtDmg(dps.dps)}</div>
          <div class="sub">media 3 kills</div>
        </div>
        <div class="stat-card">
          <div class="label">HPS Medio</div>
          <div class="value" style="color:${HPS_COLOR}">${fmtDmg(dps.hps)}</div>
          <div class="sub">media 3 kills</div>
        </div>` : ''}
      </div>`;

    // ── Boss cards ──
    const bossCards = (raid.dpsStats ?? []).map(b => {
      const wipes     = (bs?.bosses ?? []).find(x => x.name === b.name)?.wipes ?? 0;
      const bossIdx   = PROG_BOSSES.indexOf(b.name);
      const bossColor = bossIdx >= 0 ? PROG_COLORS[bossIdx] : 'var(--text-bright)';
      return `<div class="stat-card">
        <div class="label" style="color:${bossColor}">${bossShort(b.name)}</div>
        <div class="value" style="font-size:1.2rem">${fmtMs(b.durationMs)}</div>
        <div class="sub">${fmtDmg(b.dps)} DPS · ${fmtDmg(b.hps)} HPS</div>
        ${wipes > 0 ? `<div class="sub" style="color:var(--red2)">${wipes} wipe${wipes > 1 ? 's' : ''} antes del kill</div>` : '<div class="sub" style="color:var(--green)">sin wipes ✓</div>'}
      </div>`;
    }).join('');

    // ── FF ──
    const ff    = raid.leaderboard ?? [];
    const ffMax = ff[0]?.damage ?? 1;
    const ffRows = ff.slice(0, 5).map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.damage / ffMax * 100)}</td>
      <td class="val-cell red">${fmtDmg(e.damage)}</td>
    </tr>`);

    // ── Muertes ──
    const deaths   = raid.deathStats?.deaths ?? [];
    const deathMax = deaths[0]?.count ?? 1;
    const deathRows = deaths.slice(0, 5).map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.count / deathMax * 100, 'red')}</td>
      <td class="val-cell red">${e.count} ×</td>
    </tr>`);

    // ── Tiempo muerto ──
    const timeDead    = raid.deathStats?.timeDead ?? [];
    const timeDeadMax = timeDead[0]?.ms ?? 1;
    const timeDeadRows = timeDead.slice(0, 5).map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.ms / timeDeadMax * 100, 'red')}</td>
      <td class="val-cell red">${fmtMs(e.ms)}</td>
    </tr>`);

    // ── Vergüenza (esta raid) ──
    const participants = raid.roster ? new Set(raid.roster)
      : new Set([...ff.map(e => e.name), ...deaths.map(e => e.name), ...timeDead.map(e => e.name)]);
    const n = participants.size;
    const shameRows = (() => {
      if (n <= 1) return [];
      const pct = (list, name, valKey) => {
        const idx = list.findIndex(e => e.name === name);
        return idx === -1 ? 0 : (n - 1 - idx) / (n - 1);
      };
      return [...participants]
        .map(name => ({
          name,
          score: (pct(ff, name) + pct(deaths, name) + pct(timeDead, name)) / 3,
        }))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((e, i) => `<tr>
          <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
          <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
          <td class="bar-cell">${makeBar(e.score * 100)}</td>
          <td class="val-cell">${(e.score * 100).toFixed(0)}%</td>
        </tr>`);
    })();

    // ── Interrupts ──
    const ints   = raid.interrupts ?? [];
    const intMax = ints[0]?.total ?? 1;
    const intRows = ints.slice(0, 5).map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.total / intMax * 100, 'purple')}</td>
      <td class="val-cell purple">${e.total}</td>
    </tr>`);

    // ── Dispels ──
    const disps   = raid.dispels ?? [];
    const dispMax = disps[0]?.total ?? 1;
    const dispRows = disps.slice(0, 5).map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.total / dispMax * 100, 'purple')}</td>
      <td class="val-cell purple">${e.total}</td>
    </tr>`);

    // ── Bigger hits ──
    const bh = raid.biggestHits;
    const hitCard = (icon, label, name, amount, secondary, ability) => `
      <div class="record-card">
        <div class="record-icon">${icon}</div>
        <div class="record-label">${label}</div>
        <div class="record-amount">${fmtDmg(amount)}</div>
        <div class="record-who">${name}</div>
        <div class="record-ability" style="color:var(--text-dim)">${secondary}</div>
        ${ability ? `<div class="record-ability">${ability}</div>` : ''}
      </div>`;

    const hitsHTML = bh ? `
      <div class="section-title" style="margin-top:2rem">Golpes de la Noche</div>
      <div class="records-grid">
        ${bh.biggestDealt    ? hitCard('⚔️', 'Golpe más fuerte',          bh.biggestDealt.heroe,          bh.biggestDealt.amount,    '→ ' + bh.biggestDealt.objetivo,    bh.biggestDealt.ability ?? '')    : ''}
        ${bh.biggestHeal     ? hitCard('💚', 'Cura más gorda',            bh.biggestHeal.healer,           bh.biggestHeal.amount,     '→ ' + bh.biggestHeal.target,       bh.biggestHeal.ability ?? '')     : ''}
        ${bh.biggestReceived ? hitCard('💀', 'Golpe más bestia recibido', bh.biggestReceived.victima,      bh.biggestReceived.amount, '← ' + bh.biggestReceived.agresor,  bh.biggestReceived.ability ?? '') : ''}
      </div>` : '';

    document.getElementById('por-raid-content').innerHTML = `
      ${statCards}
      <div class="section-title">Boss Kills</div>
      <div class="stat-cards" style="margin-bottom:2rem">${bossCards || '<div class="section-note">Sin datos de boss kills.</div>'}</div>
      <div class="two-col" style="margin-bottom:2rem">
        <div>
          <div class="section-title">Friendly Fire</div>
          ${miniTable(['', 'Jugador', '', 'Daño'], ffRows, '¡Nadie hizo friendly fire! 🎉')}
        </div>
        <div>
          <div class="section-title">Vergüenza</div>
          ${miniTable(['', 'Jugador', '', 'Score'], shameRows, 'Sin datos suficientes.')}
        </div>
      </div>
      <div class="two-col" style="margin-bottom:2rem">
        <div>
          <div class="section-title">Muertes</div>
          ${miniTable(['', 'Jugador', '', 'Muertes'], deathRows, '¡Nadie murió! 🎉')}
        </div>
        <div>
          <div class="section-title">Tiempo Muerto</div>
          ${miniTable(['', 'Jugador', '', 'Tiempo'], timeDeadRows, 'Sin datos de tiempo muerto.')}
        </div>
      </div>
      <div class="two-col" style="margin-bottom:2rem">
        <div>
          <div class="section-title">Interrupts</div>
          ${miniTable(['', 'Jugador', '', 'Total'], intRows, 'Sin datos de interrupts.')}
        </div>
        <div>
          <div class="section-title">Dispels</div>
          ${miniTable(['', 'Jugador', '', 'Total'], dispRows, 'Sin datos de dispels.')}
        </div>
      </div>
      ${hitsHTML}
    `;

    document.getElementById('por-raid-content').querySelectorAll('.player-link')
      .forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.player)));
  }

  renderRaid(raids[0]);
  document.getElementById('raid-selector').addEventListener('change', e => renderRaid(raids[+e.target.value]));
}

function buildDpsHpsChart(raids, xLabels) {
  const raidStats = raids.map(r => calcRaidDpsHps(r));
  if (raidStats.every(s => s === null)) return '';
  const dpsSeries = [
    { label: 'DPS', color: DPS_COLOR, values: raidStats.map(s => s?.dps ?? null) },
    { label: 'HPS', color: HPS_COLOR, values: raidStats.map(s => s?.hps ?? null) },
  ];
  return `
    <div class="prog-chart">
      <div class="prog-chart-title">DPS y HPS por Raid</div>
      <div class="prog-chart-note">Media ponderada de los 3 boss kills de cada raid (daño o cura total ÷ duración total)</div>
      ${drawLineChart(xLabels, dpsSeries, v => fmtDmg(Math.round(v)))}
      ${progLegend(['DPS', 'HPS'], [DPS_COLOR, HPS_COLOR])}
    </div>
  `;
}

function buildDpsHpsTable(raids, xLabels) {
  const raidStats = raids.map(r => calcRaidDpsHps(r));
  if (raidStats.every(s => s === null)) return '';

  const bossNames = [...new Set(raids.flatMap(r => (r.dpsStats ?? []).map(b => b.name)))];
  const shortName = n => {
    if (n.includes('Maulgar'))     return 'Maulgar';
    if (n.includes('Gruul'))       return 'Gruul';
    if (n.includes('Magtheridon')) return 'Magth';
    return n.split(' ').pop();
  };

  const BOSS_VAL_COLOR = 'var(--text-dim)';
  const MEDIA_COLOR    = '#f0c84a';

  const dpsRows = raids.map((raid, i) => {
    const cells = bossNames.map(bn => {
      const b = (raid.dpsStats ?? []).find(b => b.name === bn);
      return b ? `<td class="val-cell" style="color:${BOSS_VAL_COLOR}">${fmtDmg(b.dps)}</td>` : `<td class="td-dim">—</td>`;
    }).join('');
    const total = raidStats[i];
    return `<tr>
      <td class="td-dim">${xLabels[i]}</td>
      ${cells}
      <td class="val-cell" style="color:${MEDIA_COLOR};font-weight:600">${total ? fmtDmg(total.dps) : '—'}</td>
    </tr>`;
  });

  const hpsRows = raids.map((raid, i) => {
    const cells = bossNames.map(bn => {
      const b = (raid.dpsStats ?? []).find(b => b.name === bn);
      return b ? `<td class="val-cell" style="color:${BOSS_VAL_COLOR}">${fmtDmg(b.hps)}</td>` : `<td class="td-dim">—</td>`;
    }).join('');
    const total = raidStats[i];
    return `<tr>
      <td class="td-dim">${xLabels[i]}</td>
      ${cells}
      <td class="val-cell" style="color:${MEDIA_COLOR};font-weight:600">${total ? fmtDmg(total.hps) : '—'}</td>
    </tr>`;
  });

  const bossHeaders = bossNames.map(bn => `<th>${shortName(bn)}</th>`).join('');
  const makeTable = (title, color, rows) => `
    <div style="flex-shrink:0">
      <div style="font-size:0.8rem;font-weight:600;color:${color};letter-spacing:.06em;text-transform:uppercase;margin-bottom:.4rem">${title}</div>
      <table class="ranked-list" style="width:auto">
        <thead><tr><th>Fecha</th>${bossHeaders}<th style="color:${MEDIA_COLOR}">Media</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;

  return `
    <div class="section-title" style="margin-top:2rem">DPS y HPS por Raid</div>
    <div style="display:flex;gap:2rem;flex-wrap:nowrap;overflow-x:auto;margin-bottom:2rem;align-items:flex-start">
      ${makeTable('DPS', DPS_COLOR, dpsRows)}
      ${makeTable('HPS', HPS_COLOR, hpsRows)}
    </div>
  `;
}

function buildProgresion() {
  const raids = DATA.filter(r => r.bossStats).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const el = document.getElementById('tab-progresion');
  if (!raids.length) {
    el.innerHTML = '<div class="section-note">No hay datos de progresión disponibles.</div>';
    return;
  }

  const xLabels = raids.map(r => fmtDate(r.fecha));

  // ── Stat cards ──
  const totalWipes = raids.reduce((s, r) => s + r.bossStats.totalWipes, 0);
  const totalKills = raids.reduce((s, r) => s + r.bossStats.totalKills, 0);
  const totalTries = totalWipes + totalKills;
  const globalEff  = totalTries > 0 ? Math.round(totalKills / totalTries * 100) : 0;

  const wipesByBoss = new Map(PROG_BOSSES.map(b => [b, 0]));
  raids.forEach(r => (r.bossStats.bosses ?? []).forEach(b => wipesByBoss.set(b.name, (wipesByBoss.get(b.name) ?? 0) + b.wipes)));
  const sortedByWipes = [...wipesByBoss.entries()].sort((a, b) => b[1] - a[1]);
  const [worstBossName, worstBossWipes] = sortedByWipes[0] ?? [null, 0];
  const [bestBossName,  bestBossWipes]  = sortedByWipes[sortedByWipes.length - 1] ?? [null, 0];
  const worstBossIdx   = PROG_BOSSES.indexOf(worstBossName);
  const bestBossIdx    = PROG_BOSSES.indexOf(bestBossName);
  const worstBossShort = worstBossIdx >= 0 ? PROG_SHORT[worstBossIdx] : (worstBossName ?? '—');
  const bestBossShort  = bestBossIdx  >= 0 ? PROG_SHORT[bestBossIdx]  : (bestBossName  ?? '—');
  const worstBossColor = worstBossIdx >= 0 ? PROG_COLORS[worstBossIdx] : 'var(--text-bright)';
  const bestBossColor  = bestBossIdx  >= 0 ? PROG_COLORS[bestBossIdx]  : 'var(--text-bright)';

  const raidWipes   = raids.map(r => r.bossStats.totalWipes);
  const minWipes    = Math.min(...raidWipes);
  const maxWipes    = Math.max(...raidWipes);
  const cleanestIdx = raidWipes.lastIndexOf(minWipes);
  const chaosIdx    = raidWipes.indexOf(maxWipes);

  // ── Chart 1: Raid time ──
  const raidTimeSeries = [{
    label: '', color: '#f0c84a',
    values: raids.map(r => r.bossStats.totalRaidTimeMs > 0 ? r.bossStats.totalRaidTimeMs / 60000 : null),
  }];

  // ── Chart 2: Kill time por boss ──
  const killTimeSeries = PROG_BOSSES.map((bossName, i) => ({
    label: PROG_SHORT[i], color: PROG_COLORS[i],
    values: raids.map(r => {
      const b = (r.bossStats.bosses ?? []).find(b => b.name === bossName);
      return b?.killTimeMs ? b.killTimeMs : null;
    }),
  }));

  // ── Chart 3: Wipes por raid ──
  const wipeSeries = PROG_BOSSES.map((bossName, i) => ({
    label: PROG_SHORT[i], color: PROG_COLORS[i],
    values: raids.map(r => (r.bossStats.bosses ?? []).find(b => b.name === bossName)?.wipes ?? 0),
  }));

  // ── Tabla acumulada ──
  const bossRows = PROG_BOSSES.map((bossName, i) => {
    const totalW     = wipesByBoss.get(bossName) ?? 0;
    const attempted  = raids.filter(r => (r.bossStats.bosses ?? []).some(b => b.name === bossName)).length;
    const cleanRaids = raids.filter(r => {
      const b = (r.bossStats.bosses ?? []).find(b => b.name === bossName);
      return b && b.wipes === 0;
    }).length;
    return { short: PROG_SHORT[i], color: PROG_COLORS[i], totalW, attempted, cleanRaids };
  });

  el.innerHTML = `
    <div class="stat-cards" style="margin-bottom:2rem">
      <div class="stat-card">
        <div class="label">Raid más Limpia</div>
        <div class="value" style="font-size:1.4rem">${fmtDate(raids[cleanestIdx].fecha)}</div>
        <div class="sub">${minWipes === 0 ? 'Sin wipes' : minWipes + ' wipes'}</div>
      </div>
      <div class="stat-card">
        <div class="label">Raid más Caótica</div>
        <div class="value red" style="font-size:1.4rem">${fmtDate(raids[chaosIdx].fecha)}</div>
        <div class="sub">${maxWipes} wipe${maxWipes !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="label">Boss más Problemático</div>
        <div class="value" style="color:${worstBossColor};font-size:1.4rem">${worstBossShort}</div>
        <div class="sub">${worstBossWipes} wipe${worstBossWipes !== 1 ? 's' : ''} acumulados</div>
      </div>
      <div class="stat-card">
        <div class="label">Boss menos Problemático</div>
        <div class="value" style="color:${bestBossColor};font-size:1.4rem">${bestBossShort}</div>
        <div class="sub">${bestBossWipes} wipe${bestBossWipes !== 1 ? 's' : ''} acumulados</div>
      </div>
    </div>

    <div class="prog-chart">
      <div class="prog-chart-title">Duración de Raid</div>
      <div class="prog-chart-note">Tiempo total de cada raid en minutos</div>
      ${drawLineChart(xLabels, raidTimeSeries, v => Math.round(v) + 'min')}
    </div>

    <div class="prog-chart">
      <div class="prog-chart-title">Tiempo de Kill por Boss</div>
      ${drawLineChart(xLabels, killTimeSeries, v => fmtMs(v))}
      ${progLegend(PROG_SHORT, PROG_COLORS)}
    </div>

    ${buildDpsHpsChart(raids, xLabels)}

    <div class="prog-chart">
      <div class="prog-chart-title">Wipes por Raid</div>
      <div class="prog-chart-note">Barras apiladas por boss. El número sobre la barra es el total de wipes de esa raid.</div>
      ${drawStackedBar(xLabels, wipeSeries)}
      ${progLegend(PROG_SHORT, PROG_COLORS)}
    </div>

    ${buildDpsHpsTable(raids, xLabels)}

    <div class="section-title">Wipes Acumulados por Boss</div>
    <table class="ranked-list" style="max-width:480px;margin-bottom:2rem">
      <thead><tr><th>Boss</th><th>Wipes</th><th>Raids intentadas</th><th>Raids sin wipe</th></tr></thead>
      <tbody>
        ${bossRows.map(b => `<tr>
          <td style="color:${b.color};font-weight:600">${b.short}</td>
          <td class="val-cell" style="color:var(--red2)">${b.totalW}</td>
          <td class="td-dim">${b.attempted}</td>
          <td class="td-dim">${b.cleanRaids} / ${b.attempted}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div id="prog-tooltip" class="prog-tooltip"></div>
  `;

  // Tooltip interaction
  const tip = el.querySelector('#prog-tooltip');
  el.querySelectorAll('.prog-pt').forEach(pt => {
    pt.addEventListener('mouseenter', () => { tip.textContent = pt.dataset.tip; tip.classList.add('visible'); });
    pt.addEventListener('mousemove', e => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY - 36) + 'px'; });
    pt.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}

// ── VERGÜENZA ─────────────────────────────────────────────────────────────────

function buildVerguenza() {
  const data = calcShame();
  const max  = data[0]?.score ?? 1;

  // Peor y mejor actuación individual en una sola raid
  let worstRaid = null, bestRaid = null;
  DATA.forEach(raid => {
    const participants = raid.roster ? new Set(raid.roster)
      : new Set([...raid.leaderboard.map(e=>e.name), ...(raid.deathStats?.deaths??[]).map(e=>e.name), ...(raid.deathStats?.timeDead??[]).map(e=>e.name)]);
    const n = participants.size;
    if (n <= 1) return;
    const pct = (list, name) => {
      const idx = list.findIndex(e => e.name === name);
      return idx === -1 ? 0 : (n - 1 - idx) / (n - 1);
    };
    for (const name of participants) {
      const score = (pct(raid.leaderboard, name) + pct(raid.deathStats?.deaths??[], name) + pct(raid.deathStats?.timeDead??[], name)) / 3;
      if (!worstRaid || score > worstRaid.score) worstRaid = { name, score, fecha: raid.fecha };
      if (!bestRaid  || score < bestRaid.score)  bestRaid  = { name, score, fecha: raid.fecha };
    }
  });

  document.getElementById('tab-verguenza').insertAdjacentHTML('afterbegin', `
    <div class="stat-cards" style="margin-bottom:2rem">
      <div class="stat-card">
        <div class="label">Noche más Vergonzosa</div>
        <div class="value red" style="font-size:1.3rem">${worstRaid?.name ?? '—'}</div>
        <div class="sub">${worstRaid ? (worstRaid.score*100).toFixed(1) + '% · ' + fmtDate(worstRaid.fecha) : ''}</div>
      </div>
      <div class="stat-card">
        <div class="label">Noche más Ejemplar</div>
        <div class="value" style="font-size:1.3rem">${bestRaid?.name ?? '—'}</div>
        <div class="sub">${bestRaid ? (bestRaid.score*100).toFixed(1) + '% · ' + fmtDate(bestRaid.fecha) : ''}</div>
      </div>
    </div>`);

  document.getElementById('shame-explanation').innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:1rem 1.2rem;margin-bottom:1.2rem;font-size:0.85rem;color:var(--text-dim);line-height:1.6">
      <strong style="color:var(--text-bright)">¿Cómo se calcula?</strong><br>
      Por cada raid, a cada jugador se le asigna un percentil en tres categorías:
      <strong style="color:var(--gold)">daño a aliados (Gruul)</strong>,
      <strong style="color:var(--red2)">número de muertes</strong> y
      <strong style="color:var(--red2)">tiempo muerto</strong>.
      El percentil indica qué porcentaje de compañeros tuvo un resultado mejor que el tuyo
      (0% = el menos vergonzoso, 100% = el peor de la raid).
      La puntuación final es la media de esos percentiles promediada sobre todas las raids asistidas.
    </div>`;

  const tbl = document.getElementById('table-verguenza');
  tbl.innerHTML = `<thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Score</th><th>Raids</th></tr></thead><tbody>
    ${data.map((e,i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell"><div class="bar-wrap"><div class="bar-fill" style="width:${(e.score/max*100).toFixed(1)}%;background:var(--red2)"></div></div></td>
      <td class="val-cell" style="color:var(--red2)">${(e.score*100).toFixed(1)}%</td>
      <td class="td-dim">${e.count}</td>
    </tr>`).join('')}
  </tbody>`;
  tbl.querySelectorAll('.player-link').forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.player)));
}

// ── MUERTES ───────────────────────────────────────────────────────────────────

function buildMuertes() {
  const dMap = new Map(), tMap = new Map(), fMap = new Map();
  DATA.forEach(r => {
    (r.deathStats?.deaths??[]).forEach(e => dMap.set(e.name,(dMap.get(e.name)??0)+e.count));
    (r.deathStats?.timeDead??[]).forEach(e => tMap.set(e.name,(tMap.get(e.name)??0)+e.ms));
    const f = r.deathStats?.firstToDie?.name;
    if (f) fMap.set(f,(fMap.get(f)??0)+1);
  });

  const deaths = [...dMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val);
  const tdead  = [...tMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val);
  const first  = [...fMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val);

  const maxF = first[0]?.val  ?? 1;

  const rcMap = raidCountMap();
  const mkTable = (id, arr, valFn, cls) => {
    const el = document.getElementById(id);
    el.innerHTML = `<thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Total</th><th>Raids</th></tr></thead><tbody>
      ${arr.map((e,i)=>`<tr>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(e.val/Math.max(...arr.map(x=>x.val))*100, cls)}</td>
        <td class="val-cell ${cls}">${valFn(e)}</td>
        <td class="td-dim">${rcMap.get(e.name) ?? '—'}</td>
      </tr>`).join('')}
    </tbody>`;
    el.querySelectorAll('.player-link').forEach(el2 => el2.addEventListener('click', () => openPlayer(el2.dataset.player)));
  };

  mkTable('table-deaths',  deaths, e => e.val + ' ×', 'red');
  mkTable('table-timedead',tdead,  e => fmtMs(e.val), 'purple');

  const fd = document.getElementById('table-firstdie');
  fd.innerHTML = `<thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Veces</th></tr></thead><tbody>
    ${first.map((e,i)=>`<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(e.val/maxF*100,'red')}</td>
      <td class="val-cell red">${e.val} ×</td>
    </tr>`).join('')}
  </tbody>`;
  fd.querySelectorAll('.player-link').forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.player)));
}

// ── MECÁNICAS ─────────────────────────────────────────────────────────────────

function buildMecanicas() {
  const intMap = new Map(), disMap = new Map();
  DATA.forEach(r => {
    (r.interrupts??[]).forEach(e => intMap.set(e.name,(intMap.get(e.name)??0)+e.total));
    (r.dispels??[]).forEach(e => disMap.set(e.name,(disMap.get(e.name)??0)+e.total));
  });

  const ints = [...intMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val);
  const disp = [...disMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val);

  const rcMap = raidCountMap();
  const mkTable = (id, arr) => {
    const el = document.getElementById(id);
    if (!arr.length) { el.innerHTML = '<tr><td colspan="5" class="empty-msg">Sin datos</td></tr>'; return; }
    const maxV = arr[0].val;
    el.innerHTML = `<thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Total</th><th>Raids</th></tr></thead><tbody>
      ${arr.map((e,i)=>`<tr>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(e.val/maxV*100,'purple')}</td>
        <td class="val-cell purple">${e.val}</td>
        <td class="td-dim">${rcMap.get(e.name) ?? '—'}</td>
      </tr>`).join('')}
    </tbody>`;
    el.querySelectorAll('.player-link').forEach(el2 => el2.addEventListener('click', () => openPlayer(el2.dataset.player)));
  };
  mkTable('table-interrupts', ints);
  mkTable('table-dispels', disp);
}

// ── HISTORIAL ─────────────────────────────────────────────────────────────────

function buildHistorial() {
  const container = document.getElementById('raid-list');
  if (!DATA.length) { container.innerHTML = '<div class="empty-msg">No hay raids registradas.</div>'; return; }

  // Mejores tiempos por columna para resaltarlos
  const minTime = (fn) => { const vals = DATA.map(fn).filter(Boolean); return vals.length ? Math.min(...vals) : null; };
  const bestDuration  = minTime(r => r.bossStats?.totalRaidTimeMs || null);
  const bestByBoss    = {
    'High King Maulgar':      minTime(r => (r.bossStats?.bosses ?? []).find(b => b.name === 'High King Maulgar')?.killTimeMs || null),
    'Gruul the Dragonkiller': minTime(r => (r.bossStats?.bosses ?? []).find(b => b.name === 'Gruul the Dragonkiller')?.killTimeMs || null),
    'Magtheridon':            minTime(r => (r.bossStats?.bosses ?? []).find(b => b.name === 'Magtheridon')?.killTimeMs || null),
  };

  const timeCell = (ms, best) => {
    if (!ms) return '<span class="td-dim">—</span>';
    return ms === best
      ? `<span class="time-best">★ ${fmtMs(ms)}</span>`
      : `<span class="time-normal">${fmtMs(ms)}</span>`;
  };

  const rows = [...DATA].sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(r => {
    const bs          = r.bossStats;
    const port        = r.leaderboard[0];
    const fd          = r.deathStats?.firstToDie?.name ?? '—';
    const topInt      = r.interrupts?.[0];
    const totalDeaths = (r.deathStats?.deaths ?? []).reduce((s, e) => s + e.count, 0);
    const effVal      = bs?.totalTries > 0 ? Math.round(bs.totalKills / bs.totalTries * 100) : null;
    const effColor    = effVal === null ? 'var(--text-dim)' : effVal >= 80 ? 'var(--gold)' : effVal >= 50 ? 'var(--purple2)' : 'var(--red2)';
    const bossKillTime = name => (bs?.bosses ?? []).find(b => b.name === name)?.killTimeMs || null;

    const top3ff  = r.leaderboard.slice(0, 3);
    const top3d   = (r.deathStats?.deaths ?? []).slice(0, 3);
    const top3int = (r.interrupts ?? []).slice(0, 3);
    const top3dis = (r.dispels ?? []).slice(0, 3);
    const bh      = r.biggestHits;

    const miniList = (arr, valFn) => arr.length
      ? `<ul>${arr.map(e => `<li>${e.name}<span>${valFn(e)}</span></li>`).join('')}</ul>`
      : '<span style="color:var(--text-dim);font-style:italic">—</span>';

    const hitsHtml = bh ? `
      <div class="raid-section">
        <div class="raid-section-title">💥 Golpe recibido</div>
        <ul>
          <li>${bh.biggestReceived?.victima ?? '—'}<span>${fmtDmg(bh.biggestReceived?.amount ?? 0)}</span></li>
          <li style="color:var(--text-dim);font-size:.8rem">por ${bh.biggestReceived?.agresor ?? '—'}</li>
          ${bh.biggestReceived?.ability ? `<li style="color:var(--purple2);font-size:.8rem;font-style:italic">${bh.biggestReceived.ability}</li>` : ''}
        </ul>
      </div>
      <div class="raid-section">
        <div class="raid-section-title">⚔️ Golpe dado</div>
        <ul>
          <li>${bh.biggestDealt?.heroe ?? '—'}<span>${fmtDmg(bh.biggestDealt?.amount ?? 0)}</span></li>
          <li style="color:var(--text-dim);font-size:.8rem">a ${bh.biggestDealt?.objetivo ?? '—'}</li>
          ${bh.biggestDealt?.ability ? `<li style="color:var(--purple2);font-size:.8rem;font-style:italic">${bh.biggestDealt.ability}</li>` : ''}
        </ul>
      </div>
      ${bh.biggestHeal ? `<div class="raid-section">
        <div class="raid-section-title">💚 Curación</div>
        <ul>
          <li>${bh.biggestHeal.healer}<span>${fmtDmg(bh.biggestHeal.amount)}</span></li>
          <li style="color:var(--text-dim);font-size:.8rem">a ${bh.biggestHeal.target}</li>
          ${bh.biggestHeal.ability ? `<li style="color:var(--purple2);font-size:.8rem;font-style:italic">${bh.biggestHeal.ability}</li>` : ''}
        </ul>
      </div>` : ''}` : '';

    return `
      <tr class="historial-row">
        <td class="td-gold">${fmtDate(r.fecha)}</td>
        <td>${timeCell(bs?.totalRaidTimeMs || null, bestDuration)}</td>
        <td>${effVal !== null
          ? `<strong style="color:${effColor}">${effVal}%</strong> <span class="td-dim">(${bs.totalKills}K/${bs.totalWipes}W)</span>`
          : '<span class="td-dim">—</span>'}</td>
        <td>${timeCell(bossKillTime('High King Maulgar'),      bestByBoss['High King Maulgar'])}</td>
        <td>${timeCell(bossKillTime('Gruul the Dragonkiller'), bestByBoss['Gruul the Dragonkiller'])}</td>
        <td>${timeCell(bossKillTime('Magtheridon'),            bestByBoss['Magtheridon'])}</td>
        <td class="td-red" style="text-align:center">${totalDeaths || '<span class="td-dim">0</span>'}</td>
        <td style="color:var(--name)">${port ? `${port.name} <span class="td-dim" style="font-size:.8rem">${fmtDmg(port.damage)} FF</span>` : '<span class="td-dim">—</span>'}</td>
        <td style="text-align:right"><span class="h-arrow">▼</span></td>
      </tr>
      <tr class="historial-detail">
        <td colspan="9">
          <div class="raid-body-grid">
            <div class="raid-section">
              <div class="raid-section-title">🏹 Bosses</div>
              ${bs ? `<ul>${(bs.bosses ?? []).map(b => `<li>${b.name}<span>${b.kills}K / ${b.wipes}W${b.killTimeMs ? ' · ' + fmtMs(b.killTimeMs) : ''}</span></li>`).join('')}</ul>` : '<span style="color:var(--text-dim);font-style:italic">—</span>'}
            </div>
            <div class="raid-section">
              <div class="raid-section-title">💀 1º en Morir</div>
              <ul><li style="color:var(--name)">${fd}</li></ul>
            </div>
            <div class="raid-section">
              <div class="raid-section-title">🍺 FF Top 3</div>
              ${miniList(top3ff, e => fmtDmg(e.damage))}
            </div>
            <div class="raid-section">
              <div class="raid-section-title">💀 Muertes Top 3</div>
              ${miniList(top3d, e => e.count + '×')}
            </div>
            <div class="raid-section">
              <div class="raid-section-title">Interrupts Top 3</div>
              ${miniList(top3int, e => e.total)}
            </div>
            <div class="raid-section">
              <div class="raid-section-title">Dispels Top 3</div>
              ${miniList(top3dis, e => e.total)}
            </div>
            ${hitsHtml}
            <div class="raid-section">
              <div class="raid-section-title">Roster</div>
              <span style="color:var(--text-dim);font-size:.8rem">${(r.roster ?? []).join(', ') || '—'}</span>
            </div>
          </div>
          <a class="raid-link" href="https://fresh.warcraftlogs.com/reports/${r.report}" target="_blank">↗ Ver en WarcraftLogs</a>
        </td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <table class="historial-table">
      <thead><tr>
        <th>Fecha</th>
        <th>Duración</th>
        <th>Efectividad</th>
        <th>Maulgar</th>
        <th>Gruul</th>
        <th>Magtheridon</th>
        <th style="text-align:center">Muertes</th>
        <th title="Portador de la Resaca">Portador</th>
        <th></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  container.querySelectorAll('.historial-row').forEach(row => {
    row.addEventListener('click', () => {
      row.classList.toggle('open');
      row.nextElementSibling.classList.toggle('open');
    });
  });

  container.querySelectorAll('.player-link').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); openPlayer(el.dataset.player); });
  });
}

// ── RÉCORDS DE TIEMPO ─────────────────────────────────────────────────────────

function buildTimeRecords() {
  const withTime = DATA.filter(r => r.bossStats?.totalRaidTimeMs > 0);
  if (!withTime.length) return;

  const fastest = withTime.reduce((a, b) => a.bossStats.totalRaidTimeMs < b.bossStats.totalRaidTimeMs ? a : b);
  const slowest = withTime.reduce((a, b) => a.bossStats.totalRaidTimeMs > b.bossStats.totalRaidTimeMs ? a : b);

  const BOSS_LABELS = {
    'High King Maulgar':     { label: 'Kill más rápido · Maulgar',      icon: '👑' },
    'Gruul the Dragonkiller':{ label: 'Kill más rápido · Gruul',        icon: '🐉' },
    'Magtheridon':           { label: 'Kill más rápido · Magtheridon',  icon: '💀' },
  };

  const fastestByBoss = Object.entries(BOSS_LABELS).map(([name, { label, icon }]) => {
    let best = null;
    for (const r of withTime) {
      const b = (r.bossStats.bosses ?? []).find(b => b.name === name);
      if (b?.killTimeMs && (!best || b.killTimeMs < best.killTimeMs))
        best = { killTimeMs: b.killTimeMs, fecha: r.fecha };
    }
    return best ? { label, icon, killTimeMs: best.killTimeMs, fecha: best.fecha } : null;
  }).filter(Boolean);

  const timeCard = (icon, label, ms, fecha) => `
    <div class="record-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount">${fmtMs(ms)}</div>
      <div class="record-date">${fmtDate(fecha)}</div>
    </div>`;

  const el = document.getElementById('time-records');
  el.innerHTML = `
    <div class="section-title" style="margin-top:2rem">Récords de Tiempo</div>
    <div class="records-grid">
      ${timeCard('⚡', 'Raid más rápida', fastest.bossStats.totalRaidTimeMs, fastest.fecha)}
      ${fastestByBoss.map(b => timeCard(b.icon, b.label, b.killTimeMs, b.fecha)).join('')}
    </div>
  `;
}

// ── JUGADOR ───────────────────────────────────────────────────────────────────

function setupJugador() {
  const input = document.getElementById('player-search');
  const sugg  = document.getElementById('player-suggestions');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { sugg.classList.remove('visible'); return; }
    const matches = ALL_PLAYERS.filter(p => p.toLowerCase().includes(q)).slice(0, 12);
    if (!matches.length) { sugg.classList.remove('visible'); return; }
    sugg.innerHTML = matches.map(p => `<div class="suggestion-item" data-player="${p}">${p}</div>`).join('');
    sugg.classList.add('visible');
    sugg.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        input.value = el.dataset.player;
        sugg.classList.remove('visible');
        openPlayer(el.dataset.player);
      });
    });
  });

  document.addEventListener('click', e => { if (!input.contains(e.target) && !sugg.contains(e.target)) sugg.classList.remove('visible'); });
}

function openPlayer(name) {
  // Switch to jugador tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'jugador'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-jugador'));

  document.getElementById('player-search').value = name;
  document.getElementById('player-suggestions').classList.remove('visible');
  document.getElementById('player-empty').style.display = 'none';

  const raidsAttended = DATA.filter(r => (r.roster ?? [...r.leaderboard.map(e=>e.name), ...(r.deathStats?.deaths??[]).map(e=>e.name)]).includes(name));

  let totalFF = 0, totalDeaths = 0, totalTimeDead = 0, totalInts = 0, totalDisp = 0, portadorCount = 0, firstCount = 0;

  const rows = raidsAttended.map(r => {
    const ffEntry  = r.leaderboard.find(e => e.name === name);
    const dEntry   = r.deathStats?.deaths?.find(e => e.name === name);
    const tEntry   = r.deathStats?.timeDead?.find(e => e.name === name);
    const intEntry = r.interrupts?.find(e => e.name === name);
    const disEntry = r.dispels?.find(e => e.name === name);
    const isPort   = r.leaderboard[0]?.name === name;
    const isFirst  = r.deathStats?.firstToDie?.name === name;
    const hitStats = r.playerHitStats?.[name] ?? null;

    const ff  = ffEntry?.damage ?? 0;
    const d   = dEntry?.count ?? 0;
    const td  = tEntry?.ms ?? 0;
    const int = intEntry?.total ?? 0;
    const dis = disEntry?.total ?? 0;

    totalFF += ff; totalDeaths += d; totalTimeDead += td; totalInts += int; totalDisp += dis;
    if (isPort) portadorCount++;
    if (isFirst) firstCount++;

    return { fecha: r.fecha, report: r.report, ff, d, td, int, dis, isPort, isFirst, hitStats };
  });

  // Personal records from playerHitStats
  let prHit = null, prHeal = null, prReceived = null;
  for (const r of rows) {
    const h = r.hitStats;
    if (!h) continue;
    if (h.biggestHit?.amount > 0 && (!prHit || h.biggestHit.amount > prHit.amount))
      prHit = { ...h.biggestHit, fecha: r.fecha };
    if (h.biggestHeal?.amount > 0 && (!prHeal || h.biggestHeal.amount > prHeal.amount))
      prHeal = { ...h.biggestHeal, fecha: r.fecha };
    if (h.biggestReceived?.amount > 0 && (!prReceived || h.biggestReceived.amount > prReceived.amount))
      prReceived = { ...h.biggestReceived, fecha: r.fecha };
  }

  const hasHitData = rows.some(r => r.hitStats);

  const cls      = getPlayerClass(name);
  const spec     = getPlayerSpec(name);
  const clsColor = cls ? (CLASS_COLOR[cls] ?? 'var(--text-bright)') : 'var(--text-bright)';
  const clsLabel = [CLASS_ES[cls] ?? cls, spec].filter(Boolean).join(' · ');

  const profile = document.getElementById('player-profile');
  profile.className = 'visible';
  profile.innerHTML = `
    <div class="profile-header">
      ${classIcon(cls, spec)}
      <div>
        <div class="profile-name" style="color:${clsColor}">${name}</div>
        ${clsLabel ? `<div class="profile-class">${clsLabel}</div>` : ''}
      </div>
    </div>
    <div class="profile-meta">${raidsAttended.length} raids · ${portadorCount ? portadorCount + '× portador de la resaca' : 'nunca portador'} · ${firstCount ? firstCount + '× primero en morir' : ''}</div>
    <div class="profile-stats">
      <div class="pstat"><div class="plabel">Raids</div><div class="pval purple">${raidsAttended.length}</div></div>
      <div class="pstat"><div class="plabel">Fuego Amigo (Gruul)</div><div class="pval">${fmtDmg(totalFF)}</div></div>
      <div class="pstat"><div class="plabel">Muertes</div><div class="pval red">${totalDeaths}</div></div>
      <div class="pstat"><div class="plabel">Tiempo Muerto</div><div class="pval red">${fmtMs(totalTimeDead)}</div></div>
      <div class="pstat"><div class="plabel">Interrupts</div><div class="pval purple">${totalInts}</div></div>
      <div class="pstat"><div class="plabel">Dispels</div><div class="pval purple">${totalDisp}</div></div>
    </div>

    ${hasHitData ? `
    <div class="section-title">Récords Personales</div>
    <div class="records-grid" style="margin-bottom:1.5rem">
      ${prHit ? `<div class="record-card"><div class="record-icon">⚔️</div><div class="record-label">Mayor golpe dado</div><div class="record-amount">${fmtDmg(prHit.amount)}</div><div class="record-who">${name} → ${prHit.target}</div>${prHit.ability ? `<div class="record-ability">${prHit.ability}</div>` : ''}<div class="record-date">${fmtDate(prHit.fecha)}</div></div>` : ''}
      ${prHeal ? `<div class="record-card"><div class="record-icon">💚</div><div class="record-label">Mayor curación</div><div class="record-amount">${fmtDmg(prHeal.amount)}</div><div class="record-who">${name} → ${prHeal.target}</div>${prHeal.ability ? `<div class="record-ability">${prHeal.ability}</div>` : ''}<div class="record-date">${fmtDate(prHeal.fecha)}</div></div>` : ''}
      ${prReceived ? `<div class="record-card"><div class="record-icon">💀</div><div class="record-label">Mayor golpe recibido</div><div class="record-amount">${fmtDmg(prReceived.amount)}</div><div class="record-who">${prReceived.source} → ${name}</div>${prReceived.ability ? `<div class="record-ability">${prReceived.ability}</div>` : ''}<div class="record-date">${fmtDate(prReceived.fecha)}</div></div>` : ''}
    </div>` : ''}

    <div class="section-title">Histórico por Raid</div>
    <table class="raid-table">
      <thead><tr>
        <th>Fecha</th>
        <th>FF Daño (Gruul)</th>
        <th>Muertes</th>
        <th>T. Muerto</th>
        <th>Interrupts</th>
        <th>Dispels</th>
        ${hasHitData ? '<th>Mayor Golpe</th><th>Mayor Cura</th><th>Mayor Recibido</th>' : ''}
      </tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td class="td-gold">${fmtDate(r.fecha)}</td>
          <td class="td-gold">${r.ff ? fmtDmg(r.ff) : '<span class="td-dim">—</span>'} ${r.isPort ? '<span class="shame-badge">resaca</span>' : ''}</td>
          <td class="td-red">${r.d || '<span class="td-dim">0</span>'} ${r.isFirst ? '<span class="shame-badge">1º</span>' : ''}</td>
          <td class="td-red">${r.td ? fmtMs(r.td) : '<span class="td-dim">—</span>'}</td>
          <td class="td-purple">${r.int || '<span class="td-dim">0</span>'}</td>
          <td class="td-purple">${r.dis || '<span class="td-dim">0</span>'}</td>
          ${hasHitData ? `
          <td class="td-gold" title="${[r.hitStats?.biggestHit?.ability, r.hitStats?.biggestHit?.target ? '→ ' + r.hitStats.biggestHit.target : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestHit?.amount ? fmtDmg(r.hitStats.biggestHit.amount) : '<span class="td-dim">—</span>'}</td>
          <td style="color:var(--purple2)" title="${[r.hitStats?.biggestHeal?.ability, r.hitStats?.biggestHeal?.target ? '→ ' + r.hitStats.biggestHeal.target : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestHeal?.amount ? fmtDmg(r.hitStats.biggestHeal.amount) : '<span class="td-dim">—</span>'}</td>
          <td class="td-red" title="${[r.hitStats?.biggestReceived?.ability, r.hitStats?.biggestReceived?.source ? '← ' + r.hitStats.biggestReceived.source : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestReceived?.amount ? fmtDmg(r.hitStats.biggestReceived.amount) : '<span class="td-dim">—</span>'}</td>` : ''}
        </tr>`).join('')}
      </tbody>
    </table>
  `;
}

// ── LOOT ──────────────────────────────────────────────────────────────────────

const LOOT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1aYgN7vk6tP_XFiwPlUQvI2xgEPzIv73PmyLmyhJ9jCI/gviz/tq?sheet=Data%20F1';
const ASSIGNED     = new Set(['BiS', 'Upgrade', 'Off-Spec']);
const ICON_MAP     = {};   // itemID (string) → iconName (lowercase)
const SHEET_BASE   = 'https://docs.google.com/spreadsheets/d/1aYgN7vk6tP_XFiwPlUQvI2xgEPzIv73PmyLmyhJ9jCI/gviz/tq?sheet=';

function stripBrackets(s) {
  if (!s) return '';
  return (s.startsWith('[') && s.endsWith(']')) ? s.slice(1, -1) : s;
}

function itemIcon(id) {
  if (!id) return '';
  const icon = ICON_MAP[String(id)];
  const src  = icon ? `https://wow.zamimg.com/images/wow/icons/small/${icon}.jpg` : '';
  return `<img class="item-icon" data-itemid="${id}"${src ? ` src="${src}"` : ''} alt="">`;
}

async function fetchMissingIcons() {
  const imgs = [...document.querySelectorAll('#loot-items-table .item-icon[data-itemid]:not([src])')];
  if (!imgs.length) return;
  const ids = [...new Set(imgs.map(img => img.dataset.itemid))];
  await Promise.all(ids.map(async id => {
    if (ICON_MAP[id] !== undefined) return;
    try {
      const res = await fetch(`https://nether.wowhead.com/tbc/tooltip/item/${id}?locale=0`);
      const d   = await res.json();
      ICON_MAP[id] = d.icon ? d.icon.toLowerCase() : null;
    } catch { ICON_MAP[id] = null; }
  }));
  document.querySelectorAll('#loot-items-table .item-icon[data-itemid]').forEach(img => {
    const icon = ICON_MAP[img.dataset.itemid];
    if (icon) img.src = `https://wow.zamimg.com/images/wow/icons/small/${icon}.jpg`;
  });
}

let lootRows   = null;
let lootLoaded = false;
let _dataReady = false;
let _iconsReady = false;

function _checkLootReady() {
  if (!_dataReady || !_iconsReady) return;
  lootLoaded = true;
  buildLootResumen();
  buildLootRegistroShell();
}

function fetchLootData() {
  if (lootLoaded) return;

  // ── Carga Data F1 ──
  window.__lootCallback = function(json) {
    delete window.__lootCallback;
    try {
      const cols = json.table.cols;
      const idx  = {};
      cols.forEach((c, i) => { if (c.label) idx[c.label] = i; });
      const get = (row, label) => {
        const i = idx[label];
        return (i !== undefined && row.c[i]) ? row.c[i].v : null;
      };
      lootRows = (json.table.rows || []).filter(r => r && r.c).map(row => {
        const rawDate = get(row, 'date');
        let dateStr = '';
        if (typeof rawDate === 'string' && rawDate.startsWith('Date(')) {
          const [y, m, d] = rawDate.slice(5, -1).split(',').map(Number);
          dateStr = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
        return {
          nombre:   get(row, 'Nombre'),
          date:     dateStr,
          item:     get(row, 'item'),
          itemID:   get(row, 'itemID'),
          response: get(row, 'response'),
          boss:     get(row, 'boss'),
        };
      }).filter(r => r.nombre && r.item);
    } catch(e) {
      document.getElementById('loot-resumen-inner').innerHTML =
        `<div class="loot-loading">Error al procesar loot: ${e.message}</div>`;
    }
    _dataReady = true;
    _checkLootReady();
  };
  const s1 = document.createElement('script');
  s1.src = LOOT_SHEET_URL + '&tqx=responseHandler:__lootCallback';
  s1.onerror = () => {
    document.getElementById('loot-resumen-inner').innerHTML =
      '<div class="loot-loading">No se pudieron cargar los datos. Comprueba que el sheet es público.</div>';
    _dataReady = true; _checkLootReady();
  };
  document.head.appendChild(s1);

  // ── Carga IconCache ──
  window.__iconCacheCallback = function(json) {
    delete window.__iconCacheCallback;
    try {
      const cols = json.table.cols;
      const idx  = {};
      cols.forEach((c, i) => { if (c.label) idx[c.label] = i; });
      (json.table.rows || []).filter(r => r && r.c).forEach(row => {
        const id   = row.c[idx['itemID']]?.v;
        const icon = row.c[idx['iconName']]?.v;
        if (id && icon) ICON_MAP[String(id)] = String(icon).toLowerCase();
      });
    } catch(_) {}
    _iconsReady = true;
    _checkLootReady();
  };
  const s2 = document.createElement('script');
  s2.src = SHEET_BASE + 'IconCache&tqx=responseHandler:__iconCacheCallback';
  s2.onerror = () => { _iconsReady = true; _checkLootReady(); };
  document.head.appendChild(s2);
}

const BAG_ID   = '34845';
const MOUNT_ID = '30480';

function buildLootResumen() {
  const byPlayer = new Map();
  let totDE = 0, totBank = 0, totBag = 0, totMount = 0;
  let totBis = 0, totUpgrade = 0, totOffspec = 0;

  lootRows.forEach(r => {
    if (!byPlayer.has(r.nombre)) byPlayer.set(r.nombre, {bis:0, upgrade:0, offspec:0, total:0, bag:false, mount:false});
    const p   = byPlayer.get(r.nombre);
    const id  = String(r.itemID);
    const res = r.response;
    if      (res === 'BiS')       { p.bis++;     p.total++; totBis++; }
    else if (res === 'Upgrade')   { p.upgrade++; p.total++; totUpgrade++; }
    else if (res === 'Off-Spec')  { p.offspec++; p.total++; totOffspec++; }
    else if (res === 'Disenchant') totDE++;
    else if (res === 'Banking')    totBank++;
    if (id === BAG_ID)   { p.bag   = true; totBag++; }
    if (id === MOUNT_ID) { p.mount = true; totMount++; }
  });

  const totAssigned = totBis + totUpgrade + totOffspec;
  const rows    = [...byPlayer.entries()].map(([name, s]) => ({name, ...s})).sort((a,b) => b.bis - a.bis || b.total - a.total);
  const maxTotal = rows[0]?.total || 1;

  document.getElementById('loot-resumen-inner').innerHTML = `
    <div class="loot-stat-cards">
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-bright)">${totAssigned}</div><div class="lsc-label">Repartidos</div></div>
      <div class="loot-stat-card"><div class="lsc-val">${totBis}</div><div class="lsc-label">BiS</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--purple2)">${totUpgrade}</div><div class="lsc-label">Upgrade</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:#87ceeb">${totOffspec}</div><div class="lsc-label">Off-Spec</div></div>
      <div style="width:1px;background:var(--border);margin:0 0.25rem;align-self:stretch"></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totDE}</div><div class="lsc-label">Desenc.</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totBank}</div><div class="lsc-label">Banking</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totBag}</div><div class="lsc-label">Bolsas</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totMount}</div><div class="lsc-label">Monturas</div></div>
    </div>
    <div class="section-title">Por Jugador</div>
    <table class="ranked-list">
      <thead><tr>
        <th>Jugador</th>
        <th style="text-align:right">BiS</th>
        <th style="text-align:right">Upgrade</th>
        <th style="text-align:right">Off-Spec</th>
        <th style="text-align:right">Total</th>
        <th class="bar-cell"></th>
        <th style="text-align:center" title="Bolsa de Karazhan">Bolsa</th>
        <th style="text-align:center" title="Montura">Montura</th>
      </tr></thead>
      <tbody>
        ${rows.map((r, i) => `<tr>
          <td class="player-link" style="cursor:pointer" onclick="goToLootRegistro('${r.name}')">${r.name}</td>
          <td class="val-cell">${r.bis    || '<span class="td-dim">—</span>'}</td>
          <td class="val-cell purple">${r.upgrade || '<span class="td-dim">—</span>'}</td>
          <td style="color:#87ceeb;font-family:'Cinzel',serif;font-size:.9rem;font-weight:600;text-align:right">${r.offspec || '<span class="td-dim">—</span>'}</td>
          <td style="color:var(--text-bright);font-family:'Cinzel',serif;font-size:.9rem;font-weight:600;text-align:right">${r.total || '—'}</td>
          <td class="bar-cell">${makeBar(Math.round(r.total / maxTotal * 100))}</td>
          <td style="text-align:center">${r.bag   ? '<span class="loot-check">✦</span>' : '<span class="td-dim">—</span>'}</td>
          <td style="text-align:center">${r.mount ? '<span class="loot-check">✦</span>' : '<span class="td-dim">—</span>'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function buildLootRegistroShell() {
  const players = [...new Set(lootRows.map(r => r.nombre))].sort();
  document.getElementById('loot-registro-inner').innerHTML = `
    <div class="section-title">Registro de Loot · Fase 1</div>
    <select class="loot-select" id="loot-player-select">
      <option value="">— Selecciona un jugador —</option>
      ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
    </select>
    <div id="loot-player-detail"></div>
  `;
  document.getElementById('loot-player-select').addEventListener('change', e => renderLootPlayer(e.target.value));
}

function renderLootPlayer(nombre) {
  const el = document.getElementById('loot-player-detail');
  if (!nombre) { el.innerHTML = ''; return; }

  const allPlayerRows = lootRows.filter(r => r.nombre === nombre);
  const hasBag   = allPlayerRows.some(r => String(r.itemID) === BAG_ID);
  const hasMount = allPlayerRows.some(r => String(r.itemID) === MOUNT_ID);
  const bagRow   = allPlayerRows.find(r => String(r.itemID) === BAG_ID);
  const mountRow = allPlayerRows.find(r => String(r.itemID) === MOUNT_ID);

  const items = allPlayerRows
    .filter(r => ASSIGNED.has(r.response))
    .sort((a,b) => b.date.localeCompare(a.date));

  const counts = {};
  items.forEach(r => { counts[r.response] = (counts[r.response] || 0) + 1; });

  const chipColor = { 'BiS': '', 'Upgrade': 'purple', 'Off-Spec': 'blue' };

  el.innerHTML = `
    <div class="loot-chips">
      <div class="loot-chip">
        <div class="chip-val" style="color:var(--text-bright)">${items.length}</div>
        <div class="chip-label">Total</div>
      </div>
      ${['BiS','Upgrade','Off-Spec'].map(k => `<div class="loot-chip">
        <div class="chip-val ${chipColor[k] || ''}">${counts[k] || 0}</div>
        <div class="chip-label">${k}</div>
      </div>`).join('')}
      ${hasBag ? `<div class="loot-chip" style="border-color:var(--gold-dim)">
        <div class="chip-val">${bagRow?.itemID
          ? `<a href="https://www.wowhead.com/tbc/item=${bagRow.itemID}" target="_blank" style="color:var(--gold);text-decoration:none">${stripBrackets(bagRow.item)}</a>`
          : '✦'}</div>
        <div class="chip-label">Bolsa</div>
      </div>` : ''}
      ${hasMount ? `<div class="loot-chip" style="border-color:var(--gold-dim)">
        <div class="chip-val">${mountRow?.itemID
          ? `<a href="https://www.wowhead.com/tbc/item=${mountRow.itemID}" target="_blank" style="color:var(--gold);text-decoration:none">${stripBrackets(mountRow.item)}</a>`
          : '✦'}</div>
        <div class="chip-label">Montura</div>
      </div>` : ''}
    </div>
    <table class="ranked-list" id="loot-items-table">
      <thead><tr>
        <th>Fecha</th>
        <th>Item</th>
        <th>Boss</th>
        <th>Tipo</th>
      </tr></thead>
      <tbody>
        ${items.map(r => `<tr>
          <td class="td-gold" style="white-space:nowrap">${r.date ? fmtDate(r.date) : '—'}</td>
          <td style="white-space:nowrap">${r.itemID
            ? `<a class="item-link" href="https://www.wowhead.com/tbc/item=${r.itemID}" target="_blank">${itemIcon(r.itemID)}${stripBrackets(r.item)}</a>`
            : stripBrackets(r.item)}</td>
          <td class="td-dim" style="font-size:.85rem">${r.boss || '—'}</td>
          <td>${lootBadge(r.response)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;

  fetchMissingIcons();
}

function goToLootRegistro(nombre) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btn = document.querySelector('.tab-btn[data-tab="loot-registro"]');
  btn.classList.add('active');
  document.getElementById('tab-loot-registro').classList.add('active');
  const sel = document.getElementById('loot-player-select');
  if (sel) { sel.value = nombre; renderLootPlayer(nombre); }
}

function lootBadge(resp) {
  if (!resp) return '<span class="response-badge other">—</span>';
  const cls = resp === 'BiS' ? 'bis' : resp === 'Upgrade' ? 'upgrade' : resp === 'Off-Spec' ? 'offspec' : 'other';
  return `<span class="response-badge ${cls}">${resp}</span>`;
}

// ── TAB NAVIGATION ────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if ((btn.dataset.tab === 'loot-resumen' || btn.dataset.tab === 'loot-registro') && !lootLoaded) {
      fetchLootData();
    }
  });
});
