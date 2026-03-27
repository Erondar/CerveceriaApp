let DATA = [];
let ALL_PLAYERS = [];
let TITULOS = [];

// ── CITA DEL DÍA ──────────────────────────────────────────────────────────────

const CITAS = [
  '«La Resaca no se hereda. Se gana, raid a raid, con sangre de aliados.»',
  '«En esta banda, el boss más peligroso siempre ha sido uno de los nuestros.»',
  '«Gruul ha matado a mucha gente. Nosotros hemos matado a más.»',
  '«El friendly fire no existe por accidente. Existe por costumbre.»',
  '«El primer muerto de la raid siempre dice lo mismo: "yo no fui".»',
  '«Hay mecánicas evitables. Y luego hay mecánicas inevitables para algunos.»',
  '«El suelo en llamas es para los que leen los avisos. Los demás, a su bola.»',
  '«Wipe rápido: aprendizaje. Wipe lento: arte moderno.»',
  '«El mejor interrupt es el que no se necesita. El peor, el que nadie hace.»',
  '«La eficiencia de esta banda es directamente proporcional a los wipes previos.»',
  '«Un Whirlwind bien recibido dice más de una persona que mil palabras.»',
  '«Las mecánicas no son difíciles. Algunos simplemente las ignoran con elegancia.»',
  '«El log nunca miente. Las explicaciones posteriores, sí.»',
  '«Si mueres el primero, al menos mueres con convicción.»',
  '«La cura más gorda de la noche fue para alguien que no debería haberla necesitado.»',
  '«Gruul mide 24 metros. Aun así, hay quien se le mete debajo sin querer.»',
  '«El tiempo muerto es tiempo de reflexión. Algunos reflexionan más que otros.»',
  '«No hay malos jugadores, hay malas posiciones. Algunas espectacularmente malas.»',
  '«El dispel más importante es el que no llegó a tiempo.»',
  '«Esta banda ha demostrado que los bosses no son el único peligro de la instancia.»',
  '«El Portador de la Resaca no se elige. Emerge.»',
  '«Cave In: el juego de los que se mueven versus los que confían en la RNG.»',
  '«Tener buenos healers no te hace inmortal. Solo retarda lo inevitable.»',
  '«El boss no habla. Pero si pudiera, ya habría pedido el traslado.»',
  '«La raid termina cuando acaban los bosses o cuando acaba la paciencia. Esta noche, ambos.»',
  '«Conflagration: el fuego decorativo que algunos pisan por si acaso.»',
  '«Un wipe te enseña. Dos te recuerdan. Ocho ya son filosofía.»',
  '«No es friendly fire si el aliado se lo merecía. Pero los logs no saben eso.»',
  '«El roster cambia. La vergüenza, no.»',
  '«Cada raid es una nueva oportunidad de superar los errores de la anterior. Oportunidad desaprovechada.»',
  '«El boss lleva semanas estudiando nuestros patrones. Nosotros, no.»',
  '«Hay dos tipos de jugadores: los que evitan el Whirlwind y los que confían en los healers.»',
  '«El progreso de esta banda se mide en wipes por metro cuadrado de instancia.»',
  '«Un interrupt a tiempo salva vidas. Uno a destiempo, las complica.»',
  '«El ghost run más rápido de la historia lo tiene alguien de esta banda. No es motivo de orgullo.»',
];

function buildCitaDelDia() {
  const today = new Date();
  // Determinista: misma cita todo el día
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const cita = CITAS[seed % CITAS.length];
  const html = `<div class="cita-del-dia"><span class="cita-ornament">— ✦ —</span><blockquote class="cita-text">${cita}</blockquote></div>`;
  const loaderEl  = document.getElementById('cita-del-dia-loader');
  if (loaderEl) loaderEl.innerHTML = html;
  const resumenEl = document.getElementById('cita-del-dia-resumen');
  if (resumenEl) resumenEl.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', buildCitaDelDia);

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
  TITULOS = calcTitulos();
  buildHeaderMeta();
  fetchLootData();
  buildResumen();
  buildFF();
  buildMuertes();
  buildMecanicas();
  buildHistorial();
  buildPorRaid();
  buildProgresion();
  buildVerguenza();
  buildTimeRecords();
  buildGaleriaInfamia();
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
    // Avoidable damage: aggregate all mechanics per player, sorted desc
    const avoidMap = new Map();
    (raid.avoidableDamage ?? []).forEach(m => m.players.forEach(p => avoidMap.set(p.name, (avoidMap.get(p.name) ?? 0) + p.total)));
    const avoidSorted = [...avoidMap.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
    for (const name of participants) {
      const avg = (pct(raid.leaderboard, name) + pct(raid.deathStats?.deaths??[], name) + pct(raid.deathStats?.timeDead??[], name) + pct(avoidSorted, name)) / 4;
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

  const dMap = new Map();
  DATA.forEach(r => (r.deathStats?.deaths??[]).forEach(e => dMap.set(e.name,(dMap.get(e.name)??0)+e.count)));
  const deathArr = [...dMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val).slice(0,3);
  const shame = calcShame().slice(0,3);
  const intMap = new Map(), disMap = new Map();
  DATA.forEach(r => {
    (r.interrupts??[]).forEach(e => intMap.set(e.name,(intMap.get(e.name)??0)+e.total));
    (r.dispels??[]).forEach(e => disMap.set(e.name,(disMap.get(e.name)??0)+e.total));
  });
  const intArr = [...intMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val).slice(0,3);
  const disArr = [...disMap.entries()].map(([name,val])=>({name,val})).sort((a,b)=>b.val-a.val).slice(0,3);

  const podiumHTML = (title, arr, valFn, honorStyle = false) => `
    <div class="podium-card${honorStyle ? ' podium-card--honor' : ''}">
      <div class="podium-title">${title}</div>
      ${arr.length ? arr.map((e,i) => `<div class="podium-entry">
        <span class="medal">${medalEmoji(i)}</span>
        <span class="podium-name player-link" data-player="${e.name}">${e.name}</span>
        <span class="podium-val">${valFn(e)}</span>
      </div>`).join('') : '<div class="td-dim" style="font-size:.82rem;padding:.5rem 0">Sin datos</div>'}
    </div>`;

  document.getElementById('podiums').innerHTML =
    podiumHTML('Vergüenza General', shame, e => (e.score*100).toFixed(0)+'%') +
    podiumHTML('Más Muertes', deathArr, e => e.val + '') +
    podiumHTML('Top Interrupts', intArr, e => e.val + '', true) +
    podiumHTML('Top Dispels', disArr, e => e.val + '', true);

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
  const maxFF      = DATA.reduce((best, r) => {
    if (r.leaderboard[0] && r.leaderboard[0].damage > (best.damage ?? 0))
      return { name: r.leaderboard[0].name, damage: r.leaderboard[0].damage };
    return best;
  }, { name: null, damage: 0 });

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
        <div class="label">Rey de la Resaca</div>
        <div class="value red" style="font-size:1.3rem">${maxFF.name ?? '—'}</div>
        <div class="sub">${maxFF.name ? fmtDmg(maxFF.damage) + ' FF en una sola raid' : ''}</div>
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
const PROG_SHORT  = ['Maulgar', 'Gruul', 'Magtheridon'];
const PROG_COLORS = ['#f0c84a', '#ff6060', '#c090f0'];

function progLegend(labels, colors) {
  return `<div class="prog-legend">${labels.map((l,i) =>
    `<span class="prog-legend-item"><span class="prog-legend-dot" style="background:${colors[i]}"></span>${l}</span>`
  ).join('')}</div>`;
}

function drawLineChart(xLabels, series, yFormat, yFixedMin, yFixedMax) {
  const W = 800, H = 240;
  const pad = { top: 20, right: 20, bottom: 44, left: 64 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const n = xLabels.length;

  const allVals = series.flatMap(s => s.values.filter(v => v != null));
  if (!allVals.length) return '<p class="section-note">Sin datos suficientes.</p>';

  const yMax = yFixedMax != null ? yFixedMax : Math.max(...allVals);
  const yBottom = yFixedMin != null ? yFixedMin : Math.max(0, Math.min(...allVals) * 0.8);
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

// ── RADAR CHART ───────────────────────────────────────────────────────────────

function drawRadarChart(scores, labels) {
  // scores: array de N valores 0-100 (mayor = mejor)
  const N = scores.length;
  const W = 270, H = 255;
  const cx = W / 2, cy = H / 2 + 8;
  const R = 90;
  const startAngle = -Math.PI / 2;
  const angleStep  = (2 * Math.PI) / N;
  const pt = (i, r) => {
    const a = startAngle + i * angleStep;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  // Rejilla
  let grid = '';
  [25, 50, 75, 100].forEach((pct, gi) => {
    const r    = R * pct / 100;
    const pts  = Array.from({length: N}, (_, i) => pt(i, r).map(v => v.toFixed(1)).join(',')).join(' ');
    const col  = gi === 3 ? '#3d4a6a' : '#2a3148';
    grid += `<polygon points="${pts}" fill="none" stroke="${col}" stroke-width="1"/>`;
  });

  // Ejes
  let axes = '';
  for (let i = 0; i < N; i++) {
    const [x, y] = pt(i, R);
    axes += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#2a3148" stroke-width="1"/>`;
  }

  // Polígono del jugador
  const playerPts = scores.map((s, i) => pt(i, R * Math.max(0, s) / 100).map(v => v.toFixed(1)).join(',')).join(' ');

  // Etiquetas
  let labelsSVG = '';
  labels.forEach((l, i) => {
    const [x, y] = pt(i, R + 19);
    const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
    const lines  = l.split('\n');
    if (lines.length > 1) {
      labelsSVG += `<text x="${x.toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="${anchor}" fill="#a0aabc" font-size="10">`;
      lines.forEach((ln, li) => { labelsSVG += `<tspan x="${x.toFixed(1)}" dy="${li === 0 ? 0 : 12}">${ln}</tspan>`; });
      labelsSVG += '</text>';
    } else {
      labelsSVG += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="#a0aabc" font-size="10.5">${l}</text>`;
    }
  });

  // Puntos en vértices
  const dots = scores.map((s, i) => {
    const [x, y] = pt(i, R * Math.max(0, s) / 100);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="var(--purple2)" stroke="#0f1117" stroke-width="1.5"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:270px;display:block;margin:0 auto">
    ${grid}${axes}
    <polygon points="${playerPts}" fill="rgba(138,92,184,0.22)" stroke="var(--purple2)" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labelsSVG}
  </svg>`;
}

// ── POR RAID ──────────────────────────────────────────────────────────────────

function buildPorRaid() {
  const el = document.getElementById('tab-por-raid');
  if (!DATA.length) { el.innerHTML = '<div class="empty-msg">No hay raids registradas.</div>'; return; }

  const raids = [...DATA].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
      <span style="color:var(--text-dim);font-size:1rem;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.05em;line-height:1;align-self:center">Raid</span>
      <select id="raid-selector" class="loot-select" style="min-width:160px;width:auto;margin-bottom:0">
        ${raids.map((r, i) => `<option value="${i}">${fmtDate(r.fecha)}</option>`).join('')}
      </select>
      <a id="wcl-link" href="https://www.warcraftlogs.com/reports/${raids[0].report}" target="_blank" rel="noopener"
         style="font-size:.82rem;color:var(--text-dim);text-decoration:none;border:1px solid var(--border2);border-radius:5px;padding:.3rem .7rem;transition:color .15s,border-color .15s"
         onmouseover="this.style.color='var(--text-bright)';this.style.borderColor='var(--gold)'"
         onmouseout="this.style.color='var(--text-dim)';this.style.borderColor='var(--border2)'">
        Ver en WarcraftLogs ↗
      </a>
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
    const dur      = bs?.totalRaidTimeMs > 0 ? fmtMs(bs.totalRaidTimeMs) : '—';
    const firstDie = raid.deathStats?.firstToDie;
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
        ${firstDie?.name ? `
        <div class="stat-card">
          <div class="label">Primero en Morir</div>
          <div class="value" style="font-size:1.05rem;color:var(--red2)">${firstDie.name}</div>
          <div class="sub">${firstDie.timeMs ? `a los ${(firstDie.timeMs/1000).toFixed(1)}s del pull` : 'abrió el marcador'}</div>
        </div>` : ''}
        ${dps ? `
        <div class="stat-card">
          <div class="label">DPS Medio</div>
          <div class="value" style="color:${DPS_COLOR}">${fmtDmg(dps.dps)}</div>
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

    // ── Mecánicas evitables (esta raid) ──
    const AVOIDABLE_MECHS_R = ['Blast Wave', 'Whirlwind', 'Cave In', 'Debris', 'Conflagration'];
    const avoidMapR = new Map();
    (raid.avoidableDamage ?? []).forEach(m => {
      m.players.forEach(p => {
        if (!avoidMapR.has(p.name)) { const obj = { total: 0 }; AVOIDABLE_MECHS_R.forEach(k => { obj[k] = 0; }); avoidMapR.set(p.name, obj); }
        const obj = avoidMapR.get(p.name);
        obj.total += p.total;
        if (m.mechanic in obj) obj[m.mechanic] += p.total;
      });
    });
    const avoidSortedR = [...avoidMapR.entries()].map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
    const avoidSortedSimple = avoidSortedR.map(e => ({ name: e.name, total: e.total }));

    // Full-width avoidable table HTML
    const avoidFullTable = avoidSortedR.length ? (() => {
      return `<div style="overflow-x:auto">
        <table class="ranked-list">
          <thead><tr>
            <th></th><th>Jugador</th>
            <th class="val-cell" style="color:var(--red2)">Total</th>
            ${AVOIDABLE_MECHS_R.map(m => `<th class="val-cell td-dim" style="white-space:nowrap">${m}</th>`).join('')}
          </tr></thead>
          <tbody>${avoidSortedR.slice(0, 5).map((e, i) => `<tr>
            <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
            <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
            <td class="val-cell red">${fmtDmg(e.total)}</td>
            ${AVOIDABLE_MECHS_R.map(m => `<td class="val-cell td-dim">${e[m] ? fmtDmg(e[m]) : '—'}</td>`).join('')}
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
    })() : '<div class="section-note">¡Nadie recibió daño evitable! 🎉</div>';


    // ── Vergüenza (esta raid) ──
    const participants = raid.roster ? new Set(raid.roster)
      : new Set([...ff.map(e => e.name), ...deaths.map(e => e.name), ...timeDead.map(e => e.name)]);
    const n = participants.size;
    const pct = (list, name) => {
      const idx = list.findIndex(e => e.name === name);
      return idx === -1 ? 0 : (n - 1 - idx) / (n - 1);
    };
    const allShameScores = n > 1 ? [...participants]
      .map(name => ({ name, score: (pct(ff, name) + pct(deaths, name) + pct(timeDead, name) + pct(avoidSortedSimple, name)) / 4 }))
      .sort((a, b) => b.score - a.score) : [];
    const shameRows = allShameScores
      .filter(e => e.score > 0)
      .slice(0, 5)
      .map((e, i) => `<tr>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(e.score * 100)}</td>
        <td class="val-cell">${(e.score * 100).toFixed(0)}%</td>
      </tr>`);

    const hazmerreir = allShameScores[0] ?? null;
    const mvp = allShameScores.length > 1 ? allShameScores[allShameScores.length - 1] : null;
    const mvpHazHTML = (mvp && hazmerreir && hazmerreir.name !== mvp.name) ? `
      <div class="two-col" style="margin-bottom:2rem">
        <div class="panel" style="border-color:var(--red2);text-align:center;padding:1.5rem 1.2rem">
          <div style="font-size:2rem;margin-bottom:.4rem">🤦</div>
          <div style="font-family:'Barlow',sans-serif;font-size:.85rem;font-weight:600;color:var(--red2);letter-spacing:.04em;text-transform:uppercase;margin-bottom:.6rem">Artista del Desastre</div>
          <div style="font-size:1.4rem;font-weight:700;color:var(--gold)"><span class="player-link" data-player="${hazmerreir.name}" style="font-size:inherit">${hazmerreir.name}</span></div>
          <div style="color:var(--text-dim);font-size:.82rem;margin-top:.4rem">${(hazmerreir.score * 100).toFixed(0)}% de vergüenza</div>
        </div>
        <div class="panel" style="border-color:var(--green);text-align:center;padding:1.5rem 1.2rem">
          <div style="font-size:2rem;margin-bottom:.4rem">🌟</div>
          <div style="font-family:'Barlow',sans-serif;font-size:.85rem;font-weight:600;color:var(--green);letter-spacing:.04em;text-transform:uppercase;margin-bottom:.6rem">MVP de la Noche</div>
          <div style="font-size:1.4rem;font-weight:700;color:var(--gold)"><span class="player-link" data-player="${mvp.name}" style="font-size:inherit">${mvp.name}</span></div>
          <div style="color:var(--text-dim);font-size:.82rem;margin-top:.4rem">${(mvp.score * 100).toFixed(0)}% de vergüenza</div>
        </div>
      </div>` : '';

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

    const titulares = generarTitulares(raid, raids);
    const titularesHTML = titulares.length ? `
      <div class="titular-box">
        ${titulares.map((t, i) => `<div class="titular-headline${i === 0 ? ' titular-headline--main' : ''}">${t}</div>`).join('')}
      </div>` : '';

    document.getElementById('por-raid-content').innerHTML = `
      ${titularesHTML}
      ${statCards}
      ${mvpHazHTML}
      <div class="section-title">Boss Kills</div>
      <div class="stat-cards" style="margin-bottom:2rem">${bossCards || '<div class="section-note">Sin datos de boss kills.</div>'}</div>
      <div class="two-col" style="margin-bottom:2rem">
        <div>
          <div class="section-title">Vergüenza</div>
          ${miniTable(['', 'Jugador', '', 'Score'], shameRows, 'Sin datos suficientes.')}
        </div>
        <div>
          <div class="section-title">Friendly Fire</div>
          ${miniTable(['', 'Jugador', '', 'Daño'], ffRows, '¡Nadie hizo friendly fire! 🎉')}
        </div>
      </div>
      <div style="margin-bottom:2rem">
        <div class="section-title">Mecánicas Evitables</div>
        ${avoidFullTable}
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
  document.getElementById('raid-selector').addEventListener('change', e => {
    const raid = raids[+e.target.value];
    document.getElementById('wcl-link').href = `https://www.warcraftlogs.com/reports/${raid.report}`;
    renderRaid(raid);
  });
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
      <div class="prog-chart-title">Daño Evitable Total por Raid</div>
      <div class="prog-chart-note">Suma de todo el daño recibido de mecánicas evitables en cada raid (Blast Wave, Whirlwind, Cave In, Debris, Conflagration)</div>
      ${drawLineChart(xLabels, [{
        label: 'Daño evitable', color: 'var(--red2)',
        values: raids.map(r => (r.avoidableDamage ?? []).reduce((s, m) => s + m.players.reduce((ss, p) => ss + p.total, 0), 0) || null),
      }], v => fmtDmg(Math.round(v)))}
    </div>

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
    const avoidMap2 = new Map();
    (raid.avoidableDamage ?? []).forEach(m => m.players.forEach(p => avoidMap2.set(p.name, (avoidMap2.get(p.name) ?? 0) + p.total)));
    const avoidSorted2 = [...avoidMap2.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
    for (const name of participants) {
      const score = (pct(raid.leaderboard, name) + pct(raid.deathStats?.deaths??[], name) + pct(raid.deathStats?.timeDead??[], name) + pct(avoidSorted2, name)) / 4;
      if (!worstRaid || score > worstRaid.score) worstRaid = { name, score, fecha: raid.fecha };
      if (!bestRaid  || score < bestRaid.score)  bestRaid  = { name, score, fecha: raid.fecha };
    }
  });

  document.getElementById('verguenza-header').innerHTML = `
    <div class="stat-cards" style="margin-bottom:1.5rem">
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
    </div>`;

  // Sub-tab switching
  document.querySelectorAll('#sub-nav-verguenza .sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#sub-nav-verguenza .sub-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#tab-verguenza .sub-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('subtab-' + btn.dataset.subtab).classList.add('active');
    });
  });

  document.getElementById('shame-explanation').innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:1rem 1.2rem;margin-bottom:1.2rem;font-size:0.85rem;color:var(--text-dim);line-height:1.6">
      <strong style="color:var(--text-bright)">¿Cómo se calcula?</strong><br>
      Por cada raid, a cada jugador se le asigna un percentil en cuatro categorías:
      <strong style="color:var(--gold)">daño a aliados (Gruul)</strong>,
      <strong style="color:var(--red2)">número de muertes</strong>,
      <strong style="color:var(--red2)">tiempo muerto</strong> y
      <strong style="color:var(--red2)">daño recibido de mecánicas evitables</strong>.
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

  buildAvoidable();
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

function buildAvoidable() {
  const container = document.getElementById('avoidable-section');
  if (!container) return;

  const hasData = DATA.some(r => (r.avoidableDamage ?? []).length > 0);
  if (!hasData) { container.innerHTML = ''; return; }

  const MECHS = [
    { mechanic: 'Blast Wave',    boss: 'Maulgar'     },
    { mechanic: 'Whirlwind',     boss: 'Maulgar'     },
    { mechanic: 'Cave In',       boss: 'Gruul'        },
    { mechanic: 'Debris',        boss: 'Magtheridon'  },
    { mechanic: 'Conflagration', boss: 'Magtheridon'  },
  ];

  // Aggregate per player: total + per mechanic
  const playerMap = new Map();
  DATA.forEach(r => {
    (r.avoidableDamage ?? []).forEach(mech => {
      mech.players.forEach(p => {
        if (!playerMap.has(p.name)) {
          const obj = { total: 0 };
          MECHS.forEach(m => { obj[m.mechanic] = 0; });
          playerMap.set(p.name, obj);
        }
        const obj = playerMap.get(p.name);
        obj.total += p.total;
        if (mech.mechanic in obj) obj[mech.mechanic] += p.total;
      });
    });
  });

  const allRows = [...playerMap.entries()].map(([name, d]) => ({ name, ...d }));
  let sortCol = 'total';

  const renderBody = () => {
    const sorted = [...allRows].sort((a, b) => (b[sortCol] ?? 0) - (a[sortCol] ?? 0));
    return sorted.map((e, i) => `<tr>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="player-link" data-player="${e.name}">${e.name}</span></td>
      <td class="val-cell ${sortCol === 'total' ? 'red' : 'td-dim'}">${fmtDmg(e.total)}</td>
      ${MECHS.map(m => `<td class="val-cell ${sortCol === m.mechanic ? 'red' : 'td-dim'}">${e[m.mechanic] ? fmtDmg(e[m.mechanic]) : '—'}</td>`).join('')}
    </tr>`).join('');
  };

  const thStyle = 'cursor:pointer;white-space:nowrap;user-select:none';
  const mechTh = MECHS.map(m =>
    `<th class="avd-th" data-col="${m.mechanic}" title="${m.boss}" style="${thStyle}">${m.mechanic}</th>`
  ).join('');

  // Stat cards
  const totalAvoid = allRows.reduce((s, e) => s + e.total, 0);
  const mediaAvoidRaid = DATA.length > 0 ? DATA.reduce((s, r) => s + (r.avoidableDamage ?? []).reduce((ss, m) => ss + m.players.reduce((sss, p) => sss + p.total, 0), 0), 0) / DATA.length : 0;
  const raidMaxAvoid = DATA.reduce((best, r) => {
    const sum = (r.avoidableDamage ?? []).reduce((s, m) => s + m.players.reduce((ss, p) => ss + p.total, 0), 0);
    return sum > (best.sum ?? 0) ? { sum, fecha: r.fecha } : best;
  }, {});
  const topPlayer = allRows.length > 0 ? allRows.reduce((best, e) => e.total > (best?.total ?? 0) ? e : best, null) : null;

  container.innerHTML = `
    <div class="stat-cards" style="margin-bottom:2rem">
      <div class="stat-card">
        <div class="label">Daño Evitable Histórico</div>
        <div class="value">${fmtDmg(totalAvoid)}</div>
        <div class="sub">daño evitable acumulado</div>
      </div>
      <div class="stat-card">
        <div class="label">Media por Raid</div>
        <div class="value">${fmtDmg(Math.round(mediaAvoidRaid))}</div>
        <div class="sub">daño evitable medio por raid</div>
      </div>
      <div class="stat-card">
        <div class="label">Raid más Caótica</div>
        <div class="value red" style="font-size:1.3rem">${raidMaxAvoid.fecha ? fmtDate(raidMaxAvoid.fecha) : '—'}</div>
        <div class="sub">${raidMaxAvoid.sum ? fmtDmg(raidMaxAvoid.sum) + ' de daño evitable' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="label">Rey del Sufrimiento</div>
        <div class="value red" style="font-size:1.3rem">${topPlayer?.name ?? '—'}</div>
        <div class="sub">${topPlayer ? fmtDmg(topPlayer.total) + ' en total' : ''}</div>
      </div>
    </div>
    <div class="section-title">Ranking Global</div>
    <div class="section-note">Daño recibido de mecánicas evitables · acumulado de todos los raids · clic en columna para ordenar</div>
    <div style="overflow-x:auto;margin-top:1.25rem">
      <table class="ranked-list" id="avd-table">
        <thead><tr>
          <th></th>
          <th>Jugador</th>
          <th class="avd-th" data-col="total" style="${thStyle}">Total</th>
          ${mechTh}
        </tr></thead>
        <tbody id="avd-tbody">${renderBody()}</tbody>
      </table>
    </div>`;

  const bindLinks = () => container.querySelectorAll('.player-link').forEach(el =>
    el.addEventListener('click', () => openPlayer(el.dataset.player))
  );

  const updateSort = col => {
    sortCol = col;
    document.getElementById('avd-tbody').innerHTML = renderBody();
    container.querySelectorAll('.avd-th').forEach(th =>
      th.style.color = th.dataset.col === sortCol ? 'var(--gold)' : ''
    );
    bindLinks();
  };

  container.querySelectorAll('.avd-th').forEach(th => th.addEventListener('click', () => updateSort(th.dataset.col)));
  updateSort('total'); // apply initial highlight
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

// ── TÍTULOS Y LOGROS ──────────────────────────────────────────────────────────

function calcTitulos() {
  if (!DATA.length) return [];
  const titles = [];

  const ffTotals       = new Map();
  const deathTotals    = new Map();
  const timeDeadTotals = new Map();
  const portadorCount  = new Map();
  const dispelTotals   = new Map();
  const intTotals      = new Map();
  const avoidTotal     = new Map();
  const avoidByMech    = { 'Blast Wave': new Map(), 'Whirlwind': new Map(), 'Cave In': new Map(), 'Debris': new Map(), 'Conflagration': new Map() };

  DATA.forEach(raid => {
    (raid.leaderboard ?? []).forEach(e => ffTotals.set(e.name, (ffTotals.get(e.name) ?? 0) + e.damage));
    (raid.deathStats?.deaths   ?? []).forEach(e => deathTotals.set(e.name, (deathTotals.get(e.name) ?? 0) + e.count));
    (raid.deathStats?.timeDead ?? []).forEach(e => timeDeadTotals.set(e.name, (timeDeadTotals.get(e.name) ?? 0) + e.ms));
    if (raid.leaderboard[0]) portadorCount.set(raid.leaderboard[0].name, (portadorCount.get(raid.leaderboard[0].name) ?? 0) + 1);
    (raid.dispels    ?? []).forEach(e => dispelTotals.set(e.name, (dispelTotals.get(e.name) ?? 0) + e.total));
    (raid.interrupts ?? []).forEach(e => intTotals.set(e.name, (intTotals.get(e.name) ?? 0) + e.total));
    (raid.avoidableDamage ?? []).forEach(mech => {
      mech.players.forEach(p => {
        avoidTotal.set(p.name, (avoidTotal.get(p.name) ?? 0) + p.total);
        if (mech.mechanic in avoidByMech) avoidByMech[mech.mechanic].set(p.name, (avoidByMech[mech.mechanic].get(p.name) ?? 0) + p.total);
      });
    });
  });

  const rcMap    = raidCountMap();
  const minRaids = Math.max(1, Math.ceil(DATA.length * 0.3));

  const topOf = (map, qualify = true) => {
    let best = null, bestVal = -1;
    for (const [name, val] of map) {
      if (qualify && (rcMap.get(name) ?? 0) < minRaids) continue;
      if (val > bestVal) { best = name; bestVal = val; }
    }
    return best ? { name: best, val: bestVal } : null;
  };

  // ── Vergüenza ──
  const pickFor = (_name, _titleKey, arr) => arr[Math.floor(Math.random() * arr.length)];

  const topAvoid = topOf(avoidTotal);
  if (topAvoid) titles.push({ id:'kamikaze', icon:'💥', titulo:'El Kamikaze', desc:'Más daño recibido de mecánicas evitables', jugador: topAvoid.name,
    comentario: pickFor(topAvoid.name, 'kamikaze', [
      'Las mecánicas son sugerencias, no obligaciones.',
      '¿Por qué esquivar cuando puedes absorber?',
      'Coleccionista de daño evitable desde sus inicios.',
      'Un artista del sufrimiento autoinfligido.',
      'Estudió el Dungeon Journal solo para hacer lo contrario.',
      'Su regla de oro: si puedes esquivarlo, camínale encima.',
      'Los healers han pedido transferencia de servidor por su culpa.',
      'Colecciona stacks de debuffs como si dieran recompensas.',
    ]),
    valor: fmtDmg(topAvoid.val), tipo:'shame' });

  const topBlast = topOf(avoidByMech['Blast Wave']);
  if (topBlast) titles.push({ id:'temerario', icon:'🔥', titulo:'El Temerario', desc:'Más daño de Blast Wave · demasiado cerca de Krosh', jugador: topBlast.name,
    comentario: pickFor(topBlast.name, 'temerario', [
      'Krosh solo quería un abrazo.',
      'La distancia de seguridad es para cobardes.',
      'Se acercó tanto que Krosh le tomó cariño.',
      'Rompe récords de proximidad con magos furiosos.',
      'Krosh le tiene en su lista de favoritos.',
      'Le han explicado el concepto de rango seguro diez veces. No cala.',
      'Cada Blast Wave lleva su nombre escrito en letras de fuego.',
      'Si Krosh pudiera sonreír, sonreiría al verle llegar.',
    ]),
    valor: fmtDmg(topBlast.val), tipo:'shame' });

  const topWhirl = topOf(avoidByMech['Whirlwind']);
  if (topWhirl) titles.push({ id:'picadora', icon:'🌀', titulo:'El Picadora', desc:'Más daño de Whirlwind en Maulgar', jugador: topWhirl.name,
    comentario: pickFor(topWhirl.name, 'picadora', [
      'El torbellino le parece acogedor.',
      'Cree que Whirlwind es un baile de pareja.',
      'Si gira él, yo giro.',
      'Baila con el boss desde el primer día.',
      'El concepto "alejarse del boss" le es completamente ajeno.',
      'Pensó que el Whirlwind era opcional. No lo es.',
      'Baila más cerca del boss que cualquier otro en la historia de la banda.',
      'Le preguntaron qué hace durante el Whirlwind. Dijo "estar ahí".',
    ]),
    valor: fmtDmg(topWhirl.val), tipo:'shame' });

  const topCaveIn = topOf(avoidByMech['Cave In']);
  if (topCaveIn) titles.push({ id:'estalactita', icon:'🪨', titulo:'El Estalactita', desc:'Más daño de Cave In · rocas de Gruul', jugador: topCaveIn.name,
    comentario: pickFor(topCaveIn.name, 'estalactita', [
      'Las rocas le buscan a él específicamente.',
      'Tiene un acuerdo especial con la geología.',
      'El techo de Gruul no miente.',
      'Imán certificado para proyectiles de piedra.',
      'Gruul le tira rocas de forma completamente personalizada.',
      'Ha memorizado el patrón de caída de piedras. Para acercarse más.',
      'Tiene más rocas en la cabeza que el propio Gruul.',
      'El techo le llama por su nombre. Él acude.',
    ]),
    valor: fmtDmg(topCaveIn.val), tipo:'shame' });

  const topDebris = topOf(avoidByMech['Debris']);
  if (topDebris) titles.push({ id:'albanil', icon:'🧱', titulo:'El Albañil', desc:'Más daño de Debris · techo de Magtheridon', jugador: topDebris.name,
    comentario: pickFor(topDebris.name, 'albanil', [
      'Le caen las vigas encima con regularidad sospechosa.',
      'Inspecciona el techo de Magtheridon con la cabeza.',
      'La fase de las palancas es lo de menos.',
      'El debris le tiene manía personal.',
      'Inspecciona el techo con la frente con una constancia admirable.',
      'Magtheridon lleva semanas apuntándole específicamente.',
      'Le han caído más vigas encima que a toda la construcción civil de Outland.',
      'Ve el techo caer y piensa: eso no me pasará. Le pasa.',
    ]),
    valor: fmtDmg(topDebris.val), tipo:'shame' });

  const topConf = topOf(avoidByMech['Conflagration']);
  if (topConf) titles.push({ id:'tostado', icon:'🍖', titulo:'El Tostado', desc:'Más daño de Conflagration · fuego en el suelo', jugador: topConf.name,
    comentario: pickFor(topConf.name, 'tostado', [
      'El fuego en el suelo le parece decorativo.',
      '¿Para qué moverse si el suelo está calentito?',
      'Campista profesional en zonas en llamas.',
      'El fuego es su elemento. Literalmente.',
      'El fuego en el suelo es su zona de confort.',
      'Le dijeron "sal del fuego". Él dijo "¿cuál fuego?".',
      'Magtheridon le prepara una hoguera especial cada semana.',
      'Podría ser ignífugo. No lo es. Se nota.',
    ]),
    valor: fmtDmg(topConf.val), tipo:'shame' });

  // El Traidor: más daño total a aliados
  const topFF = topOf(ffTotals);
  if (topFF) titles.push({ id:'portador', icon:'🗡️', titulo:'El Traidor', desc:'Más daño total a aliados histórico', jugador: topFF.name,
    comentario: pickFor(topFF.name, 'portador', [
      'Sus aliados le temen más que a los bosses.',
      'La banda sobrevive a Gruul. A él, no siempre.',
      'Con amigos así, los bosses sobran.',
      'Juró lealtad a la banda. Los logs cuentan otra historia.',
      'El boss ya no le hace falta: la banda se destruye sola con su ayuda.',
      'Ha dañado más aliados que enemigos. Los logs no mienten.',
      'En su necrológica pondrán: causó más bajas entre los suyos que el boss.',
      'Friendly fire no es un accidente para él, es una estrategia.',
    ]),
    valor: fmtDmg(topFF.val) + ' de FF total', tipo:'shame' });

  const topDead = topOf(deathTotals);
  if (topDead) titles.push({ id:'martir', icon:'💀', titulo:'El Mártir', desc:'Más muertes históricas', jugador: topDead.name,
    comentario: pickFor(topDead.name, 'martir', [
      'Conoce el suelo de cada boss mejor que nadie.',
      'La muerte es para él un estado temporal.',
      'Muere por los demás. Y por los jefes. Y por las rocas.',
      'Contribuye al kill a su manera: siendo contado como baja.',
      'Conoce cada cutscene de muerte del boss de memoria. Desde dentro.',
      'Respawnea con tanta frecuencia que el espíritu de sombra le conoce por el nombre.',
      'Su fantasma ha visto más del boss que muchos vivos.',
      'Aporta estadísticas de wipereel de forma consistente y comprometida.',
    ]),
    valor: topDead.val + ' muertes', tipo:'shame' });

  const topGhost = topOf(timeDeadTotals);
  if (topGhost) titles.push({ id:'fantasma', icon:'👻', titulo:'El Fantasma', desc:'Mayor tiempo muerto histórico', jugador: topGhost.name,
    comentario: pickFor(topGhost.name, 'fantasma', [
      'Pasa más tiempo de espectador que de jugador.',
      'Su fantasma tiene más experiencia que muchos vivos.',
      'La perspectiva aérea de los jefes: su especialidad.',
      'Murió tan pronto que tuvo tiempo de ver el final sentado.',
      'Su contribución en fase fantasma es legendaria.',
      'Pasa tanto tiempo muerto que ya cobra el sueldo de espectador.',
      'El tiempo de raid se divide en: vivo (poco) y muerto (bastante).',
      'Murió tan pronto que tuvo tiempo de hacer otra cosa mientras los demás acababan.',
    ]),
    valor: fmtMs(topGhost.val), tipo:'shame' });

  // El Primero: más veces primer muerto de la raid, mínimo 2
  const firstToDieCount = new Map();
  DATA.forEach(raid => {
    const name = raid.deathStats?.firstToDie?.name;
    if (name) firstToDieCount.set(name, (firstToDieCount.get(name) ?? 0) + 1);
  });
  const topFirst = [...firstToDieCount.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  if (topFirst.length > 0) titles.push({ id:'primero', icon:'💨', titulo:'El Primero', desc:'Más veces siendo el primer muerto', jugador: topFirst[0][0],
    comentario: pickFor(topFirst[0][0], 'primero', [
      'El canario de la mina. Siempre el primero en probar el veneno.',
      'Su muerte es el aviso para los demás de que va en serio.',
      'Estadísticamente, el boss le detecta primero.',
      'Abre el marcador con una consistencia envidiable.',
      'Su detector de mecánicas funciona al revés: las activa para avisarnos.',
      'Cae tan rápido que los healers no tienen tiempo ni de mirarle.',
      'Primera muerte, primera estadística, primera contribución.',
      'El canario más eficiente de la mina. Y el más recurrente.',
    ]),
    valor: topFirst[0][1] + ' veces', tipo:'shame' });

  // El Masoca: mayor golpe recibido de un aliado
  let masoca = null;
  DATA.forEach(raid => {
    const br = raid.biggestHits?.biggestReceived;
    if (br?.amount > (masoca?.amount ?? 0)) masoca = { ...br, fecha: raid.fecha };
  });
  if (masoca) titles.push({ id:'masoca', icon:'🤕', titulo:'El Masoca', desc:'Mayor golpe recibido en toda la temporada', jugador: masoca.victima,
    comentario: pickFor(masoca.victima, 'masoca', [
      'El boss le eligió a él para el mensaje más contundente.',
      'Ese golpe lo sintió hasta el teclado.',
      'Récord histórico de daño recibido en un solo impacto.',
      'Una cifra que impresiona incluso al boss que la infligió.',
      'El número que aparece en ese log le perseguirá eternamente.',
      'Ese golpe fue tan bestia que hasta el boss se sorprendió.',
      'Recibió tanto daño de una vez que los healers se rieron nerviosos.',
      'Un impacto histórico. Ojalá fuera por algo bueno.',
    ]),
    valor: fmtDmg(masoca.amount) + (masoca.ability ? ` · ${masoca.ability}` : ''), tipo:'shame' });

  // El Mudo: menos interrupts entre clases capaces con min raids
  const CAPABLE_CLASS = new Set(['Warrior','Rogue','Mage']);
  const SHAMAN_CAPABLE = new Set(['Enhancement','Elemental']);
  const capable = Object.entries(PLAYER_CLASS_MAP)
    .filter(([n, cls]) => {
      if (!CAPABLE_CLASS.has(cls) && !(cls === 'Shaman' && SHAMAN_CAPABLE.has(PLAYER_SPEC_MAP[n]))) return false;
      return (rcMap.get(n) ?? 0) >= minRaids;
    })
    .map(([n]) => ({ name: n, val: intTotals.get(n) ?? 0 }))
    .sort((a, b) => a.val - b.val);
  if (capable.length > 0) {
    const mudoMin = capable[0].val;
    const mudos = capable.filter(e => e.val === mudoMin).map(e => e.name);
    titles.push({ id:'mudo', icon:'🤐', titulo:'El Mudo', desc:'Menos interrupts entre los capaces', jugadores: mudos,
      comentario: pickFor(mudos[0], 'mudo', [
        'Los interrupts son para los que se aburren.',
        'Prefiere observar cómo los demás interrumpen.',
        'Tiene el botón de silencio activado desde el primer día.',
        'La barra de casteo del boss: su forma de meditar.',
        'Su tecla de interrupt ha emigrado a otro personaje.',
        'Tiene interrupt en la barra de acción. Lo tiene muy bonito ahí.',
        'Interrumpir es para los que no confían en los healers.',
        'El boss castea tranquilo cuando le ve llegar.',
      ]),
      valor: mudoMin + ' interrupts', tipo:'shame' });
  }

  // ── Honor ──
  const topDisp = topOf(dispelTotals);
  if (topDisp) titles.push({ id:'escudo', icon:'🛡️', titulo:'El Escudo', desc:'Más dispels históricos', jugador: topDisp.name,
    comentario: pickFor(topDisp.name, 'escudo', [
      'El grupo respira tranquilo cuando él está presente.',
      'Dispela más rápido que la mayoría piensa en hacerlo.',
      'El MVP silencioso que nadie menciona pero todos necesitan.',
      'Su barra de acción tiene más botones de dispel que de cura. Y eso es mucho decir.',
      'Actúa antes de que el debuff se acomode.',
      'Tiene un sentido especial para detectar lo que debe quitarse.',
      'Si hubiera un campeonato de dispel, ya estaría clasificado.',
      'Su olfato para los debuffs es clínico.',
    ]),
    valor: topDisp.val + ' dispels', tipo:'honor' });

  const topInt = topOf(intTotals);
  if (topInt) titles.push({ id:'centinela', icon:'⚡', titulo:'El Centinela', desc:'Más interrupts históricos', jugador: topInt.name,
    comentario: pickFor(topInt.name, 'centinela', [
      'Ningún casteo pasa sin su permiso.',
      'El boss empieza a castear y ya siente el interrupt llegar.',
      'Interrumpir es su idioma materno.',
      'Los demás reaccionan, él ya ha actuado.',
      'El boss lleva semanas sin acabar un casteo completo. Por su culpa.',
      'Reacciona tan rápido que la barra de casteo es solo decorativa.',
      'Ha internalizado los timings de casteo mejor que el boss mismo.',
      'Su dedo lleva el peso de impedir el desastre semana tras semana.',
    ]),
    valor: topInt.val + ' interrupts', tipo:'honor' });

  const survivors = [...rcMap.entries()]
    .filter(([, c]) => c >= minRaids)
    .map(([n, c]) => ({ name: n, val: (deathTotals.get(n) ?? 0) / c }))
    .sort((a, b) => a.val - b.val);
  if (survivors.length > 0) titles.push({ id:'superviviente', icon:'🌿', titulo:'El Superviviente', desc:'Menos muertes por raid entre los asiduos', jugador: survivors[0].name,
    comentario: pickFor(survivors[0].name, 'superviviente', [
      'En la catástrofe general, él sale caminando.',
      'Mientras el grupo muere, él toma nota.',
      'La muerte le conoce de oídas, nada más.',
      'Sobrevivir donde otros caen: su talento oculto.',
      'Muere tan poco que los demás sospechan que hace trampa.',
      'La mecánica de muerte le resulta teórica.',
      'Acaba cada raid con más HP del que empezó. Casi.',
      'Mientras el grupo se derrumba, él observa con serenidad olímpica.',
    ]),
    valor: survivors[0].val.toFixed(2) + ' muertes/raid', tipo:'honor' });

  const pacifistas = [...rcMap.entries()]
    .filter(([n, c]) => c >= minRaids && (ffTotals.get(n) ?? 0) === 0)
    .sort((a, b) => b[1] - a[1]);
  if (pacifistas.length > 0) titles.push({ id:'pacifista', icon:'☮️', titulo:'El Pacifista', desc:'Nunca ha dañado a un aliado', jugador: pacifistas[0][0],
    comentario: pickFor(pacifistas[0][0], 'pacifista', [
      'Nunca ha rozado a un aliado. Ni de broma.',
      'Sus compañeros confían plenamente en él. Con razón.',
      'El único que puede decir que sus golpes solo duelen al boss.',
      'En el caos del Whirlwind, él es la calma.',
      'Un caso clínico de autocontrol en un ambiente de caos.',
      'Sus aliados ni saben que puede hacerles daño. Buena señal.',
      'El único que puede afirmar sin mentir que no ha tocado a nadie.',
      'En un raid lleno de traidores, él es la excepción que confirma la regla.',
    ]),
    valor: rcMap.get(pacifistas[0][0]) + ' raids sin FF', tipo:'honor' });

  // El Espartano: más raids sin morir ni una vez (entre asiduos)
  const spartanCount = new Map();
  DATA.forEach(raid => {
    const deadInRaid = new Set((raid.deathStats?.deaths ?? []).filter(e => e.count > 0).map(e => e.name));
    (raid.roster ?? []).forEach(name => {
      if (!deadInRaid.has(name)) spartanCount.set(name, (spartanCount.get(name) ?? 0) + 1);
    });
  });
  const topSpartan = [...spartanCount.entries()]
    .filter(([n]) => (rcMap.get(n) ?? 0) >= minRaids)
    .sort((a, b) => b[1] - a[1]);
  if (topSpartan.length > 0) titles.push({ id:'espartano', icon:'⚔️', titulo:'El Espartano', desc:'Más raids sin morir ni una vez', jugador: topSpartan[0][0],
    comentario: pickFor(topSpartan[0][0], 'espartano', [
      'Muerto no. Herido tampoco. Perfecto.',
      'El suelo de los bosses no le conoce la cara.',
      'Mientras el grupo cae, él sigue en pie.',
      'Termina la raid tan entero como la empezó.',
      'Los jefes le atacan, él los ignora. Los resultados hablan.',
      'Ha terminado más raids limpio que la mayoría empieza.',
      'Su récord de no-muerte es un insulto silencioso a los demás.',
      'Ni el suelo de Gruul le ha conocido la cara todavía.',
    ]),
    valor: topSpartan[0][1] + ' raids limpias', tipo:'honor' });

  // El Intocable: menos daño evitable entre los asiduos
  const intocables = [...rcMap.entries()]
    .filter(([, c]) => c >= minRaids)
    .map(([n]) => ({ name: n, val: avoidTotal.get(n) ?? 0 }))
    .sort((a, b) => a.val - b.val);
  if (intocables.length > 0) titles.push({ id:'intocable', icon:'🧘', titulo:'El Intocable', desc:'Menos daño recibido de mecánicas evitables', jugador: intocables[0].name,
    comentario: pickFor(intocables[0].name, 'intocable', [
      'Lee las mecánicas antes de la raid. Los demás leen los logs después.',
      'Se mueve antes de que el suelo le dé motivos.',
      'Juega como si el daño evitable no existiera. Porque para él no existe.',
      'Donde otros ven fuego, él ya no está.',
      'Esquiva antes de que la mecánica aparezca en pantalla.',
      'Lee el movimiento del boss como si tuviera los scripts.',
      'El daño evitable le resulta un concepto abstracto y ajeno.',
      'En el caos total, él ya está donde no hay nada que esquivar.',
    ]),
    valor: intocables[0].val === 0 ? 'sin daño evitable' : fmtDmg(intocables[0].val), tipo:'honor' });

  // El Verdugo: mayor golpe único infligido a un enemigo
  let verdugo = null;
  DATA.forEach(raid => {
    Object.entries(raid.playerHitStats ?? {}).forEach(([pname, stats]) => {
      if (stats.biggestHit?.amount > (verdugo?.amount ?? 0))
        verdugo = { ...stats.biggestHit, jugador: pname, fecha: raid.fecha };
    });
  });
  if (verdugo) titles.push({ id:'verdugo', icon:'🗡️', titulo:'El Verdugo', desc:'Mayor golpe único infligido en toda la temporada', jugador: verdugo.jugador,
    comentario: pickFor(verdugo.jugador, 'verdugo', [
      'Un solo golpe que el boss no olvidará. Si pudiera recordar.',
      'El log no mentía. Ese número es real.',
      'Hay golpes que hacen historia. Este es uno de ellos.',
      'El boss sintió ese en particular.',
      'Ese número en el log tiene nombre. Y es el suyo.',
      'El boss lo sintió. No lo va a olvidar en mucho tiempo.',
      'Un golpe que hizo historia. Silenciosamente.',
      'Cuando pegó así, hasta los healers dejaron de curar un momento.',
    ]),
    valor: fmtDmg(verdugo.amount) + (verdugo.ability ? ` · ${verdugo.ability}` : '') + (verdugo.target ? ` → ${verdugo.target}` : ''), tipo:'honor' });

  return titles;
}

function getPlayerTitles(name) {
  return TITULOS.filter(t => t.jugador === name || (t.jugadores ?? []).includes(name));
}

// ── GALERÍA DE INFAMIA ────────────────────────────────────────────────────────

function buildGaleriaInfamia() {
  const el = document.getElementById('tab-logros');
  if (!el) return;
  if (!TITULOS.length) { el.innerHTML = '<div class="empty-msg">Sin datos suficientes.</div>'; return; }

  const shames = TITULOS.filter(t => t.tipo === 'shame');
  const honors = TITULOS.filter(t => t.tipo === 'honor');

  const card = t => {
    const players = t.jugadores ?? [t.jugador];
    const playerHTML = players.map(p => `<span class="player-link" data-player="${p}">${p}</span>`).join(', ');
    return `
    <div class="titulo-card titulo-card--${t.tipo}">
      <div class="titulo-icon">${t.icon}</div>
      <div class="titulo-body">
        <div class="titulo-titulo">${t.titulo}</div>
        <div class="titulo-jugador">${playerHTML}</div>
        <div class="titulo-desc">${t.desc}</div>
        ${t.comentario ? `<div class="titulo-comentario">${t.comentario}</div>` : ''}
        <div class="titulo-valor">${t.valor}</div>
      </div>
    </div>`;
  };

  el.innerHTML = `
    <div class="section-title" style="font-size:1.4rem">Títulos de la Infamia</div>
    <div class="titulos-grid">${shames.map(card).join('')}</div>
    <div class="section-title" style="margin-top:2rem;font-size:1.4rem">Títulos de Honor</div>
    <div class="titulos-grid">${honors.map(card).join('')}</div>
  `;

  el.querySelectorAll('.player-link').forEach(e => e.addEventListener('click', () => openPlayer(e.dataset.player)));
}

// ── TITULAR DE LA NOCHE ───────────────────────────────────────────────────────

function generarTitulares(raid, allRaids) {
  const sorted   = [...allRaids].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const raidIdx  = sorted.findIndex(r => r.report === raid.report && r.fightId === raid.fightId);
  const prev     = sorted.slice(0, raidIdx);
  const lines    = [];

  // Seed determinista por raid para elegir variante de texto
  const seed = [...(raid.report ?? 'x')].reduce((s, c) => s + c.charCodeAt(0), 0);
  const pick = arr => arr[seed % arr.length];

  const dmg   = fmtDmg(raid.leaderboard[0]?.damage ?? 0);
  const bs    = raid.bossStats;
  const firstDie  = raid.deathStats?.firstToDie;
  const topDead   = raid.deathStats?.deaths?.[0];
  const totalDeaths = (raid.deathStats?.deaths ?? []).reduce((s, e) => s + e.count, 0);
  const dps = calcRaidDpsHps(raid);

  // 1. Portador
  const winner = raid.leaderboard[0]?.name;
  if (winner) {
    let streak = 0;
    for (let i = raidIdx; i >= 0; i--) { if (sorted[i].leaderboard[0]?.name === winner) streak++; else break; }
    if (streak >= 4) lines.push(pick([
      `<b>${winner}</b> lleva <b>${streak} semanas seguidas</b> portando la Resaca. A estas alturas ya es patrimonio cultural.`,
      `<b>${streak} raids consecutivas</b> con <b>${winner}</b> al frente del friendly fire. El resto ya ni se molesta en competir.`,
      `<b>${winner}</b> lleva <b>${streak} semanas</b> siendo el mayor peligro de la banda. Los bosses lo miran con respeto.`,
    ]));
    else if (streak >= 3) lines.push(pick([
      `<b>${winner}</b> lleva <b>${streak} semanas consecutivas</b> portando la Resaca. Alguien que lo pare.`,
      `Tres raids, mismo ganador. <b>${winner}</b> ha convertido el friendly fire en una costumbre. Una muy cara.`,
      `<b>${streak} en fila</b> para <b>${winner}</b>. El Traidor ya no es un título, es una identidad.`,
    ]));
    else if (streak === 2) lines.push(pick([
      `<b>${winner}</b> repite como Portador de la Resaca. Va para racha.`,
      `<b>${winner}</b> vuelve a liderar el friendly fire. La consistencia es una virtud, supongo.`,
      `Segunda raid seguida para <b>${winner}</b>. Con <b>${dmg}</b> de daño a aliados. Progresión inversa.`,
      `<b>${winner}</b> defiende el título. <b>${dmg}</b> de ff y ni una disculpa. Clásico.`,
    ]));
    else lines.push(pick([
      `<b>${winner}</b> se corona nuevo Portador con <b>${dmg}</b> de daño a sus propios compañeros.`,
      `<b>${dmg}</b> de friendly fire. <b>${winner}</b> se lleva la Resaca sin esfuerzo aparente.`,
      `<b>${winner}</b> demuestra que el mayor enemigo de la banda es <b>${winner}</b>. <b>${dmg}</b> de ff.`,
      `La Resaca de esta noche es para <b>${winner}</b>, con <b>${dmg}</b> de daño a los suyos. Gruul toma nota.`,
      `<b>${winner}</b> aparentemente confundió a sus compañeros con el boss. <b>${dmg}</b> de daño a aliados.`,
      `Con <b>${dmg}</b> de ff, <b>${winner}</b> se lleva la Resaca. Sin aparente esfuerzo y sin aparente vergüenza.`,
    ]));
  } else {
    lines.push(pick([
      'Noche sin culpables: nadie hizo daño a aliados. ¿Sigue siendo la misma banda?',
      'Cero friendly fire. O hemos madurado mucho, o alguien está manipulando los logs.',
      'Sin Portador esta noche. Los bosses se preguntan quién va a hacer su trabajo.',
      'Nadie hizo friendly fire. Momento histórico. Que nadie lo cuente fuera.',
    ]));
  }

  // 2. Wipes
  if (bs) {
    if (bs.totalWipes === 0) {
      let cleanStreak = 0;
      for (let i = raidIdx; i >= 0; i--) { if ((sorted[i].bossStats?.totalWipes ?? 1) === 0) cleanStreak++; else break; }
      if (cleanStreak >= 3) lines.push(pick([
        `<b>${cleanStreak} raids seguidas sin un solo wipe.</b> Los bosses han pedido reunión de emergencia.`,
        `<b>${cleanStreak} raids limpias seguidas.</b> Esto empieza a dar miedo.`,
      ]));
      else if (cleanStreak >= 2) lines.push(pick([
        `<b>${cleanStreak} raids seguidas sin un solo wipe.</b> La banda ha madurado. O los bosses se han vuelto más blandos.`,
        `Segunda raid limpia consecutiva. Los jefes de raid no lo dicen, pero están emocionados.`,
      ]));
      else lines.push(pick([
        'Raid impoluta: cero wipes. Guárdalo porque no dura.',
        'Sin wipes esta noche. Los bosses lo están tomando como algo personal.',
        'Cero wipes. El récord está en peligro de seguir siendo récord.',
        'Noche sin wipes. Los sanadores duermen tranquilos esta vez.',
        'Raid limpia. Los bosses ya están hablando entre ellos para vengarse la semana que viene.',
      ]));
    } else if (bs.totalWipes >= 8) {
      lines.push(pick([
        `<b>${bs.totalWipes} wipes</b>. En algún punto hay que preguntarse si el problema son los bosses o nosotros.`,
        `${bs.totalWipes} wipes. El gremio de fantasmas está considerando abrir sede permanente aquí.`,
        `${bs.totalWipes} wipes esta noche. El boss ya nos conoce por el nombre y nos guarda el sitio.`,
        `Con <b>${bs.totalWipes} wipes</b>, la noche se convirtió en una clase magistral de cómo no hacerlo.`,
      ]));
    } else if (bs.totalWipes >= 5) {
      lines.push(pick([
        `Noche de sufrimiento colectivo: <b>${bs.totalWipes} wipes</b>. El terapeuta de la banda está haciendo horas extra.`,
        `${bs.totalWipes} wipes antes del kill. Los bosses ya nos conocen por el nombre.`,
        `<b>${bs.totalWipes} intentos</b> para tirar al boss. No porque sea difícil, sino porque somos así.`,
        `${bs.totalWipes} wipes. El boss empezó a darnos pena y se dejó matar.`,
      ]));
    } else if (bs.totalWipes >= 3) {
      lines.push(pick([
        `${bs.totalWipes} wipes en la noche. Se puede hacer mejor.`,
        `${bs.totalWipes} wipes. "Estábamos calentando", dijeron. Siempre dicen eso.`,
        `${bs.totalWipes} intentos. El boss tampoco lo tiene fácil con nosotros.`,
        `Tres intentos antes del kill. Nadie lo dirá en voz alta, pero todos pensaron en irse a dormir.`,
      ]));
    } else if (bs.totalWipes === 1) {
      lines.push(pick([
        'Un wipe antes del kill. Dijeron que era para calentar. Puede ser.',
        'Solo un wipe. Casi perfecto. Casi.',
        'Un wipe. El boss quiso llevarse el suspense hasta el final.',
      ]));
    }
  }

  // 3. Récord de velocidad (boss con mayor % de mejora)
  if (bs && prev.length > 0) {
    const thisBosses = raid.bossStats?.bosses ?? [];
    let bestRecord = null;
    for (const boss of thisBosses) {
      if (!boss.killTimeMs) continue;
      const sn = boss.name.replace('Gruul the Dragonkiller','Gruul').replace('High King Maulgar','Maulgar');
      const prevTimes = prev.map(r => (r.bossStats?.bosses ?? []).find(b => b.name === boss.name)?.killTimeMs).filter(Boolean);
      if (!prevTimes.length) continue;
      const prevBest = Math.min(...prevTimes);
      if (boss.killTimeMs < prevBest) {
        const pct = (prevBest - boss.killTimeMs) / prevBest;
        if (!bestRecord || pct > bestRecord.pct) bestRecord = { bossName: sn, thisMs: boss.killTimeMs, prevBestMs: prevBest, pct };
      }
    }
    if (bestRecord) {
      const pctStr = (bestRecord.pct * 100).toFixed(0);
      lines.push(pick([
        `${bestRecord.bossName} cae en <b>${fmtMs(bestRecord.thisMs)}</b>: nuevo récord (antes ${fmtMs(bestRecord.prevBestMs)}, −${pctStr}%).`,
        `Nuevo récord en ${bestRecord.bossName}: <b>${fmtMs(bestRecord.thisMs)}</b>. Antes tardábamos ${fmtMs(bestRecord.prevBestMs)}. Algo hemos aprendido.`,
        `${bestRecord.bossName} en <b>${fmtMs(bestRecord.thisMs)}</b>. Un ${pctStr}% más rápido que nunca. Guardar la fecha.`,
        `Kill de ${bestRecord.bossName} en <b>${fmtMs(bestRecord.thisMs)}</b>. El récord anterior era ${fmtMs(bestRecord.prevBestMs)}. Por fin.`,
      ]));
    }
  }

  // 4. Top muerte
  if (topDead?.count >= 5) {
    lines.push(pick([
      `<b>${topDead.name}</b> muere <b>${topDead.count} veces</b> esta noche. Ya tiene más experiencia muriendo que matando.`,
      `<b>${topDead.name}</b>: <b>${topDead.count} muertes</b>. Está explorando activamente el sistema de respawn.`,
      `<b>${topDead.count} veces</b> en el suelo para <b>${topDead.name}</b>. Gruul tampoco lo mata tanto a él.`,
      `<b>${topDead.name}</b> decidió que vivir era opcional esta noche. ${topDead.count} veces para demostrarlo.`,
      `<b>${topDead.name}</b> muere <b>${topDead.count} veces</b>. El cementerio ya le tiene reservado sitio fijo.`,
    ]));
  } else if (topDead?.count >= 3) {
    lines.push(pick([
      `<b>${topDead.name}</b> muere <b>${topDead.count} veces</b> esta noche. Constancia.`,
      `<b>${topDead.count} muertes</b> para <b>${topDead.name}</b>. Spoiler: no mejoró con la práctica.`,
      `<b>${topDead.name}</b> probó a morir <b>${topDead.count} veces</b>. El boss se lo está tomando bien.`,
      `<b>${topDead.name}</b> con <b>${topDead.count} muertes</b>. Los compañeros, silencio cómplice.`,
      `<b>${topDead.name}</b> muere <b>${topDead.count} veces</b>. Ya se sabe el camino del cementerio de memoria.`,
    ]));
  }

  // 5. Primer muerto rápido
  if (firstDie?.name && firstDie.timeMs) {
    if (firstDie.timeMs < 12000) lines.push(pick([
      `<b>${firstDie.name}</b> palma a los <b>${(firstDie.timeMs/1000).toFixed(1)}s</b> del pull. Ni terminó de colocarse.`,
      `<b>${(firstDie.timeMs/1000).toFixed(1)} segundos</b>. <b>${firstDie.name}</b> no esperó ni al primer trash para caer.`,
      `<b>${firstDie.name}</b> al suelo en <b>${(firstDie.timeMs/1000).toFixed(1)}s</b>. El pull todavía no había terminado de resolverse.`,
    ]));
    else if (firstDie.timeMs < 30000) lines.push(pick([
      `<b>${firstDie.name}</b> abre el marcador de muertes a los <b>${(firstDie.timeMs/1000).toFixed(0)}s</b>. Un clásico.`,
      `Alguien tenía que ser el primero. <b>${firstDie.name}</b> se ofreció a los <b>${(firstDie.timeMs/1000).toFixed(0)}s</b>, sin saberlo.`,
      `<b>${firstDie.name}</b> inaugura el cementerio a los <b>${(firstDie.timeMs/1000).toFixed(0)}s</b>. Tradición de guild.`,
    ]));
  }

  // 6. Nuevo récord DPS
  if (dps && prev.length > 0) {
    const prevBest = prev.reduce((best, r) => { const s = calcRaidDpsHps(r); return s && s.dps > best ? s.dps : best; }, 0);
    if (prevBest > 0 && dps.dps > prevBest) lines.push(pick([
      `Nuevo récord de daño: la banda supera los <b>${fmtDmg(dps.dps)} DPS</b>. El esfuerzo a veces da frutos.`,
      `<b>${fmtDmg(dps.dps)} DPS</b> de media. Nuevo récord histórico. Guardar la fecha.`,
      `La banda nunca había hecho tanto daño. <b>${fmtDmg(dps.dps)} DPS</b>. Los bosses toman nota.`,
    ]));
  }

  // 7. Cero muertes
  if (totalDeaths === 0) lines.push(pick([
    'Noche histórica: nadie murió. Revisad los logs, seguro que hay algún error.',
    'Cero muertes en la raid. Los sanadores piden que conste en acta.',
    'Nadie murió esta noche. Esto no puede ser real. Alguien comprueba los logs.',
    'Sin muertes. Los bosses se preguntan qué han hecho mal.',
  ]));

  // 8. Mecánicas evitables
  const avoidMapT = new Map();
  (raid.avoidableDamage ?? []).forEach(m => m.players.forEach(p => avoidMapT.set(p.name, (avoidMapT.get(p.name) ?? 0) + p.total)));
  const topAvoidT = [...avoidMapT.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topAvoidT && topAvoidT[1] > 0) {
    const [avName, avDmg] = topAvoidT;
    lines.push(pick([
      `<b>${avName}</b> recibió ${fmtDmg(avDmg)} de daño evitable. Evitable, sí. Evitado, no.`,
      `${fmtDmg(avDmg)} de daño evitable para <b>${avName}</b>. El suelo estaba en llamas. Él también.`,
      `<b>${avName}</b> lidera las mecánicas evitables con ${fmtDmg(avDmg)}. A estas alturas ya son mecánicas inevitables para él.`,
      `El ganador de "¿quién se pone donde no debe?" es <b>${avName}</b>, con ${fmtDmg(avDmg)} de pruebas.`,
      `<b>${avName}</b> interpreta las mecánicas evitables como opcionales. ${fmtDmg(avDmg)} de daño después, sigue pensando lo mismo.`,
      `Con ${fmtDmg(avDmg)}, <b>${avName}</b> demuestra que los avisos visuales son decorativos.`,
      `<b>${avName}</b> y las mecánicas evitables: una relación complicada. ${fmtDmg(avDmg)} de daño. Muy complicada.`,
    ]));
  }

  return lines.slice(0, 5);
}


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

  let totalFF = 0, totalDeaths = 0, totalTimeDead = 0, totalInts = 0, totalDisp = 0, totalAvoid = 0;

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

    const avoid = (r.avoidableDamage ?? []).reduce((s, m) => s + (m.players.find(p => p.name === name)?.total ?? 0), 0);
    totalAvoid += avoid;
    totalFF += ff; totalDeaths += d; totalTimeDead += td; totalInts += int; totalDisp += dis;

    // Vergüenza de esta raid
    const participants = r.roster ? new Set(r.roster)
      : new Set([...r.leaderboard.map(e=>e.name), ...(r.deathStats?.deaths??[]).map(e=>e.name), ...(r.deathStats?.timeDead??[]).map(e=>e.name)]);
    const n = participants.size;
    let shameScore = null;
    if (n > 1) {
      const pct = (list) => { const idx = list.findIndex(e=>e.name===name); return idx===-1?0:(n-1-idx)/(n-1); };
      const avoidSortedS = [...(()=>{ const m2=new Map(); (r.avoidableDamage??[]).forEach(m=>m.players.forEach(p=>m2.set(p.name,(m2.get(p.name)??0)+p.total))); return [...m2.entries()].map(([n2,t])=>({name:n2,total:t})).sort((a,b)=>b.total-a.total); })()];
      shameScore = (pct(r.leaderboard) + pct(r.deathStats?.deaths??[]) + pct(r.deathStats?.timeDead??[]) + pct(avoidSortedS)) / 4 * 100;
    }

    return { fecha: r.fecha, report: r.report, ff, d, td, int, dis, avoid, shameScore, isPort, isFirst, hitStats };
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

  const playerTitles = getPlayerTitles(name);
  const badgesHTML = playerTitles.length ? `
    <div class="titulo-badges">
      ${playerTitles.map(t => `<span class="titulo-badge titulo-badge--${t.tipo}" title="${t.desc} · ${t.valor}">${t.icon} ${t.titulo}</span>`).join('')}
    </div>` : '';

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
    ${badgesHTML}
    <div class="profile-stats">
      <div class="pstat"><div class="plabel">Raids</div><div class="pval purple">${raidsAttended.length}</div></div>
      <div class="pstat"><div class="plabel">Fuego Amigo (Gruul)</div><div class="pval">${fmtDmg(totalFF)}</div></div>
      <div class="pstat"><div class="plabel">Mecánicas Evitables</div><div class="pval red">${fmtDmg(totalAvoid)}</div></div>
      <div class="pstat"><div class="plabel">Muertes</div><div class="pval red">${totalDeaths}</div></div>
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

    ${(() => {
      if (raidsAttended.length < 2) return '';
      const sorted = [...raidsAttended].sort((a, b) => a.fecha.localeCompare(b.fecha));
      const xLabels = sorted.map(r => fmtDate(r.fecha));
      const shameValues = sorted.map(r => {
        const participants = r.roster ? new Set(r.roster)
          : new Set([...r.leaderboard.map(e=>e.name), ...(r.deathStats?.deaths??[]).map(e=>e.name), ...(r.deathStats?.timeDead??[]).map(e=>e.name)]);
        const n = participants.size;
        if (n <= 1) return null;
        const pct = (list) => { const idx = list.findIndex(e=>e.name===name); return idx===-1?0:(n-1-idx)/(n-1); };
        const avoidMap3 = new Map();
        (r.avoidableDamage ?? []).forEach(m => m.players.forEach(p => avoidMap3.set(p.name, (avoidMap3.get(p.name) ?? 0) + p.total)));
        const avoidSorted3 = [...avoidMap3.entries()].map(([n2, total]) => ({ name: n2, total })).sort((a, b) => b.total - a.total);
        return (pct(r.leaderboard) + pct(r.deathStats?.deaths??[]) + pct(r.deathStats?.timeDead??[]) + pct(avoidSorted3)) / 4 * 100;
      });
      const series = [{ label: 'Vergüenza', color: 'var(--red2)', values: shameValues }];
      return `
        <div class="section-title">Evolución del Score de Vergüenza</div>
        <div class="prog-chart" style="margin-bottom:1.5rem">
          ${drawLineChart(xLabels, series, v => v.toFixed(0) + '%', 0, 100)}
        </div>`;
    })()}
    <div class="section-title">Histórico por Raid</div>
    <table class="raid-table">
      <thead><tr>
        <th>Fecha</th>
        <th>Vergüenza</th>
        <th>Mec. Evitables</th>
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
          <td class="td-red">${r.shameScore != null ? r.shameScore.toFixed(0) + '%' : '<span class="td-dim">—</span>'}</td>
          <td class="td-red">${r.avoid ? fmtDmg(r.avoid) : '<span class="td-dim">—</span>'}</td>
          <td class="td-gold">${r.ff ? fmtDmg(r.ff) : '<span class="td-dim">—</span>'}</td>
          <td class="td-red">${r.d || '<span class="td-dim">0</span>'}</td>
          <td class="td-red">${r.td ? fmtMs(r.td) : '<span class="td-dim">—</span>'}</td>
          <td class="td-purple">${r.int || '<span class="td-dim">0</span>'}</td>
          <td class="td-purple">${r.dis || '<span class="td-dim">0</span>'}</td>
          ${hasHitData ? `
          <td style="color:var(--gold)" title="${[r.hitStats?.biggestHit?.ability, r.hitStats?.biggestHit?.target ? '→ ' + r.hitStats.biggestHit.target : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestHit?.amount ? fmtDmg(r.hitStats.biggestHit.amount) : '<span class="td-dim">—</span>'}</td>
          <td style="color:#4ec97e" title="${[r.hitStats?.biggestHeal?.ability, r.hitStats?.biggestHeal?.target ? '→ ' + r.hitStats.biggestHeal.target : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestHeal?.amount ? fmtDmg(r.hitStats.biggestHeal.amount) : '<span class="td-dim">—</span>'}</td>
          <td style="color:var(--red2)" title="${[r.hitStats?.biggestReceived?.ability, r.hitStats?.biggestReceived?.source ? '← ' + r.hitStats.biggestReceived.source : ''].filter(Boolean).join(' ')}">${r.hitStats?.biggestReceived?.amount ? fmtDmg(r.hitStats.biggestReceived.amount) : '<span class="td-dim">—</span>'}</td>` : ''}
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
  _calcMimado();
}

function _calcMimado() {
  if (!lootRows) return;
  const count = new Map();
  lootRows.filter(r => ASSIGNED.has(r.response)).forEach(r => {
    count.set(r.nombre, (count.get(r.nombre) ?? 0) + 1);
  });
  if (!count.size) return;
  const max = Math.max(...count.values());
  const mimados = [...count.entries()].filter(([, c]) => c === max).map(([n]) => n);
  // Quitar título anterior si existe y añadir el nuevo
  TITULOS = TITULOS.filter(t => t.id !== 'mimado');
  const _mimadoComments = [
    'El loot le conoce por el nombre.',
    'El banco del personaje necesita ampliación urgente.',
    'Cada raid es Navidad para él.',
    'Los demás farmean experiencia, él farmea ítems.',
    'El sistema de loot funciona. Para él, concretamente.',
    'No sabe lo que es irse de vacío. Estadísticamente.',
    'Los demás votan, él recibe.',
    'Su personaje brilla más cada semana. Literalmente.',
  ];
  TITULOS.push({ id:'mimado', icon:'💸', titulo:'El Mimado', desc:'Más ítems de loot recibidos', jugadores: mimados,
    comentario: _mimadoComments[Math.floor(Math.random() * _mimadoComments.length)],
    valor: max + (max === 1 ? ' ítem' : ' ítems'), tipo:'shame' });
  buildGaleriaInfamia();
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

// ── EXPORT PNG ────────────────────────────────────────────────────────────────

document.getElementById('btn-export-png').addEventListener('click', () => {
  const btn = document.getElementById('btn-export-png');

  // Determine what to capture: Por Raid captures only the content area (not selector)
  const activeTab  = document.querySelector('.tab-content.active');
  const porRaidContent = document.getElementById('por-raid-content');
  const target = (activeTab?.id === 'tab-por-raid' && porRaidContent) ? porRaidContent : activeTab;
  if (!target) return;

  // Build filename from active tab name
  const activeBtn = document.querySelector('.tab-btn.active');
  const tabLabel  = (activeBtn?.textContent ?? 'tab').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const originalText = btn.innerHTML;
  btn.innerHTML = 'Generando...';
  btn.disabled  = true;

  html2canvas(target, {
    backgroundColor: '#0f1117',
    scale: 2,
    useCORS: true,
    logging: false,
  }).then(canvas => {
    const link    = document.createElement('a');
    link.download = `resaca-${tabLabel}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  }).finally(() => {
    btn.innerHTML = originalText;
    btn.disabled  = false;
  });
});

// ── TAB NAVIGATION ────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});
