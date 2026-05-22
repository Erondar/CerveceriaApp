'use strict';

// ── Datos ─────────────────────────────────────────────────────────────────────
const historial = window.__HISTORIAL_F2__ ?? [];

// Catálogo de bosses en orden de progresión
const SSC_BOSSES = ['Lurker', 'Hydross', 'Morogrim', 'Karathress', 'Leotheras', 'Vashj'];
const TK_BOSSES  = ['VoidReaver', 'Solarian', 'Alar', 'Kaelthas'];
const ALL_BOSSES = [...SSC_BOSSES, ...TK_BOSSES];

// Short names for charts/tables (same order as ALL_BOSSES)
const BOSS_SHORT = {
  Lurker:     'Lurker',
  Hydross:    'Hydross',
  Morogrim:   'Morogrim',
  Karathress: 'Karathress',
  Leotheras:  'Leotheras',
  Vashj:      'Lady Vashj',
  VoidReaver: 'Void Reaver',
  Solarian:   'Solarian',
  Alar:       "Al'ar",
  Kaelthas:   "Kael'thas",
};

const BOSS_ABBR = {
  Lurker:     'Lurker',
  Hydross:    'Hydross',
  Morogrim:   'Moro.',
  Karathress: 'Kara.',
  Leotheras:  'Leo.',
  Vashj:      'Vashj',
  VoidReaver: 'VR',
  Solarian:   'Solar.',
  Alar:       "Al'ar",
  Kaelthas:   "KT",
};

const BOSS_ICONS = {
  Lurker:     '🌊',
  Hydross:    '💧',
  Morogrim:   '🦑',
  Karathress: '🪝',
  Leotheras:  '👹',
  Vashj:      '🐍',
  VoidReaver: '🤖',
  Solarian:   '⭐',
  Alar:       '🦅',
  Kaelthas:   '👑',
};

// Full display names (used in boss cards for Por Semana / Historial)
// Short names (charts/tables) are in BOSS_SHORT above
const BOSS_DISPLAY = {
  Lurker:     'Lurker',
  Hydross:    'Hydross',
  Morogrim:   'Morogrim',
  Karathress: 'Karathress',
  Leotheras:  'Leotheras',
  Vashj:      'Lady Vashj',
  VoidReaver: 'Void Reaver',
  Solarian:   'Solarian',
  Alar:       "Al'ar",
  Kaelthas:   "Kael'thas",
};

// ── Cita del Día ──────────────────────────────────────────────────────────────
const CITAS_F2 = [
  '«Las profundidades del Templo del Serpiente no son el mayor peligro. Lo somos nosotros.»',
  '«Lurker Below lleva semanas estudiando nuestros patrones de muerte. Nosotros, no.»',
  '«El suelo del SSC es agua. De todas formas, algunos se ahogan igual.»',
  '«Hydross te mata si cambias el elemento. Esta raid lo hace sin excusa.»',
  '«Inner Demon: la mecanica que demuestra que el enemigo mas peligroso eres tu mismo.»',
  '«Static Charge: porque correr hacia tus compañeros es un reflejo natural, aparentemente.»',
  '«Lady Vashj tiene tres fases. Esta raid tiene una sola: el caos.»',
  '«Un wipe en Leotheras dice mas de un jugador que mil logs.»',
  '«El arcano de Tempest Keep no confunde a los bosses. A algunos raideadores, si.»',
  '«Void Reaver tiene un solo mecanismo. Esta banda ha encontrado formas de fallarlo igualmente.»',
  '«Al\'ar resucita. Algunos jugadores tambien, pero tarda mas.»',
  '«Kael\'thas tiene cinco fases. Nosotros raramente pasamos de la segunda sin incidentes.»',
  '«Las estadisticas no mienten. Los logs, tampoco. Las excusas, siempre.»',
  '«El progreso se mide en wipes por semana. Esta banda tiene un ritmo de campeones.»',
  '«Morogrim manda murlocs. Esta banda ya tiene los suyos de serie.»',
  '«La diferencia entre un buen jugador y uno malo es el numero de muertes evitables. Y los logs lo saben.»',
  '«Fathom-Lord Karathress: cuatro bosses en uno. Esta raid, veintinueve problemas en uno.»',
  '«El interrupt que no llego a tiempo tiene nombre y apellidos. El log los recuerda.»',
  '«Aqui no hay jugadores malos. Solo mecanicas mal ejecutadas con elegancia.»',
  '«El roster cambia. La vergüenza acuatica, permanece.»',
  '«Solarian explota. Algunos compañeros han aprendido a explotar con ella.»',
  '«Las cuatro torres de TK no son el reto. El reto es que todo el mundo lea el chat.»',
  '«Un dispel a tiempo salva una vida. Un dispel a destiempo, crea anecdota.»',
  '«El primer muerto de la raid siempre tiene una buena razon. El log, otra.»',
  '«Esta banda ha demostrado que el agua tambien puede arder, metaforicamente.»',
  '«La efectividad de esta raid es directamente proporcional a los wipes de la semana anterior.»',
  '«Cinco fases de Kael. Solo necesitamos una para establecer un record de muertes.»',
  '«No hay mecanica dificil. Solo mecanicas que algunos descubren por primera vez cada semana.»',
];

function buildHeaderMeta() {
  const el = document.getElementById('header-meta');
  if (!el || !historial.length) return;
  const raids   = historial.reduce((s, e) => s + (e.reports?.length ?? 1), 0);
  const semanas = new Set(historial.map(e => e.semanaNum)).size;
  const last    = [...historial].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const lastDate = last ? fmtDate(last.fecha) : '—';
  const players  = getPlayers().length;
  el.innerHTML = `<span>${raids}</span> raid${raids !== 1 ? 's' : ''} registrada${raids !== 1 ? 's' : ''} en <span>${semanas}</span> semana${semanas !== 1 ? 's' : ''} · Última: <span>${lastDate}</span> · <span>${players}</span> jugadores en total`;
}

function buildCitaDelDia() {
  const today = new Date();
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const cita  = CITAS_F2[seed % CITAS_F2.length];
  const html  = `<div class="cita-del-dia"><span class="cita-ornament">— ✦ —</span><blockquote class="cita-text">${cita}</blockquote></div>`;
  const loaderEl  = document.getElementById('cita-del-dia-loader');
  const resumenEl = document.getElementById('cita-del-dia-resumen');
  if (loaderEl)  loaderEl.innerHTML  = html;
  if (resumenEl) resumenEl.innerHTML = html;
}

// ── Formateo ──────────────────────────────────────────────────────────────────
function fmtDmg(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(Math.round(n));
}

function fmtDate(fecha) {
  if (!fecha) return '?';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

function semanaDateRange(semanaStr) {
  // semanaStr is the opening Wednesday (YYYY-MM-DD); week ends on Tuesday (+6 days)
  const start = new Date(semanaStr + 'T00:00:00');
  const end   = new Date(semanaStr + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function fmtDur(ms) {
  if (!ms) return '0m';
  const totalMin = Math.round(ms / 60000);
  const h   = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function fmtDps(n) {
  if (!n) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
}

function fmtMs(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function _attachChartTooltips(container) {
  let tip = document.getElementById('prog-tooltip-global');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'prog-tooltip-global';
    tip.className = 'prog-tooltip';
    document.body.appendChild(tip);
  }
  container.querySelectorAll('.prog-pt').forEach(pt => {
    pt.addEventListener('mouseenter', () => { tip.textContent = pt.dataset.tip; tip.classList.add('visible'); });
    pt.addEventListener('mousemove', e => { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY - 36 + 'px'; });
    pt.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}

// ── Agregación ────────────────────────────────────────────────────────────────

function getSemanas() {
  const map = new Map();
  for (const e of historial) {
    if (!map.has(e.semanaNum)) {
      map.set(e.semanaNum, { semanaNum: e.semanaNum, semana: e.semana, entries: [] });
    }
    map.get(e.semanaNum).entries.push(e);
  }
  return [...map.values()].sort((a, b) => a.semanaNum - b.semanaNum);
}

function getBossProgress() {
  const bossMap = new Map();
  for (const boss of ALL_BOSSES) {
    bossMap.set(boss, { boss, kills: 0, wipes: 0, attempts: 0, firstKillFecha: null, lastKillFecha: null, firstKillSemana: null });
  }
  for (const entry of historial) {
    for (const b of (entry.bosses ?? [])) {
      if (!bossMap.has(b.boss)) {
        bossMap.set(b.boss, { boss: b.boss, kills: 0, wipes: 0, attempts: 0, firstKillFecha: null, lastKillFecha: null, firstKillSemana: null });
      }
      const p = bossMap.get(b.boss);
      p.attempts += b.attempts ?? 1;
      if (b.killed) {
        p.kills++;
        p.wipes += (b.attempts ?? 1) - 1; // wipes previos al kill
        if (!p.firstKillFecha || entry.fecha < p.firstKillFecha) {
          p.firstKillFecha = entry.fecha;
          p.firstKillSemana = entry.semanaNum;
        }
        if (!p.lastKillFecha || entry.fecha > p.lastKillFecha) {
          p.lastKillFecha = entry.fecha;
        }
      } else {
        p.wipes += b.attempts ?? 1;
      }
    }
  }
  return bossMap;
}

function getPlayers() {
  const players = new Set();
  for (const e of historial) {
    for (const name of (e.roster ?? [])) players.add(name);
  }
  return [...players].sort();
}

// Devuelve Map<name, Set<semanaNum>> — semanas asistidas por jugador.
function getSemanasPorJugador() {
  const map = new Map();
  for (const e of historial) {
    for (const name of (e.roster ?? [])) {
      if (!map.has(name)) map.set(name, new Set());
      map.get(name).add(e.semanaNum);
    }
  }
  return map;
}

// Muertes totales por jugador a lo largo de todo el historial.
function getDeathsByPlayer() {
  const map = new Map();
  for (const e of historial) {
    for (const d of (e.deathStats?.deaths ?? [])) {
      map.set(d.name, (map.get(d.name) ?? 0) + d.count);
    }
  }
  return map;
}

// Daño evitable total por jugador a lo largo de todo el historial.
function getAvoidByPlayer() {
  const map = new Map();
  for (const e of historial) {
    for (const b of (e.bosses ?? [])) {
      for (const m of (b.avoidableDamage ?? [])) {
        for (const p of m.players) {
          map.set(p.name, (map.get(p.name) ?? 0) + p.total);
        }
      }
    }
  }
  return map;
}

// Interrupts y dispels totales por jugador.
function getInterruptsByPlayer() {
  const map = new Map();
  for (const e of historial) {
    for (const d of (e.interrupts ?? [])) {
      map.set(d.name, (map.get(d.name) ?? 0) + d.total);
    }
  }
  return map;
}

function getDispelsByPlayer() {
  const map = new Map();
  for (const e of historial) {
    for (const d of (e.dispels ?? [])) {
      map.set(d.name, (map.get(d.name) ?? 0) + d.total);
    }
  }
  return map;
}

// Shame score normalizado por semanas asistidas.
// score = (pct_muertes + pct_evitables + pct_trolleos) / 3
// pct_trolleos = media de percentiles de mecánicas de trolleo (solo si hay datos)
// Solo jugadores con asistencia >= 30% de las semanas totales.
function getShameRanking() {
  const semanasMap  = getSemanasPorJugador();
  const totalSem    = new Set(historial.map(e => e.semanaNum)).size;
  const minSem      = Math.max(1, Math.ceil(totalSem * 0.3));
  const deathsMap   = getDeathsByPlayer();
  const avoidMap    = getAvoidByPlayer();

  // Mecánicas estrella
  const starAccum = [
    { key: 'demons',  boss: 'Leotheras',  field: 'innerDemons',        prop: 'mcCount'        },
    { key: 'wrath',   boss: 'Solarian',   field: 'wrathOfAstromancer', prop: 'damageToAllies' },
    { key: 'static',  boss: 'Vashj',      field: 'staticCharges',      prop: 'damageToAllies' },
  ];
  const starMaps = starAccum.map(s => ({ ...s, map: new Map() }));
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      for (const s of starMaps)
        if (b.boss === s.boss)
          for (const d of (b[s.field] ?? []))
            s.map.set(d.name, (s.map.get(d.name) ?? 0) + d[s.prop]);
  const activeStars = starMaps.filter(s => s.map.size > 0);

  const eligible = getPlayers().filter(n => (semanasMap.get(n)?.size ?? 0) >= minSem);
  if (eligible.length < 2) return [];

  const normalized = eligible.map(name => {
    const sem = semanasMap.get(name)?.size ?? 1;
    const obj = { name, semanas: sem, deathsPerSemana: (deathsMap.get(name) ?? 0) / sem, avoidPerSemana: (avoidMap.get(name) ?? 0) / sem };
    for (const s of activeStars) obj[s.key + 'PerSem'] = (s.map.get(name) ?? 0) / sem;
    return obj;
  });

  function percentileOf(arr, getValue, name) {
    const sorted = [...arr].sort((a, b) => getValue(b) - getValue(a));
    const n = sorted.length;
    if (n <= 1) return 0;
    const targetVal = getValue(arr.find(e => e.name === name));
    let first = sorted.findIndex(e => getValue(e) === targetVal);
    let last = first;
    while (last + 1 < n && getValue(sorted[last + 1]) === targetVal) last++;
    const avgIdx = (first + last) / 2;
    return (n - 1 - avgIdx) / (n - 1);
  }

  const demonsRaw = starMaps.find(s => s.key === 'demons')?.map ?? new Map();
  const wrathRaw  = starMaps.find(s => s.key === 'wrath')?.map  ?? new Map();
  const staticRaw = starMaps.find(s => s.key === 'static')?.map ?? new Map();
  const hasMc         = demonsRaw.size > 0;
  const hasDmgAllies  = wrathRaw.size > 0 || staticRaw.size > 0;

  return normalized
    .map(p => {
      const pct = fn => {
        const val = fn(normalized.find(e => e.name === p.name));
        return val <= 0 ? 0 : percentileOf(normalized, fn, p.name);
      };
      const components = [pct(e => e.deathsPerSemana), pct(e => e.avoidPerSemana)];
      let starPct = null;
      if (activeStars.length > 0) {
        starPct = activeStars.reduce((sum, s) => sum + pct(e => e[s.key + 'PerSem']), 0) / activeStars.length;
        components.push(starPct);
      }
      return {
        name:            p.name,
        semanas:         p.semanas,
        deathsPerSemana: p.deathsPerSemana,
        avoidPerSemana:  p.avoidPerSemana,
        starPct,
        mcCount:    hasMc        ? (demonsRaw.get(p.name) ?? 0) : null,
        dmgToAllies: hasDmgAllies ? ((wrathRaw.get(p.name) ?? 0) + (staticRaw.get(p.name) ?? 0)) : null,
        score:           components.reduce((s, v) => s + v, 0) / components.length,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Récords globales de biggestHits en todo el historial.
function getRecordsGlobales() {
  let biggestDealt    = null;
  let biggestHeal     = null;
  let biggestReceived = null;
  let bestMitig       = null;

  for (const e of historial) {
    const bh = e.biggestHits;
    if (bh) {
      if ((bh.biggestDealt?.amount ?? 0) > (biggestDealt?.amount ?? 0)) {
        biggestDealt = { ...bh.biggestDealt, fecha: e.fecha };
      }
      if ((bh.biggestHeal?.amount ?? 0) > (biggestHeal?.amount ?? 0)) {
        biggestHeal = { ...bh.biggestHeal, fecha: e.fecha };
      }
      if ((bh.biggestReceived?.amount ?? 0) > (biggestReceived?.amount ?? 0)) {
        biggestReceived = { ...bh.biggestReceived, fecha: e.fecha };
      }
    }
    for (const b of (e.bosses ?? [])) {
      for (const t of (b.tankMitigation ?? [])) {
        if (!bestMitig || t.pct > bestMitig.pct) {
          bestMitig = { ...t, bossName: BOSS_SHORT[b.boss] ?? b.boss, fecha: e.fecha };
        }
      }
    }
  }
  return { biggestDealt, biggestHeal, biggestReceived, bestMitig };
}

// Récord de kill más rápido por boss.
function getTimeRecords() {
  const records = new Map(); // boss → { killDurationMs, fecha, semanaNum }
  for (const e of historial) {
    for (const b of (e.bosses ?? [])) {
      if (!b.killed || !b.killDurationMs) continue;
      const prev = records.get(b.boss);
      if (!prev || b.killDurationMs < prev.killDurationMs) {
        records.set(b.boss, { killDurationMs: b.killDurationMs, fecha: b.fecha ?? e.fecha, semanaNum: e.semanaNum });
      }
    }
  }
  return records;
}

// Raid más rápida por instancia: suma de killDurationMs de todos los bosses kills en esa semana.
function getFastestRaid() {
  const semanas = getSemanas();
  let bestSsc = null, bestTk = null;
  for (const sem of semanas) {
    let sscMs = 0, tkMs = 0, sscKills = 0, tkKills = 0;
    const sscFechasSet = new Set(), tkFechasSet = new Set();
    for (const e of sem.entries) {
      const hasSSC = (e.bosses ?? []).some(b => SSC_BOSSES.includes(b.boss));
      const hasTK  = (e.bosses ?? []).some(b => TK_BOSSES.includes(b.boss));
      if (hasSSC) sscMs += e.sscDurationMs ?? 0;
      if (hasTK)  tkMs  += e.tkDurationMs  ?? 0;
      for (const b of (e.bosses ?? [])) {
        const bFecha = b.fecha ?? e.fecha;
        if (SSC_BOSSES.includes(b.boss)) { sscFechasSet.add(bFecha); if (b.killed) sscKills++; }
        if (TK_BOSSES.includes(b.boss))  { tkFechasSet.add(bFecha);  if (b.killed) tkKills++;  }
      }
    }
    const sscFechas = [...sscFechasSet].sort();
    const tkFechas  = [...tkFechasSet].sort();
    if (sscFechas.length && (!bestSsc || sscMs < bestSsc.totalMs)) {
      bestSsc = { totalMs: sscMs, semanaNum: sem.semanaNum, fechas: sscFechas, bossCount: sscKills };
    }
    if (tkFechas.length && (!bestTk || tkMs < bestTk.totalMs)) {
      bestTk = { totalMs: tkMs, semanaNum: sem.semanaNum, fechas: tkFechas, bossCount: tkKills };
    }
  }
  return { bestSsc, bestTk };
}

// Mejor DPS/HPS individual: el jugador con mayor DPS/HPS en cualquier boss kill.
function getBestPlayerDpsHps() {
  let bestDps = null, bestHps = null;
  for (const e of historial) {
    for (const b of (e.bosses ?? [])) {
      if (!b.killed) continue;
      for (const d of (b.dpsStats ?? [])) {
        if (d.topDps && (!bestDps || d.topDps.dps > bestDps.dps)) {
          bestDps = { name: d.topDps.name, dps: d.topDps.dps, boss: b.boss, fecha: e.fecha, semanaNum: e.semanaNum };
        }
        if (d.topHps && (!bestHps || d.topHps.hps > bestHps.hps)) {
          bestHps = { name: d.topHps.name, hps: d.topHps.hps, boss: b.boss, fecha: e.fecha, semanaNum: e.semanaNum };
        }
      }
    }
  }
  return { bestDps, bestHps };
}

// Mejor DPS/HPS de raid: semana con mayor DPS/HPS total de raid en boss kills.
function getBestRaidDpsHps() {
  let bestDps = null, bestHps = null;
  for (const e of historial) {
    let totalDmg = 0, totalHeal = 0, totalMs = 0;
    for (const b of (e.bosses ?? [])) {
      if (!b.killed) continue;
      for (const d of (b.dpsStats ?? [])) {
        totalDmg  += d.totalDmg  ?? 0;
        totalHeal += d.totalHeal ?? 0;
        totalMs   += d.durationMs ?? 0;
      }
    }
    if (totalMs === 0) continue;
    const raidDps = Math.round(totalDmg  / totalMs * 1000);
    const raidHps = Math.round(totalHeal / totalMs * 1000);
    if (raidDps > (bestDps?.dps ?? 0)) bestDps = { dps: raidDps, semanaNum: e.semanaNum };
    if (raidHps > (bestHps?.hps ?? 0)) bestHps = { hps: raidHps, semanaNum: e.semanaNum };
  }
  return { bestDps, bestHps };
}

// Datos agregados de una semana (para Por Semana tab).
function agregarSemana(entries) {
  let totalDeaths = 0, totalWipes = 0, totalDmg = 0, totalHeal = 0, totalDurMs = 0, totalRaidTime = 0;
  const bossMap = new Map();

  for (const e of entries) {
    totalRaidTime += e.reportDurationMs ?? 0;
    for (const d of (e.deathStats?.deaths ?? [])) totalDeaths += d.count;

    for (const b of (e.bosses ?? [])) {
      const prev = bossMap.get(b.boss) ?? { raid: b.raid, killed: false, attempts: 0 };
      bossMap.set(b.boss, {
        raid:     b.raid,
        killed:   prev.killed || b.killed,
        attempts: prev.attempts + (b.attempts ?? 1),
      });
      totalWipes += (b.attempts ?? 1) - (b.killed ? 1 : 0);
      for (const d of (b.dpsStats ?? [])) {
        totalDmg   += d.totalDmg   ?? 0;
        totalHeal  += d.totalHeal  ?? 0;
        totalDurMs += d.durationMs ?? 0;
      }
    }
  }

  return {
    totalDeaths,
    totalWipes,
    totalRaidTime,
    dps:    totalDurMs > 0 ? Math.round(totalDmg  / totalDurMs * 1000) : null,
    hps:    totalDurMs > 0 ? Math.round(totalHeal / totalDurMs * 1000) : null,
    bosses: [...bossMap.entries()].map(([boss, d]) => ({ boss, ...d })),
    notasSemana: entries[0]?.notasSemana ?? null,
  };
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const rendered = new Set();
let TITULOS_F2 = null;         // populated when renderLogros runs
let _mimadoTituloF2 = null;    // populated when loot sheet loads
let _pendingReportCode = null; // for navigateToPorSemana

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
  if (!rendered.has(tab)) {
    rendered.add(tab);
    renderTab(tab);
  }
  location.hash = tab;
}

function renderTab(tab) {
  switch (tab) {
    case 'resumen':       renderResumen();      break;
    case 'progresion':    renderProgresion();   break;
    case 'mecanicas':     renderMecanicas();    break;
    case 'verguenza':     renderVerguenza();    break;
    case 'logros':        renderLogros();       break;
    case 'por-semana':    renderPorSemana();    break;
    case 'historial':     renderHistorialTab(); break;
    case 'jugador':       break; // search input is static HTML
    case 'cla':           renderCLA();          break;
    case 'performance':   renderPerformance();  break;
    case 'loot-resumen':  fetchLootData();      break;
    case 'loot-registro': fetchLootData();      break;
  }
}

// ── RESUMEN ───────────────────────────────────────────────────────────────────
function renderResumen() {
  const bossProgress         = getBossProgress();
  const semanas              = getSemanas();
  const records              = getRecordsGlobales();
  const shame                = getShameRanking();
  const deathsMap            = getDeathsByPlayer();
  const intMap               = getInterruptsByPlayer();
  const dispMap              = getDispelsByPlayer();
  const { bestDps, bestHps }         = getBestPlayerDpsHps();
  const { bestDps: bestRaidDps, bestHps: bestRaidHps } = getBestRaidDpsHps();

  const totalKills    = [...bossProgress.values()].reduce((s, b) => s + b.kills, 0);
  const totalWipes    = [...bossProgress.values()].reduce((s, b) => s + b.wipes, 0);
  const totalAttempts = totalKills + totalWipes;
  const efectividad   = totalAttempts > 0 ? Math.round(totalKills / totalAttempts * 100) : 0;

  // ── Stat cards — igual que F1 ──
  const effColor = efectividad >= 80 ? 'var(--gold)' : efectividad >= 50 ? 'var(--purple2)' : 'var(--red2)';
  const statsHtml = `
    <div class="stat-cards">
      <div class="stat-card">
        <div class="label">Boss Kills</div>
        <div class="value">${totalKills}</div>
        <div class="sub">${totalWipes} wipes · ${totalAttempts} intentos totales</div>
      </div>
      <div class="stat-card">
        <div class="label">Efectividad Global</div>
        <div class="value" style="color:${effColor}">${totalAttempts > 0 ? efectividad + '%' : '—'}</div>
        <div class="sub">kills / (kills + wipes)</div>
      </div>
      <div class="stat-card">
        <div class="label">Mejor DPS de Raid</div>
        <div class="value" style="color:#7ec8e3">${bestRaidDps ? fmtDps(bestRaidDps.dps) : '—'}</div>
        <div class="sub">${bestRaidDps ? `Semana ${bestRaidDps.semanaNum}` : 'Sin datos'}</div>
      </div>
      <div class="stat-card">
        <div class="label">Mejor HPS de Raid</div>
        <div class="value" style="color:#4ec97e">${bestRaidHps ? fmtDps(bestRaidHps.hps) : '—'}</div>
        <div class="sub">${bestRaidHps ? `Semana ${bestRaidHps.semanaNum}` : 'Sin datos'}</div>
      </div>
    </div>`;

  // ── 4 Podiums (mismas clases que F1) ──
  const top3Shame  = shame.slice(0, 3);
  const top3Deaths = [...deathsMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top3Int    = [...intMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top3Disp   = [...dispMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  function podiumCard(title, rows, honor = false) {
    const entries = rows.length > 0
      ? rows.map(([name, val], i) => `
          <div class="podium-entry">
            <span class="medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
            <span class="podium-name clickable-player" data-player="${name}">${name}</span>
            <span class="podium-val">${val}</span>
          </div>`).join('')
      : '<div class="td-dim" style="font-size:.82rem;padding:.5rem 0">Sin datos</div>';
    return `<div class="podium-card${honor ? ' podium-card--honor' : ''}">
      <div class="podium-title">${title}</div>
      ${entries}
    </div>`;
  }

  const podiumsHtml = `
    <div class="podiums-grid">
      ${podiumCard('Vergüenza General', top3Shame.map(p => [p.name, (p.score * 100).toFixed(0) + '%']))}
      ${podiumCard('Más Muertes',       top3Deaths.map(([n, v]) => [n, String(v)]))}
      ${podiumCard('Top Interrupts',    top3Int.map(([n, v]) => [n, String(v)]), true)}
      ${podiumCard('Top Dispels',       top3Disp.map(([n, v]) => [n, String(v)]), true)}
    </div>`;

  // ── Récords de Tiempo (mismo estilo que F1) ──
  const timeRec = getTimeRecords();
  function fmtKillMs(ms) {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s % 60}s`;
  }
  function timeCard(icon, label, ms, semanaNum, fecha) {
    return `<div class="record-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount">${fmtKillMs(ms)}</div>
      <div class="record-date">Sem ${semanaNum} · ${fmtDate(fecha)}</div>
    </div>`;
  }
  const { bestSsc, bestTk } = getFastestRaid();
  function fmtRaidMs(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return h > 0 ? `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
                 : `${m}m ${String(s).padStart(2,'0')}s`;
  }
  function fastestCard(raidLabel, badgeClass, best, totalBosses) {
    if (!best) return `<div class="record-card" style="opacity:0.4">
      <div class="record-icon"><span class="raid-badge ${badgeClass}">${raidLabel}</span></div>
      <div class="record-label">Raid más rápida</div>
      <div class="record-amount" style="color:var(--text-dim)">—</div>
    </div>`;
    const allClear = best.bossCount === totalBosses;
    const datesStr = best.fechas.map(f => fmtDate(f)).join(' y ');
    return `<div class="record-card">
      <div class="record-icon"><span class="raid-badge ${badgeClass}">${raidLabel}</span></div>
      <div class="record-label">Raid más rápida</div>
      <div class="record-amount">${fmtRaidMs(best.totalMs)}</div>
      <div class="record-date">Sem ${best.semanaNum} · ${datesStr}</div>
      <div class="record-date" style="opacity:0.7">${best.bossCount}/${totalBosses} jefes${allClear ? ' ✓' : ''}</div>
    </div>`;
  }
  const fastestRaidHtml = `
    <div class="section-title" style="margin-top:2rem">Raid más Rápida</div>
    <div class="records-grid" style="grid-template-columns:repeat(2,1fr)">
      ${fastestCard('SSC', 'ssc', bestSsc, SSC_BOSSES.length)}
      ${fastestCard('TK',  'tk',  bestTk,  TK_BOSSES.length)}
    </div>`;

  const sscTimeCards = SSC_BOSSES.map(boss => {
    const r = timeRec.get(boss);
    return r
      ? timeCard(BOSS_ICONS[boss] ?? '', BOSS_DISPLAY[boss] ?? boss, r.killDurationMs, r.semanaNum, r.fecha)
      : `<div class="record-card" style="opacity:0.35"><div class="record-icon">${BOSS_ICONS[boss] ?? ''}</div><div class="record-label">${BOSS_DISPLAY[boss] ?? boss}</div><div class="record-amount" style="color:var(--text-dim)">—</div></div>`;
  }).join('');
  const tkTimeCards = TK_BOSSES.map(boss => {
    const r = timeRec.get(boss);
    return r
      ? timeCard(BOSS_ICONS[boss] ?? '', BOSS_DISPLAY[boss] ?? boss, r.killDurationMs, r.semanaNum, r.fecha)
      : `<div class="record-card" style="opacity:0.35"><div class="record-icon">${BOSS_ICONS[boss] ?? ''}</div><div class="record-label">${BOSS_DISPLAY[boss] ?? boss}</div><div class="record-amount" style="color:var(--text-dim)">—</div></div>`;
  }).join('');
  const timeRecordsHtml = `
    <div class="section-title" style="margin-top:2rem">Récords de Tiempo</div>
    <div style="margin-bottom:0.5rem"><span class="raid-badge ssc">SSC</span></div>
    <div class="records-grid" style="margin-bottom:1rem">${sscTimeCards}</div>
    <div style="margin-bottom:0.5rem"><span class="raid-badge tk">TK</span></div>
    <div class="records-grid">${tkTimeCards}</div>`;

  // ── Récords Históricos — 6 cards en 2 filas de 3, igual que F1 ──
  const { biggestDealt, biggestHeal, biggestReceived } = records;

  function perfCard(icon, label, rec, statKey, unit) {
    if (!rec) return `<div class="record-card"><div class="record-icon">${icon}</div><div class="record-label">${label}</div><div class="record-amount" style="color:var(--text-dim)">Sin datos</div></div>`;
    return `<div class="record-card night-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount">${fmtDps(rec[statKey])} ${unit}</div>
      <div class="record-who"><span class="clickable-player" data-player="${rec.name}">${rec.name}</span></div>
      <div class="record-ability">${BOSS_DISPLAY[rec.boss] ?? rec.boss}</div>
      <div class="record-date">${fmtDate(rec.fecha)}</div>
    </div>`;
  }
  function recCard(icon, label, rec, nameFn, targetFn) {
    if (!rec) return `<div class="record-card"><div class="record-icon">${icon}</div><div class="record-label">${label}</div><div class="record-amount" style="color:var(--text-dim)">Sin datos</div></div>`;
    return `<div class="record-card night-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount">${fmtDmg(rec.amount)}</div>
      <div class="record-who">
        <span class="clickable-player" data-player="${nameFn(rec)}">${nameFn(rec)}</span>
        → <span class="clickable-player" data-player="${targetFn(rec)}">${targetFn(rec)}</span>
      </div>
      ${rec.ability ? `<div class="record-ability">${rec.ability}</div>` : ''}
      <div class="record-date">${fmtDate(rec.fecha)}</div>
    </div>`;
  }
  const recordsHtml = `
    <div class="section-title" style="margin-top:2rem">Récords Históricos</div>
    <div class="records-grid" style="grid-template-columns:repeat(3,1fr)">
      ${perfCard('⚔️', 'Mayor DPS',      bestDps,  'dps', 'DPS')}
      ${perfCard('💚', 'Mayor HPS',      bestHps,  'hps', 'HPS')}
      ${records.bestMitig
        ? `<div class="record-card night-card">
            <div class="record-icon">🛡️</div>
            <div class="record-label">Mayor Mitigación en un Boss</div>
            <div class="record-amount">${records.bestMitig.pct}%</div>
            <div class="record-who"><span class="clickable-player" data-player="${records.bestMitig.name}">${records.bestMitig.name}</span></div>
            <div class="record-ability">${records.bestMitig.bossName}</div>
            <div class="record-date">${fmtDate(records.bestMitig.fecha)}</div>
          </div>`
        : `<div class="record-card"><div class="record-icon">🛡️</div><div class="record-label">Mayor Mitigación en un Boss</div><div class="record-amount" style="color:var(--text-dim)">Sin datos</div></div>`
      }
      ${recCard('💥', 'Golpe más fuerte',        biggestDealt,    r => r.heroe,   r => r.objetivo)}
      ${recCard('💞', 'Curación más gorda',       biggestHeal,     r => r.healer,  r => r.target)}
      ${recCard('💀', 'Golpe más bestia recibido',biggestReceived, r => r.agresor, r => r.victima)}
    </div>`;

  document.getElementById('tab-resumen').innerHTML =
    statsHtml + podiumsHtml + fastestRaidHtml + timeRecordsHtml + recordsHtml +
    '<div id="cita-del-dia-resumen"></div>';
  attachPlayerClicks('#tab-resumen');
  buildCitaDelDia();
}

// ── CHART HELPERS ─────────────────────────────────────────────────────────────
const DPS_COLOR  = '#7ec8e3';
const HPS_COLOR  = '#4ec97e';
const SSC_COLORS = ['#29b6f6','#00e5ff','#26a69a','#42a5f5','#ef5350','#66bb6a'];
const TK_COLORS  = ['#7e57c2','#fdd835','#ff7043','#f06292'];

function progLegend(labels, colors) {
  return `<div class="prog-legend">${labels.map((l, i) =>
    `<span class="prog-legend-item"><span class="prog-legend-dot" style="background:${colors[i]}"></span>${l}</span>`
  ).join('')}</div>`;
}

function drawLineChart(xLabels, series, yFormat, yMaxOverride) {
  const W = 800, H = 240;
  const pad = { top: 20, right: 20, bottom: 44, left: 64 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const n = xLabels.length;
  const allVals = series.flatMap(s => s.values.filter(v => v != null));
  if (!allVals.length) return '<p class="section-note">Sin datos suficientes.</p>';
  const yMax    = yMaxOverride ?? Math.max(...allVals);
  const yBottom = yMaxOverride != null ? 0 : Math.max(0, Math.min(...allVals) * 0.8);
  const yRange  = yMax - yBottom || 1;
  const xPos = i => pad.left + (n <= 1 ? cW / 2 : (i * cW) / (n - 1));
  const yPos = v => pad.top + cH - ((v - yBottom) / yRange) * cH;
  let grid = '', yAxis = '';
  for (let g = 0; g <= 4; g++) {
    const v = yBottom + (yRange * g) / 4, y = yPos(v);
    grid  += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#2e3550" stroke-width="1"/>`;
    yAxis += `<text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#a0aabc" font-size="11">${yFormat(v)}</text>`;
  }
  let xAxis = '';
  xLabels.forEach((l, i) => {
    xAxis += `<text x="${xPos(i).toFixed(1)}" y="${H - pad.bottom + 16}" text-anchor="middle" fill="#a0aabc" font-size="11">${l}</text>`;
  });
  let svg = '';
  series.forEach(s => {
    let d = '', started = false;
    s.values.forEach((v, i) => {
      if (v == null) { started = false; return; }
      const x = xPos(i).toFixed(1), y = yPos(v).toFixed(1);
      d += started ? ` L${x},${y}` : `M${x},${y}`; started = true;
    });
    if (d) svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`;
    s.values.forEach((v, i) => {
      if (v == null) return;
      const x = xPos(i).toFixed(1), y = yPos(v).toFixed(1);
      const tip = s.label ? `${xLabels[i]} · ${s.label}: ${yFormat(v)}` : `${xLabels[i]}: ${yFormat(v)}`;
      svg += `<circle cx="${x}" cy="${y}" r="5" fill="${s.color}" stroke="#0f1117" stroke-width="2" class="prog-pt" data-tip="${tip}"/>`;
    });
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="prog-svg">${grid}<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="#2e3550" stroke-width="1"/>${yAxis}${xAxis}${svg}</svg>`;
}

function drawStackedBar(xLabels, series) {
  const W = 800, H = 240;
  const pad = { top: 20, right: 20, bottom: 44, left: 40 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const n = xLabels.length;
  const totals  = xLabels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0));
  const yMax    = Math.max(...totals, 1);
  const gridMax = yMax <= 4 ? yMax : Math.ceil(yMax / Math.ceil(yMax / 4)) * Math.ceil(yMax / 4);
  const gridStep = gridMax <= 4 ? 1 : Math.ceil(gridMax / 4);
  const barSlot = cW / n, barW = Math.min(barSlot * 0.55, 60);
  const xCenter = i => pad.left + i * barSlot + barSlot / 2;
  const yPos = v => pad.top + cH - (v / (gridMax || 1)) * cH;
  const barH = v => (v / (gridMax || 1)) * cH;
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
      const v = s.values[i] ?? 0; if (v <= 0) return;
      const h = barH(v); stackY -= h;
      bars += `<rect x="${(xCenter(i) - barW / 2).toFixed(1)}" y="${stackY.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${s.color}" opacity="0.85" rx="2" class="prog-pt" data-tip="${label} · ${s.label}: ${v} wipe${v !== 1 ? 's' : ''}"/>`;
    });
    const total = totals[i];
    if (total > 0) bars += `<text x="${xCenter(i).toFixed(1)}" y="${(yPos(total) - 5).toFixed(1)}" text-anchor="middle" fill="#a0aabc" font-size="11">${total}</text>`;
    xAxis += `<text x="${xCenter(i).toFixed(1)}" y="${H - pad.bottom + 16}" text-anchor="middle" fill="#a0aabc" font-size="11">${label}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="prog-svg">${grid}<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${H - pad.bottom}" stroke="#2e3550" stroke-width="1"/>${yAxis}${bars}${xAxis}</svg>`;
}

// ── PROGRESION ────────────────────────────────────────────────────────────────

// Color index per boss (SSC first, then TK)
function bossColor(bossName) {
  const i = ALL_BOSSES.indexOf(bossName);
  if (i < 0) return 'var(--text-bright)';
  return i < SSC_BOSSES.length ? SSC_COLORS[i] : TK_COLORS[i - SSC_BOSSES.length];
}

function buildProgDpsHpsTable(aggSemanas, xLabels) {
  // Collect bosses that had at least one kill
  const killedBosses = [];
  for (const boss of ALL_BOSSES) {
    const hasKill = aggSemanas.some(s => s.entries.some(e => (e.bosses ?? []).some(b => b.boss === boss && b.killed)));
    if (hasKill) killedBosses.push(boss);
  }
  if (!killedBosses.length) return '';

  const BOSS_VAL_COLOR = 'var(--text-dim)';
  const MEDIA_COLOR    = 'var(--gold)';

  // Per-semana, per-boss DPS/HPS
  const semanaStats = aggSemanas.map(s => {
    const bossDps = {};
    for (const e of s.entries) {
      for (const b of (e.bosses ?? [])) {
        if (!b.killed) continue;
        let dmg = 0, heal = 0, ms = 0;
        for (const d of (b.dpsStats ?? [])) { dmg += d.totalDmg ?? 0; heal += d.totalHeal ?? 0; ms += d.durationMs ?? 0; }
        if (ms > 0) bossDps[b.boss] = { dps: Math.round(dmg / ms * 1000), hps: Math.round(heal / ms * 1000) };
      }
    }
    let totalDmg = 0, totalHeal = 0, totalMs = 0;
    for (const e of s.entries)
      for (const b of (e.bosses ?? [])) {
        if (!b.killed) continue;
        for (const d of (b.dpsStats ?? [])) { totalDmg += d.totalDmg ?? 0; totalHeal += d.totalHeal ?? 0; totalMs += d.durationMs ?? 0; }
      }
    const total = totalMs > 0 ? { dps: Math.round(totalDmg / totalMs * 1000), hps: Math.round(totalHeal / totalMs * 1000) } : null;
    return { bossDps, total };
  });

  const bossHeaders = killedBosses.map(b => `<th style="color:${bossColor(b)}">${BOSS_SHORT[b] ?? b}</th>`).join('');

  const makeTable = (title, color, valFn) => {
    const rows = aggSemanas.map((s, i) => {
      const st = semanaStats[i];
      const cells = killedBosses.map(b => {
        const v = st.bossDps[b] ? valFn(st.bossDps[b]) : null;
        return v != null ? `<td class="val-cell" style="color:${BOSS_VAL_COLOR};white-space:nowrap">${fmtDmg(v)}</td>` : `<td class="td-dim">—</td>`;
      }).join('');
      const tot = st.total ? fmtDmg(valFn(st.total)) : '—';
      return `<tr><td class="td-dim" style="white-space:nowrap">${xLabels[i]}</td>${cells}<td class="val-cell" style="color:${MEDIA_COLOR};font-weight:600;white-space:nowrap">${tot}</td></tr>`;
    }).join('');
    return `<div style="margin-bottom:1.5rem">
      <div style="font-size:.8rem;font-weight:600;color:${color};letter-spacing:.06em;text-transform:uppercase;margin-bottom:.4rem">${title}</div>
      <table class="ranked-list" style="width:100%;table-layout:fixed">
        <thead><tr>
          <th style="width:90px">Semana</th>
          ${killedBosses.map(b => `<th style="color:${bossColor(b)};white-space:nowrap">${BOSS_ABBR[b] ?? b}</th>`).join('')}
          <th style="color:${MEDIA_COLOR};width:70px">Media</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  };

  return `
    <div class="section-title" style="margin-top:2rem">DPS y HPS por Semana</div>
    ${makeTable('DPS', DPS_COLOR, s => s.dps)}
    ${makeTable('HPS', HPS_COLOR, s => s.hps)}`;
}

function renderProgresion() {
  const semanas = getSemanas();
  const el = document.getElementById('tab-progresion');
  if (semanas.length === 0) {
    el.innerHTML = '<p class="empty-msg">No hay semanas registradas aun.</p>';
    return;
  }

  const aggSemanas = semanas.map(s => ({ ...s, agg: agregarSemana(s.entries) }));
  const xLabels    = aggSemanas.map(s => `Semana ${s.semanaNum}`);

  // ── Wipes por boss (incluyendo intentos antes del kill) ──
  const wipesByBoss   = new Map();
  const fastestKillMs = new Map(); // kill más rápido por boss (desempate)
  for (const e of historial) {
    for (const b of (e.bosses ?? [])) {
      const w = (b.attempts ?? 1) - (b.killed ? 1 : 0);
      wipesByBoss.set(b.boss, (wipesByBoss.get(b.boss) ?? 0) + w);
      if (b.killed && b.killDurationMs != null) {
        const prev = fastestKillMs.get(b.boss) ?? Infinity;
        if (b.killDurationMs < prev) fastestKillMs.set(b.boss, b.killDurationMs);
      }
    }
  }
  const sortedByWipes  = [...wipesByBoss.entries()].sort((a, b) => b[1] - a[1]);
  const [worstBossName, worstBossWipes] = sortedByWipes[0] ?? [null, 0];
  // desempate en 0 wipes: el que se mató más rápido
  const sortedBest = [...wipesByBoss.entries()].sort((a, b) => {
    if (a[1] !== b[1]) return a[1] - b[1];
    return (fastestKillMs.get(a[0]) ?? Infinity) - (fastestKillMs.get(b[0]) ?? Infinity);
  });
  const [bestBossName, bestBossWipes] = sortedBest[0] ?? [null, 0];
  const worstColor = worstBossName ? bossColor(worstBossName) : 'var(--text-bright)';
  const bestColor  = bestBossName  ? bossColor(bestBossName)  : 'var(--text-bright)';

  // ── Stat cards ──
  const wipesBySem  = aggSemanas.map(s => s.agg.totalWipes);
  const cleanestIdx = wipesBySem.indexOf(Math.min(...wipesBySem));
  const chaosIdx    = wipesBySem.indexOf(Math.max(...wipesBySem));
  const statsHtml   = `<div class="stat-cards" style="margin-bottom:2rem">
    <div class="stat-card"><div class="label">Semana más Limpia</div><div class="value" style="font-size:1.4rem">Semana ${semanas[cleanestIdx].semanaNum}</div><div class="sub">${wipesBySem[cleanestIdx] === 0 ? 'Sin wipes' : wipesBySem[cleanestIdx] + ' wipes'}</div></div>
    <div class="stat-card"><div class="label">Semana más Caótica</div><div class="value" style="color:var(--red2);font-size:1.4rem">Semana ${semanas[chaosIdx].semanaNum}</div><div class="sub">${wipesBySem[chaosIdx]} wipe${wipesBySem[chaosIdx] !== 1 ? 's' : ''}</div></div>
    <div class="stat-card"><div class="label">Boss más Problemático</div><div class="value" style="color:${worstColor};font-size:1.4rem">${worstBossName ? (BOSS_SHORT[worstBossName] ?? worstBossName) : '—'}</div><div class="sub">${worstBossWipes} wipe${worstBossWipes !== 1 ? 's' : ''} acumulados</div></div>
    <div class="stat-card"><div class="label">Boss menos Problemático</div><div class="value" style="color:${bestColor};font-size:1.4rem">${bestBossName ? (BOSS_SHORT[bestBossName] ?? bestBossName) : '—'}</div><div class="sub">${bestBossWipes === 0 && fastestKillMs.has(bestBossName) ? `0 wipes · kill en ${fmtDur(fastestKillMs.get(bestBossName))}` : `${bestBossWipes} wipe${bestBossWipes !== 1 ? 's' : ''} acumulados`}</div></div>
  </div>`;

  // ── Chart 1: Duración de Raid ──
  const raidTimeSeries = [{ label: '', color: '#f0c84a', values: aggSemanas.map(s => s.agg.totalRaidTime > 0 ? s.agg.totalRaidTime / 60000 : null) }];

  // ── Chart 2: Kill time por boss ──
  const killTimeSeries = ALL_BOSSES.map((boss, i) => ({
    label: BOSS_SHORT[boss] ?? boss,
    color: bossColor(boss),
    values: aggSemanas.map(s => {
      let best = null;
      for (const e of s.entries)
        for (const b of (e.bosses ?? []))
          if (b.boss === boss && b.killed && b.killDurationMs)
            if (!best || b.killDurationMs < best) best = b.killDurationMs;
      return best;
    }),
  })).filter(s => s.values.some(v => v != null));

  // ── Chart 3: DPS y HPS ──
  const dpsSeries = [
    { label: 'DPS', color: DPS_COLOR, values: aggSemanas.map(s => s.agg.dps) },
    { label: 'HPS', color: HPS_COLOR, values: aggSemanas.map(s => s.agg.hps) },
  ];

  // ── Chart 4: Daño Evitable Total ──
  const avoidSeries = [{
    label: 'Daño evitable', color: 'var(--red2)',
    values: aggSemanas.map(s => {
      let total = 0;
      for (const e of s.entries)
        for (const b of (e.bosses ?? []))
          for (const m of (b.avoidableDamage ?? []))
            for (const p of m.players) total += p.total;
      return total || null;
    }),
  }];

  // ── Chart 5: Wipes por Semana (stacked bar) ──
  const bossWipeSeries = ALL_BOSSES.map(boss => ({
    label: BOSS_SHORT[boss] ?? boss,
    color: bossColor(boss),
    values: aggSemanas.map(s => {
      let w = 0;
      for (const e of s.entries)
        for (const b of (e.bosses ?? []))
          if (b.boss === boss) w += (b.attempts ?? 1) - (b.killed ? 1 : 0);
      return w;
    }),
  })).filter(s => s.values.some(v => v > 0));

  // ── Tabla: Wipes Acumulados por Boss ──
  const bossRows = ALL_BOSSES.map(boss => {
    const totalW    = wipesByBoss.get(boss) ?? 0;
    const attempted = historial.filter(e => (e.bosses ?? []).some(b => b.boss === boss)).length;
    const cleanSem  = semanas.filter(s => s.entries.some(e => (e.bosses ?? []).some(b => b.boss === boss && (b.attempts ?? 1) - (b.killed ? 1 : 0) === 0))).length;
    if (!attempted) return '';
    const color = bossColor(boss);
    return `<tr>
      <td style="color:${color};font-weight:600">${BOSS_SHORT[boss] ?? boss}</td>
      <td class="val-cell" style="color:var(--red2)">${totalW}</td>
      <td class="td-dim">${attempted}</td>
      <td class="td-dim">${cleanSem} / ${attempted}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    ${statsHtml}
    <div class="prog-chart">
      <div class="prog-chart-title">Duración de Raid</div>
      <div class="prog-chart-note">Tiempo total de cada semana de raid en minutos</div>
      ${drawLineChart(xLabels, raidTimeSeries, v => Math.round(v) + 'min')}
    </div>
    ${killTimeSeries.length > 0 ? `
    <div class="prog-chart">
      <div class="prog-chart-title">Tiempo de Kill por Boss</div>
      ${drawLineChart(xLabels, killTimeSeries, v => fmtDur(v))}
      ${progLegend(killTimeSeries.map(s => s.label), killTimeSeries.map(s => s.color))}
    </div>` : ''}
    <div class="prog-chart">
      <div class="prog-chart-title">DPS y HPS por Semana</div>
      <div class="prog-chart-note">Media ponderada de kills (daño/cura total ÷ duración total de fights)</div>
      ${drawLineChart(xLabels, dpsSeries, v => fmtDmg(Math.round(v)))}
      ${progLegend(['DPS', 'HPS'], [DPS_COLOR, HPS_COLOR])}
    </div>
    ${avoidSeries[0].values.some(v => v != null) ? `
    <div class="prog-chart">
      <div class="prog-chart-title">Daño Evitable Total por Semana</div>
      <div class="prog-chart-note">Suma de todo el daño recibido de mecánicas evitables en cada semana</div>
      ${drawLineChart(xLabels, avoidSeries, v => fmtDmg(Math.round(v)))}
    </div>` : ''}
    ${bossWipeSeries.length > 0 ? `
    <div class="prog-chart">
      <div class="prog-chart-title">Wipes por Semana</div>
      <div class="prog-chart-note">Barras apiladas por boss. El número sobre la barra es el total de wipes de esa semana.</div>
      ${drawStackedBar(xLabels, bossWipeSeries)}
      ${progLegend(bossWipeSeries.map(s => s.label), bossWipeSeries.map(s => s.color))}
    </div>` : ''}
    ${buildProgDpsHpsTable(aggSemanas, xLabels)}
    <div class="section-title">Wipes Acumulados por Boss</div>
    <table class="ranked-list" style="max-width:480px;margin-bottom:2rem">
      <thead><tr><th>Boss</th><th>Wipes</th><th>Sesiones intentadas</th><th>Sesiones sin wipe</th></tr></thead>
      <tbody>${bossRows}</tbody>
    </table>
    <div id="prog-tooltip" class="prog-tooltip"></div>`;

  const tip = el.querySelector('#prog-tooltip');
  el.querySelectorAll('.prog-pt').forEach(pt => {
    pt.addEventListener('mouseenter', () => { tip.textContent = pt.dataset.tip; tip.classList.add('visible'); });
    pt.addEventListener('mousemove', e => { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY - 36 + 'px'; });
    pt.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}

// ── MECANICAS ─────────────────────────────────────────────────────────────────
function renderMecanicas() {
  const semanasMap  = getSemanasPorJugador();
  const totalSem    = new Set(historial.map(e => e.semanaNum)).size;
  const minSem      = Math.max(1, Math.ceil(totalSem * 0.3));
  const intMap      = getInterruptsByPlayer();
  const dispMap     = getDispelsByPlayer();

  const raidCountMap = new Map();
  for (const e of historial) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    const hasCla = codes.some(c => e.claReports?.[c]);
    if (hasCla) {
      for (const code of codes)
        for (const name of Object.keys(e.claReports?.[code]?.jugadores ?? {}))
          raidCountMap.set(name, (raidCountMap.get(name) ?? 0) + 1);
    } else {
      for (const name of (e.roster ?? []))
        raidCountMap.set(name, (raidCountMap.get(name) ?? 0) + codes.length);
    }
  }

  const mkRows = (map) => {
    const arr = [...map.entries()]
      .filter(([n]) => (semanasMap.get(n)?.size ?? 0) >= minSem)
      .map(([name, total]) => ({ name, total, raids: raidCountMap.get(name) ?? 1 }))
      .sort((a, b) => b.total - a.total);
    if (!arr.length) return '<tr><td colspan="5" class="empty-msg">Sin datos</td></tr>';
    const maxV = arr[0].total;
    return arr.map((e, i) => `<tr>
      <td class="rank-num">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)}</td>
      <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
      <td class="bar-cell">${makeBar(Math.round((e.total / maxV) * 100))}</td>
      <td class="val-cell purple">${e.total}</td>
      <td class="td-dim">${e.raids}</td>
    </tr>`).join('');
  };

  document.getElementById('tab-mecanicas').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem">
      <div>
        <div class="section-title">Interrupts</div>
        <table class="ranked-list">
          <thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Total</th><th>Raids</th></tr></thead>
          <tbody>${mkRows(intMap)}</tbody>
        </table>
      </div>
      <div>
        <div class="section-title">Dispels</div>
        <table class="ranked-list">
          <thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Total</th><th>Raids</th></tr></thead>
          <tbody>${mkRows(dispMap)}</tbody>
        </table>
      </div>
    </div>`;
  attachPlayerClicks('#tab-mecanicas');
}

function renderSimpleRanking(arr, valueKey, label, fmt) {
  return `<div class="ranking-list">
    ${arr.map((p, i) => `
      <div class="ranking-row">
        <span class="rank-pos">${i + 1}</span>
        <span class="rank-name clickable-player" data-player="${p.name}">${p.name}</span>
        <span class="rank-value">${fmt(p[valueKey])} ${label}</span>
      </div>`).join('')}
  </div>`;
}

// ── VERGUENZA ─────────────────────────────────────────────────────────────────
function renderVerguenza() {
  const ranking    = getShameRanking();
  const totalSem   = new Set(historial.map(e => e.semanaNum)).size;
  const minSem     = Math.max(1, Math.ceil(totalSem * 0.3));
  const semanasMap = getSemanasPorJugador();

  // Raid count per player — individual WCL report codes
  const rcMap = new Map();
  for (const e of historial) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    const hasCla = codes.some(c => e.claReports?.[c]);
    if (hasCla) {
      for (const code of codes) {
        for (const name of Object.keys(e.claReports?.[code]?.jugadores ?? {}))
          rcMap.set(name, (rcMap.get(name) ?? 0) + 1);
      }
    } else {
      for (const name of (e.roster ?? []))
        rcMap.set(name, (rcMap.get(name) ?? 0) + codes.length);
    }
  }

  // Sub-tab: Vergüenza
  const shameHtml = ranking.length === 0
    ? `<p class="empty-msg">No hay suficientes datos (minimo ${minSem} semana${minSem !== 1 ? 's' : ''}).</p>`
    : `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:1rem 1.2rem;margin-bottom:1.2rem;font-size:0.85rem;color:var(--text-dim);line-height:1.6">
        <strong style="color:var(--text-bright)">¿Cómo se calcula?</strong><br>
        Por cada semana, a cada jugador se le asigna un percentil en tres categorías:
        <strong style="color:var(--red2)">muertes</strong>,
        <strong style="color:var(--red2)">daño recibido de mecánicas evitables</strong> y
        <strong style="color:var(--red2)">trolleos a la raid</strong> (mecánicas donde jodes a tus compañeros, ver pestaña Trolleos).
        El percentil indica qué porcentaje de compañeros tuvo un resultado mejor que el tuyo
        (0% = el menos vergonzoso, 100% = el peor).
        La puntuación final es la media de esos percentiles sobre todas las semanas asistidas.
        Solo jugadores con al menos ${minSem} semana${minSem !== 1 ? 's' : ''} de asistencia (30% del total).
      </div>
      <div class="ranking-list shame-ranking">
        ${ranking.map((p, i) => `
          <div class="ranking-row ${i < 3 ? 'top-3' : ''}">
            <span class="rank-pos">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
            <span class="rank-name clickable-player" data-player="${p.name}">${p.name}</span>
            <div class="rank-detail">
              <div class="shame-bar"><div class="shame-fill" style="width:${(p.score * 100).toFixed(0)}%"></div></div>
              <span class="rank-value">${(p.score * 100).toFixed(1)}%</span>
            </div>
            <div class="rank-sub">${p.deathsPerSemana.toFixed(1)} muertes/sem · ${fmtDmg(p.avoidPerSemana)} evit/sem${p.dmgToAllies !== null ? ` · ${fmtDmg(p.dmgToAllies)} a aliados` : ''}${p.mcCount !== null ? ` · ${p.mcCount}× MC` : ''} · ${p.semanas} sem · ${rcMap.get(p.name) ?? 0} raids</div>
          </div>`).join('')}
      </div>`;

  // Sub-tab: Muertes
  const deathsMap   = getDeathsByPlayer();
  const timeDeadMap = new Map();
  const firstDieMap = new Map();
  for (const e of historial) {
    for (const d of (e.deathStats?.timeDead ?? [])) {
      timeDeadMap.set(d.name, (timeDeadMap.get(d.name) ?? 0) + (d.total ?? d.ms ?? 0));
    }
    if (e.deathStats?.firstToDie) {
      const fd = e.deathStats.firstToDie;
      const name = fd.name ?? fd;
      if (name) firstDieMap.set(name, (firstDieMap.get(name) ?? 0) + 1);
    }
  }
  const deathsList   = [...deathsMap.entries()].map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val);
  const timeDeadList = [...timeDeadMap.entries()].map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val);
  const firstDieList = [...firstDieMap.entries()].map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val);

  const deathMax   = deathsList[0]?.val ?? 1;
  const timeMax    = timeDeadList[0]?.val ?? 1;
  const firstMax   = firstDieList[0]?.val ?? 1;
  const fmtTimeDead = v => { const s = Math.floor(v / 1000); const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

  const rkCls  = i => i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
  const rkMdl  = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
  const mkDeathTable = (arr, valFn, maxVal, cls, hideRaids) => `
    <table class="ranked-list">
      <thead><tr><th></th><th>Jugador</th><th class="bar-cell"></th><th>Total</th>${hideRaids ? '' : '<th>Raids</th>'}</tr></thead>
      <tbody>${arr.map((e, i) => `<tr>
        <td class="rank-num ${rkCls(i)}">${rkMdl(i)}</td>
        <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(Math.round((e.val / maxVal) * 100))}</td>
        <td class="val-cell ${cls}">${valFn(e.val)}</td>
        ${hideRaids ? '' : `<td class="td-dim">${rcMap.get(e.name) ?? '—'}</td>`}
      </tr>`).join('')}</tbody>
    </table>`;

  const muertesHtml = `
    <div class="two-col" style="margin-bottom:1.5rem">
      <div>
        <div class="section-title">Muertes Totales</div>
        ${mkDeathTable(deathsList, v => v + ' ×', deathMax, 'red', false)}
      </div>
      <div>
        <div class="section-title">Tiempo Muerto</div>
        ${mkDeathTable(timeDeadList, fmtTimeDead, timeMax, 'purple', false)}
      </div>
    </div>
    ${firstDieList.length > 0 ? `
      <div class="section-title">Primero en Morir</div>
      ${mkDeathTable(firstDieList, v => v + ' ×', firstMax, 'red', true)}` : ''}`;

  // Sub-tab: Evitables (4 badges + tablas SSC y TK)
  function buildAvoidTable(raidBossNames) {
    const mechKeys = [], mechKeySet = new Set(), playerMap = new Map();
    for (const e of historial) {
      for (const b of (e.bosses ?? [])) {
        if (!raidBossNames.includes(b.boss)) continue;
        for (const m of (b.avoidableDamage ?? [])) {
          const key = `${b.boss}|${m.mechanic}`;
          if (!mechKeySet.has(key)) { mechKeySet.add(key); mechKeys.push({ key, boss: b.boss, mechanic: m.mechanic }); }
          for (const p of m.players) {
            if (!playerMap.has(p.name)) playerMap.set(p.name, { total: 0 });
            const obj = playerMap.get(p.name);
            obj.total += p.total;
            obj[key] = (obj[key] ?? 0) + p.total;
          }
        }
      }
    }
    if (!mechKeys.length) return '<p style="color:var(--text-dim);font-size:.85rem">Sin datos aun.</p>';
    const rows = [...playerMap.entries()].map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
    const thStyle = 'cursor:default;white-space:nowrap';
    return `<div style="overflow-x:auto;margin-top:.75rem">
      <table class="ranked-list">
        <thead><tr>
          <th></th><th>Jugador</th>
          <th style="${thStyle}">Total</th>
          ${mechKeys.map(m => `<th style="${thStyle}" title="${m.boss}">${m.mechanic}</th>`).join('')}
        </tr></thead>
        <tbody>${rows.map((e, i) => `<tr>
          <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)}</td>
          <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
          <td class="val-cell red">${fmtDmg(e.total)}</td>
          ${mechKeys.map(m => `<td class="td-dim">${e[m.key] ? fmtDmg(e[m.key]) : '—'}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  const allAvoidRows = (() => {
    const pm = new Map();
    for (const e of historial) for (const b of (e.bosses ?? [])) for (const m of (b.avoidableDamage ?? [])) for (const p of m.players) pm.set(p.name, (pm.get(p.name) ?? 0) + p.total);
    return [...pm.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  })();
  const totalAvoid = allAvoidRows.reduce((s, e) => s + e.total, 0);
  const mediaAvoidRaid = historial.length > 0
    ? historial.reduce((s, e) => s + (e.bosses ?? []).reduce((ss, b) => ss + (b.avoidableDamage ?? []).reduce((sss, m) => sss + m.players.reduce((ssss, p) => ssss + p.total, 0), 0), 0), 0) / historial.length
    : 0;
  const raidMaxAvoid = historial.reduce((best, e) => {
    const sum = (e.bosses ?? []).reduce((ss, b) => ss + (b.avoidableDamage ?? []).reduce((sss, m) => sss + m.players.reduce((ssss, p) => ssss + p.total, 0), 0), 0);
    return sum > (best.sum ?? 0) ? { sum, fecha: e.fecha } : best;
  }, {});
  const topAvoidPlayer = allAvoidRows[0] ?? null;

  const evitablesHtml = `
    ${allAvoidRows.length > 0 ? `
    <div class="stat-cards" style="margin-bottom:2rem">
      <div class="stat-card">
        <div class="label">Daño Evitable</div>
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
        <div class="value red" style="font-size:1.3rem">${topAvoidPlayer?.name ?? '—'}</div>
        <div class="sub">${topAvoidPlayer ? fmtDmg(topAvoidPlayer.total) + ' en total' : ''}</div>
      </div>
    </div>` : ''}
    ${buildAvoidTable(ALL_BOSSES)}`;

  // Sub-tab: Trolleos a la Raid
  const starSections = [];

  const _demonMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Leotheras')
        for (const d of (b.innerDemons ?? []))
          _demonMap.set(d.name, (_demonMap.get(d.name) ?? 0) + d.mcCount);
  if (_demonMap.size > 0) {
    const r = [..._demonMap.entries()].map(([name, mcCount]) => ({ name, mcCount })).sort((a, b) => b.mcCount - a.mcCount);
    starSections.push(`<div class="mecanica-section">
        <h3>👹 Inner Demon — Leotheras (SSC)</h3>
        <p style="font-size:0.78rem;color:#888;margin-bottom:0.75rem">Jugadores controlados mentalmente por no matar a su demonio interior.</p>
        ${renderSimpleRanking(r, 'mcCount', 'veces MC', v => String(v))}
      </div>`);
  }

  const _wrathMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Solarian')
        for (const d of (b.wrathOfAstromancer ?? []))
          _wrathMap.set(d.name, (_wrathMap.get(d.name) ?? 0) + d.damageToAllies);
  if (_wrathMap.size > 0) {
    const r = [..._wrathMap.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
    starSections.push(`<div class="mecanica-section">
        <h3>💣 Wrath of the Astromancer — Solarian (TK)</h3>
        <p style="font-size:0.78rem;color:#888;margin-bottom:0.75rem">Daño infligido a aliados al explotar la maldición de la Astrómante.</p>
        ${renderSimpleRanking(r, 'total', 'daño a aliados', v => fmtDmg(v))}
      </div>`);
  }

  const _staticMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Vashj')
        for (const d of (b.staticCharges ?? []))
          _staticMap.set(d.name, (_staticMap.get(d.name) ?? 0) + d.damageToAllies);
  if (_staticMap.size > 0) {
    const r = [..._staticMap.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
    starSections.push(`<div class="mecanica-section">
        <h3>⚡ Static Charge — Lady Vashj (SSC)</h3>
        <p style="font-size:0.78rem;color:#888;margin-bottom:0.75rem">Daño infligido a aliados al no separarse con la carga estática.</p>
        ${renderSimpleRanking(r, 'total', 'daño a aliados', v => fmtDmg(v))}
      </div>`);
  }

  const estrellasHtml = starSections.length === 0
    ? '<p style="color:var(--text-dim);font-size:0.85rem">Sin datos de trolleos aún.</p>'
    : starSections.join('');

  // ── General badges: Semana más vergonzosa / ejemplar ──
  const nightDeaths = historial.map(e => {
    const deaths   = (e.deathStats?.deaths ?? []).reduce((s, d) => s + d.count, 0);
    const wipes    = (e.bosses ?? []).reduce((s, b) => s + (b.attempts ?? 1) - (b.killed ? 1 : 0), 0);
    const avoidDmg = (e.bosses ?? []).reduce((s, b) =>
      s + (b.avoidableDamage ?? []).reduce((s2, m) =>
        s2 + (m.players ?? []).reduce((s3, p) => s3 + (p.total ?? 0), 0), 0), 0);
    const troleoDmg = (e.bosses ?? []).reduce((s, b) => {
      const wrath  = (b.wrathOfAstromancer ?? []).reduce((s2, p) => s2 + (p.damageToAllies ?? 0), 0);
      const charge = (b.staticCharges      ?? []).reduce((s2, p) => s2 + (p.damageToAllies ?? 0), 0);
      return s + wrath + charge;
    }, 0);
    // score: muertes + wipes*3 + daño evitable y trolleos en "muertes equivalentes" (10k HP ref)
    const score = deaths + wipes * 3 + avoidDmg / 10000 + troleoDmg / 10000;
    // rango de semana: miércoles de apertura → martes siguiente (+6 días)
    const semanaStart = e.semana ?? e.fecha;
    const semanaEndDate = new Date(semanaStart + 'T00:00:00');
    semanaEndDate.setDate(semanaEndDate.getDate() + 6);
    const semanaEnd = semanaEndDate.toISOString().slice(0, 10);
    return { semana: semanaStart, semanaEnd, semanaNum: e.semanaNum, deaths, wipes, avoidDmg, troleoDmg, score };
  });
  const worstNight = nightDeaths.length ? nightDeaths.slice().sort((a, b) => b.score - a.score)[0] : null;
  const bestNight  = nightDeaths.length ? nightDeaths.slice().sort((a, b) => a.score - b.score)[0] : null;
  const fmtK = v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`;
  const generalBadgesHtml = (worstNight || bestNight) ? `
    <div class="stat-cards" style="margin-bottom:1.5rem">
      ${worstNight ? `<div class="stat-card" style="border-color:var(--red2)">
        <div class="label" style="color:var(--red2)">🔥 Semana más Vergonzosa</div>
        <div class="value red" style="font-size:1.2rem">Semana ${worstNight.semanaNum}</div>
        <div class="sub">${fmtDate(worstNight.semana)} – ${fmtDate(worstNight.semanaEnd)}</div>
        <div class="sub">${worstNight.deaths} muertes · ${worstNight.wipes} wipes · ${fmtK(worstNight.avoidDmg)} evit · ${fmtK(worstNight.troleoDmg)} trolleos</div>
      </div>` : ''}
      ${bestNight ? `<div class="stat-card" style="border-color:#7dce82">
        <div class="label" style="color:#7dce82">🌿 Semana más Ejemplar</div>
        <div class="value" style="color:#7dce82;font-size:1.2rem">Semana ${bestNight.semanaNum}</div>
        <div class="sub">${fmtDate(bestNight.semana)} – ${fmtDate(bestNight.semanaEnd)}</div>
        <div class="sub">${bestNight.deaths} muertes · ${bestNight.wipes} wipes · ${fmtK(bestNight.avoidDmg)} evit · ${fmtK(bestNight.troleoDmg)} trolleos</div>
      </div>` : ''}
    </div>` : '';

  document.getElementById('tab-verguenza').innerHTML = `
    ${generalBadgesHtml}
    <div class="sub-nav" id="sub-nav-verguenza">
      <button class="sub-tab-btn active" data-subtab="shame">Vergüenza</button>
      <button class="sub-tab-btn" data-subtab="evitables">Mecánicas Evitables</button>
      <button class="sub-tab-btn" data-subtab="estrellas">Trolleos</button>
      <button class="sub-tab-btn" data-subtab="muertes">Muertes</button>
    </div>
    <div class="sub-tab-content active" id="subtab-shame">${shameHtml}</div>
    <div class="sub-tab-content" id="subtab-evitables">${evitablesHtml}</div>
    <div class="sub-tab-content" id="subtab-estrellas">${estrellasHtml}</div>
    <div class="sub-tab-content" id="subtab-muertes">${muertesHtml}</div>`;

  // Sub-tab switching
  document.getElementById('sub-nav-verguenza').addEventListener('click', e => {
    const btn = e.target.closest('.sub-tab-btn');
    if (!btn) return;
    document.querySelectorAll('#sub-nav-verguenza .sub-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    const subtab = btn.dataset.subtab;
    document.querySelectorAll('#tab-verguenza .sub-tab-content').forEach(c => c.classList.toggle('active', c.id === `subtab-${subtab}`));
  });

  attachPlayerClicks('#tab-verguenza');
}

// ── LOGROS ────────────────────────────────────────────────────────────────────
function renderLogros() {
  // Contar raids individuales (WCL report codes), no entradas del historial
  let totalRaids = 0;
  const raidCountMap = new Map();
  for (const e of historial) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    const hasCla = codes.some(c => e.claReports?.[c]);
    if (hasCla) {
      for (const code of codes) {
        const jugs = e.claReports?.[code]?.jugadores;
        if (!jugs) continue;
        totalRaids++;
        for (const name of Object.keys(jugs))
          raidCountMap.set(name, (raidCountMap.get(name) ?? 0) + 1);
      }
    } else {
      totalRaids += codes.length;
      for (const name of (e.roster ?? []))
        raidCountMap.set(name, (raidCountMap.get(name) ?? 0) + codes.length);
    }
  }
  const minRaids = Math.max(1, Math.ceil(totalRaids * 0.3));
  const deathsMap  = getDeathsByPlayer();
  const avoidMap   = getAvoidByPlayer();
  const intMap     = getInterruptsByPlayer();
  const dispMap    = getDispelsByPlayer();
  const records    = getRecordsGlobales();

  // CLA aggregation: avgPrep and subOccurrences per player
  const claPrepMap = new Map(); // name → { sum, count }
  const claSubMap  = new Map(); // name → total subOccurrences
  for (const e of historial) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    for (const code of codes) {
      const claEntry = e.claReports?.[code];
      if (!claEntry?.jugadores) continue;
      for (const [pname, jugador] of Object.entries(claEntry.jugadores)) {
        const cons = (jugador.consumiblesScore ?? 0) + (jugador.scrollBonus ?? 0);
        const gear = jugador.gearStats?.gearPrepPct ?? jugador.gearScore ?? null;
        const prep = Math.min(100, Math.round(gear !== null ? (cons + gear) / 2 : cons));
        if (!claPrepMap.has(pname)) claPrepMap.set(pname, { sum: 0, count: 0 });
        claPrepMap.get(pname).sum += prep;
        claPrepMap.get(pname).count++;
        const sub = jugador.gearStats?.subOccurrences ?? 0;
        claSubMap.set(pname, (claSubMap.get(pname) ?? 0) + sub);
      }
    }
  }

  const semanasMap = getSemanasPorJugador();
  function pickRnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function eligible(name) { return (raidCountMap.get(name) ?? 0) >= minRaids; }
  function perSem(map, name) { return (map.get(name) ?? 0) / (semanasMap.get(name)?.size ?? 1); }
  function topWinners(arr, key, dir) {
    if (!arr.length) return [];
    const s = [...arr].sort((a, b) => dir === 'asc' ? a[key] - b[key] : b[key] - a[key]);
    const best = s[0][key];
    return s.filter(e => Math.abs(e[key] - best) < 0.001);
  }
  function mkPlayers(winners) {
    return winners.length === 1
      ? { jugador: winners[0].name }
      : { jugadores: winners.map(w => w.name) };
  }

  const shames = [];
  const honors = [];

  // ── INFAMIA ──

  // Carne de Boss — más muertes media/semana
  const deathWinners = topWinners([...deathsMap.entries()].filter(([n]) => eligible(n))
    .map(([name]) => ({ name, perSem: perSem(deathsMap, name) })), 'perSem');
  if (deathWinners.length) shames.push({
    icon: '💀', titulo: 'Carne de Boss', ...mkPlayers(deathWinners),
    valor: deathWinners[0].perSem.toFixed(1) + ' muertes/sem',
    desc: 'Más muertes media/semana',
    comentario: pickRnd([
      'El boss le busca con el ojo.',
      'Muere con tal consistencia que ya es mecánica del boss.',
      'Los healers memorizaron su nombre. No por buenas razones.',
      'Tiene más vidas gastadas que un gato. Y las va agotando.',
      'Si hubiera logro por morir, ya lo tendría desbloqueado.',
    ]),
  });

  // El Espectro — más tiempo muerto media/semana
  const timeDeadMap = new Map();
  for (const e of historial)
    for (const d of (e.deathStats?.timeDead ?? []))
      timeDeadMap.set(d.name, (timeDeadMap.get(d.name) ?? 0) + (d.total ?? d.ms ?? 0));
  const deadWinners = topWinners([...timeDeadMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (deadWinners.length) {
    const fmtMs = ms => { const s = Math.floor(ms / 1000), m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };
    shames.push({
      icon: '👻', titulo: 'El Espectro', ...mkPlayers(deadWinners),
      valor: fmtMs(deadWinners[0].perSem) + '/sem',
      desc: 'Más tiempo muerto media/semana',
      comentario: pickRnd([
        'Contribuye desde el más allá. Con pensamiento positivo.',
        'Los bosses no le matan, le dan tiempo de reflexión.',
        'Pasa más tiempo en el cementerio que en la raid.',
        'Ghost run experto. Conoce el camino de vuelta mejor que nadie.',
        'Técnicamente sigue en el grupo. Espiritualmente, ya se fue.',
      ]),
    });
  }

  // El Absorbente — más daño evitable media/semana
  const avoidWinners = topWinners([...avoidMap.entries()].filter(([n]) => eligible(n))
    .map(([name]) => ({ name, perSem: perSem(avoidMap, name) })), 'perSem');
  if (avoidWinners.length) shames.push({
    icon: '🧽', titulo: 'El Absorbente', ...mkPlayers(avoidWinners),
    valor: fmtDmg(avoidWinners[0].perSem) + '/sem',
    desc: 'Más daño evitable media/semana',
    comentario: pickRnd([
      'Para él, "mecánica evitable" es solo una sugerencia.',
      'Los aoes le llaman por su nombre de pila.',
      'Recibe más daño evitable que inevitable. Arte moderno.',
      'El suelo le resulta irresistible. Cada semana.',
      'Si hubiera un récord de daño evitable, lo tendría.',
    ]),
  });

  // La Piñata — mayor golpe recibido en toda la fase
  if (records.biggestReceived) shames.push({
    icon: '🎊', titulo: 'La Piñata', jugador: records.biggestReceived.victima,
    valor: fmtDmg(records.biggestReceived.amount) + (records.biggestReceived.ability ? ` · ${records.biggestReceived.ability}` : ''),
    desc: 'Mayor golpe recibido en toda la fase',
    comentario: pickRnd([
      'Ese golpe lo registraron los sismógrafos.',
      'El boss guardaba ese número para alguien especial.',
      'Récord histórico de daño recibido en un solo impacto.',
      'Una cifra que impresiona incluso al jefe que la infligió.',
      'Los healers se miraron entre ellos. No dijeron nada.',
    ]),
  });

  // El Sordo — menos interrupts entre clases capaces
  const CAPABLE_CLASSES      = new Set(['Warrior', 'Rogue', 'Mage']);
  const CAPABLE_SHAMAN_SPECS = new Set(['Enhancement', 'Elemental']);
  const classMap = {}, specMap = {};
  for (const e of historial) {
    Object.assign(classMap, e.playerClasses ?? {});
    Object.assign(specMap,  e.playerSpecs   ?? {});
  }
  const capable = getPlayers().filter(n => {
    const cls = classMap[n] ?? '', spec = specMap[n] ?? '';
    return CAPABLE_CLASSES.has(cls) || (cls === 'Shaman' && CAPABLE_SHAMAN_SPECS.has(spec));
  }).filter(eligible);
  if (capable.length > 0) {
    const sorted = capable.map(n => ({ name: n, val: perSem(intMap, n) })).sort((a, b) => a.val - b.val);
    const minVal = sorted[0].val;
    shames.push({
      icon: '🤐', titulo: 'El Sordo',
      jugadores: sorted.filter(e => Math.abs(e.val - minVal) < 0.001).map(e => e.name),
      valor: minVal.toFixed(1) + ' ints/sem',
      desc: 'Menos interrupts entre los capaces de hacerlos',
      comentario: pickRnd([
        'Tiene el botón de silencio activado desde el primer día.',
        'La barra de casteo del boss, su forma de meditar.',
        'Interrumpir es para los que no confían en los healers.',
        'El boss castea tranquilo cuando le ve llegar.',
        'Su tecla de interrupt ha emigrado a otro personaje.',
      ]),
    });
  }

  // El Bañado — más daño de Spout del Lurker (media/semana)
  const spoutMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Lurker')
        for (const mech of (b.avoidableDamage ?? []))
          if (mech.mechanic === 'Spout')
            for (const p of (mech.players ?? []))
              spoutMap.set(p.name, (spoutMap.get(p.name) ?? 0) + p.total);
  const spoutWinners = topWinners([...spoutMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (spoutWinners.length) shames.push({
    icon: '💦', titulo: 'El Bañado', ...mkPlayers(spoutWinners),
    valor: fmtDmg(spoutWinners[0].perSem) + '/sem',
    desc: 'Más daño de Spout del Lurker (media/semana)',
    comentario: pickRnd([
      'Recibió el lefazo en toda la cara.',
      'Salta el Spout justo cuando empieza. Técnica propia.',
      'El chorro giratorio le encuentra siempre en el sitio equivocado.',
      'No es que no lo vea. Lo ve. Solo decide no moverse.',
      'Tiene un talento especial para estar donde más moja.',
    ]),
  });

  // El Poseído — más MC de Inner Demon (Leotheras)
  const demonMap2 = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Leotheras')
        for (const d of (b.innerDemons ?? []))
          demonMap2.set(d.name, (demonMap2.get(d.name) ?? 0) + d.mcCount);
  const demonSorted = [...demonMap2.entries()].sort((a, b) => b[1] - a[1]);
  const demonWinners = demonSorted.filter(e => e[1] === demonSorted[0]?.[1]);
  if (demonWinners.length) shames.push({
    icon: '👹', titulo: 'El Poseído', ...(demonWinners.length === 1 ? { jugador: demonWinners[0][0] } : { jugadores: demonWinners.map(e => e[0]) }),
    valor: demonWinners[0][1] + ' veces MC',
    desc: 'Más veces controlado por Inner Demon (Leotheras)',
    comentario: pickRnd([
      'Su demonio interior ganó. Limpiamente.',
      'No lo controla el boss, le controla él mismo. Peor.',
      'Leotheras le eligió por algo. Algo que preocupa.',
      'La fase 2 de Leotheras empieza cuando él entra en combate.',
      'Su demonio interior lleva las estadísticas. Son buenas.',
    ]),
  });

  // El Veleta — más aplicaciones de Gusting Winds (Karathress, media/semana)
  const gustingMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Karathress')
        for (const d of (b.gustingWinds ?? []))
          gustingMap.set(d.name, (gustingMap.get(d.name) ?? 0) + d.count);
  const gustingWinners = topWinners([...gustingMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (gustingWinners.length) shames.push({
    icon: '🌪️', titulo: 'El Veleta', ...mkPlayers(gustingWinners),
    valor: gustingWinners[0].perSem.toFixed(1) + ' stacks/sem',
    desc: 'Más aplicaciones de Gusting Winds (Karathress, media/semana)',
    comentario: pickRnd([
      'El viento de Karathress le conoce por el nombre.',
      'Sale volando cada pull. Puntualmente.',
      'No es mala suerte. Es geometría.',
      'El torbellino le busca a él primero. Por costumbre.',
      'Karathress le usa de indicador de dirección del viento.',
    ]),
  });

  // El Pararrayos — más daño a aliados por Static Charge de Vashj (media/semana)
  const staticMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Vashj')
        for (const d of (b.staticCharges ?? []))
          staticMap.set(d.name, (staticMap.get(d.name) ?? 0) + d.damageToAllies);
  const staticWinners = topWinners([...staticMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (staticWinners.length) shames.push({
    icon: '⚡', titulo: 'El Pararrayos', ...mkPlayers(staticWinners),
    valor: fmtDmg(staticWinners[0].perSem) + '/sem a aliados',
    desc: 'Más daño a aliados por Static Charge de Vashj (media/semana)',
    comentario: pickRnd([
      'Le pusieron la carga y decidió que los amigos eran mejores conductores.',
      'El boss le eligió para electrocutar al grupo. Y él cumplió.',
      'Sus aliados no saben si tenerle cerca o ponerse a tierra.',
      'No se separó. Nunca se separa.',
      'Atrae la electricidad. Y a los healers llorando.',
    ]),
  });

  // El Hongo — más daño de Toxic Spores de Vashj (media/semana)
  const toxicMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Vashj')
        for (const mech of (b.avoidableDamage ?? []))
          if (mech.mechanic === 'Toxic Spores')
            for (const p of (mech.players ?? []))
              toxicMap.set(p.name, (toxicMap.get(p.name) ?? 0) + p.total);
  const toxicWinners = topWinners([...toxicMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (toxicWinners.length) shames.push({
    icon: '🍄', titulo: 'El Hongo', ...mkPlayers(toxicWinners),
    valor: fmtDmg(toxicWinners[0].perSem) + '/sem',
    desc: 'Más daño de Toxic Spores de Vashj (media/semana)',
    comentario: pickRnd([
      'Crece donde hay esporas. Inevitablemente.',
      'Se fusiona con el veneno de Vashj. Simbiosis.',
      'Las esporas le buscan a él. O él a ellas. Da lo mismo.',
      'Vashj no le mata, le abona.',
      'Cada semana termina el fight con más toxinas que el boss.',
    ]),
  });

  // La Bomba — más daño a aliados por Wrath of the Astromancer de Solarian (media/semana)
  const wrathMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Solarian')
        for (const d of (b.wrathOfAstromancer ?? []))
          wrathMap.set(d.name, (wrathMap.get(d.name) ?? 0) + d.damageToAllies);
  const wrathWinners = topWinners([...wrathMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (wrathWinners.length) shames.push({
    icon: '💣', titulo: 'La Bomba', ...mkPlayers(wrathWinners),
    valor: fmtDmg(wrathWinners[0].perSem) + '/sem a aliados',
    desc: 'Más daño a aliados por Wrath of the Astromancer de Solarian (media/semana)',
    comentario: pickRnd([
      'Solarian le eligió. El grupo lo sufrió.',
      'Se planta en el medio del grupo y espera a que explote. Cada semana.',
      'No hace falta que el boss les mate si tiene a este a su lado.',
      'Lleva la estrella encima y la comparte generosamente.',
      'El grupo sobrevive a Solarian. A él, con más dificultad.',
    ]),
  });

  // El Bombero — más daño de Flame Patch de Al'ar (media/semana)
  const flamePatchMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Alar')
        for (const mech of (b.avoidableDamage ?? []))
          if (mech.mechanic === 'Flame Patch')
            for (const p of (mech.players ?? []))
              flamePatchMap.set(p.name, (flamePatchMap.get(p.name) ?? 0) + p.total);
  const flamePatchWinners = topWinners([...flamePatchMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (flamePatchWinners.length) shames.push({
    icon: '🚒', titulo: 'El Bombero', ...mkPlayers(flamePatchWinners),
    valor: fmtDmg(flamePatchWinners[0].perSem) + '/sem',
    desc: "Más daño de Flame Patch de Al'ar (media/semana)",
    comentario: pickRnd([
      'Apaga el fuego con la cara.',
      'Inspecciona cada Flame Patch en persona. Minuciosamente.',
      'El boss pone el fuego, él verifica que funciona.',
      'Control de calidad del suelo. Cada semana.',
      'Si no pasa por el fuego, no cuenta como kill.',
    ]),
  });

  // El Fumeta — más daño de Nether Vapor de Kael'thas (media/semana)
  const netherVaporMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Kaelthas')
        for (const mech of (b.avoidableDamage ?? []))
          if (mech.mechanic === 'Nether Vapor')
            for (const p of (mech.players ?? []))
              netherVaporMap.set(p.name, (netherVaporMap.get(p.name) ?? 0) + p.total);
  const netherVaporWinners = topWinners([...netherVaporMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (netherVaporWinners.length) shames.push({
    icon: '💨', titulo: 'El Fumeta', ...mkPlayers(netherVaporWinners),
    valor: fmtDmg(netherVaporWinners[0].perSem) + '/sem',
    desc: "Más daño de Nether Vapor de Kael'thas (media/semana)",
    comentario: pickRnd([
      'Las nubes negras son decorativas, probablemente.',
      'Donde hay humo hay un raider metiéndose dentro.',
      'Se inspira en cada Nether Vapor. Literalmente.',
      "Kael'thas pone las nubes, él las visita una por una.",
      'El único que sale del raid con los pulmones negros.',
    ]),
  });

  // El Barbacoa — más daño de Flamestrike de Kael'thas (media/semana)
  const flamestrikeMap = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Kaelthas')
        for (const mech of (b.avoidableDamage ?? []))
          if (mech.mechanic === 'Flamestrike')
            for (const p of (mech.players ?? []))
              flamestrikeMap.set(p.name, (flamestrikeMap.get(p.name) ?? 0) + p.total);
  const flamestrikeWinners = topWinners([...flamestrikeMap.entries()].filter(([n]) => eligible(n))
    .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) })), 'perSem');
  if (flamestrikeWinners.length) shames.push({
    icon: '🥩', titulo: 'El Barbacoa', ...mkPlayers(flamestrikeWinners),
    valor: fmtDmg(flamestrikeWinners[0].perSem) + '/sem',
    desc: "Más daño de Flamestrike de Kael'thas (media/semana)",
    comentario: pickRnd([
      'Sale de Kaelthas más hecho que un chuletón.',
      'El suelo arde y él lo usa de alfombra.',
      "Organiza una barbacoa en cada Flamestrike. El menú: él.",
      'Salir del fuego es opcional. Él lo tiene claro.',
      "El Flamestrike no le alcanza, le marida.",
    ]),
  });

  // El Tacaño — peor PREP % media
  {
    const list = [...claPrepMap.entries()]
      .filter(([n]) => eligible(n))
      .map(([name, d]) => ({ name, avg: d.sum / d.count }));
    const winners = topWinners(list, 'avg', 'asc');
    if (winners.length) shames.push({
      icon: '💸', titulo: 'El Tacaño', ...mkPlayers(winners),
      valor: winners[0].avg.toFixed(1) + '% prep media',
      desc: 'Peor PREP % media entre los asiduos',
      comentario: pickRnd([
        'El frasco es para los débiles. O eso se dice para justificar no comprarlo.',
        'Sus consumibles son opcionales. Su raid spot, también.',
        'Ahorra en consumibles lo que cuesta al grupo entero en tiempo.',
        'El vendor tiene su foto en la lista negra.',
        'Llegó sin frasco, sin comida y con la certeza de que da igual.',
      ]),
    });
  }

  // El Domador — más subOccurrences/semana (riding crop y similares)
  {
    const list = [...claSubMap.entries()]
      .filter(([n]) => eligible(n) && (claSubMap.get(n) ?? 0) > 0)
      .map(([name, total]) => ({ name, perSem: total / (semanasMap.get(name)?.size ?? 1) }));
    const winners = topWinners(list, 'perSem');
    if (winners.length) shames.push({
      icon: '🪢', titulo: 'El Domador', ...mkPlayers(winners),
      valor: winners[0].perSem.toFixed(1) + ' subóptimos/sem',
      desc: 'Más ítems subóptimos (fusta, ing., PvP) media/semana',
      comentario: pickRnd([
        'La fusta no es BiS. Tampoco le importa.',
        'Cada semana alguien revisa el log y encuentra la fusta. Siempre es el mismo.',
        'Técnicamente optimizado para montar. La raid requería otra cosa.',
        'Los bosses del SSC han muerto viendo una fusta equipada. No está bien.',
        'Su mochila tiene espacio para el BiS. Lo usa para la fusta.',
      ]),
    });
  }

  // El Mimado — más ítems de loot recibidos (datos de Google Sheet)
  if (_mimadoTituloF2) shames.push(_mimadoTituloF2);

  // ── HONOR ──

  // El Escudo (F2) — más dispels media/semana
  const dispWinners = topWinners([...dispMap.entries()].filter(([n]) => eligible(n))
    .map(([name]) => ({ name, perSem: perSem(dispMap, name) })), 'perSem');
  if (dispWinners.length) honors.push({
    icon: '🧿', titulo: 'El Escudo', ...mkPlayers(dispWinners),
    valor: dispWinners[0].perSem.toFixed(1) + ' disp/sem',
    desc: 'Más dispels media/semana',
    comentario: pickRnd([
      'El grupo respira tranquilo cuando él está presente.',
      'Dispela más rápido que la mayoría piensa en hacerlo.',
      'El MVP silencioso que nadie menciona pero todos necesitan.',
      'Actúa antes de que el debuff se acomode.',
      'Si hubiera un campeonato de dispel, ya estaría clasificado.',
    ]),
  });

  // El Centinela (F2) — más interrupts media/semana
  const intWinners = topWinners([...intMap.entries()].filter(([n]) => eligible(n))
    .map(([name]) => ({ name, perSem: perSem(intMap, name) })), 'perSem');
  if (intWinners.length) honors.push({
    icon: '⚡', titulo: 'El Centinela', ...mkPlayers(intWinners),
    valor: intWinners[0].perSem.toFixed(1) + ' ints/sem',
    desc: 'Más interrupts media/semana',
    comentario: pickRnd([
      'El boss ni lo intenta cuando le ve en el grupo.',
      'Tiene el interrupt más rápido de la banda. Y lo usa.',
      'Su tiempo de reacción desafía las leyes de la física.',
      'El cast del boss dura 0.3 segundos. Él es más rápido.',
      'Cada casteo bloqueado es una historia que no ocurre.',
    ]),
  });

  // El Superviviente (F2) — menos muertes media/semana
  const survWinners = topWinners([...deathsMap.entries()].filter(([n]) => eligible(n))
    .map(([name]) => ({ name, perSem: perSem(deathsMap, name) })), 'perSem', 'asc');
  if (survWinners.length) honors.push({
    icon: '🌿', titulo: 'El Superviviente', ...mkPlayers(survWinners),
    valor: survWinners[0].perSem.toFixed(1) + ' muertes/sem',
    desc: 'Menos muertes media/semana entre los asiduos',
    comentario: pickRnd([
      'Conoce las mecánicas o tiene muy buenos reflejos. Probablemente ambas.',
      'Los bosses le disparan y fallan. Sistemáticamente.',
      'Evita las mecánicas con una elegancia inquietante.',
      'Mientras los demás mueren, él estudia el terreno.',
      'Su historial de muertes es su mejor carta de presentación.',
    ]),
  });

  // El Espartano (F2) — más sesiones sin morir
  {
    const spartanCount = new Map();
    for (const e of historial) {
      const deadSet = new Set((e.deathStats?.deaths ?? []).filter(d => d.count > 0).map(d => d.name));
      for (const n of (e.roster ?? [])) {
        if (!deadSet.has(n)) spartanCount.set(n, (spartanCount.get(n) ?? 0) + 1);
      }
    }
    const spartanSorted = [...spartanCount.entries()]
      .filter(([n]) => eligible(n))
      .sort((a, b) => b[1] - a[1]);
    const spartanBest = spartanSorted[0]?.[1];
    const spartanWinners = spartanSorted.filter(e => e[1] === spartanBest);
    if (spartanWinners.length) honors.push({
      icon: '🏛️', titulo: 'El Espartano',
      ...(spartanWinners.length === 1 ? { jugador: spartanWinners[0][0] } : { jugadores: spartanWinners.map(e => e[0]) }),
      valor: spartanBest + ' sesiones limpias',
      desc: 'Más sesiones sin morir ni una vez',
      comentario: pickRnd([
        'El suelo de SSC no le conoce la cara.',
        'Muerto no. Herido tampoco. Perfecto.',
        'Mientras el grupo cae, él sigue en pie.',
        'Su récord de no-muerte es un insulto silencioso a los demás.',
        'Termina cada sesión tan entero como la empieza.',
      ]),
    });
  }

  // El Intocable (F2) — menos daño evitable media/semana
  {
    const intocables = [...semanasMap.entries()]
      .filter(([n]) => eligible(n))
      .map(([n]) => ({ name: n, val: perSem(avoidMap, n) }))
      .sort((a, b) => a.val - b.val);
    if (intocables.length > 0) {
      const minVal = intocables[0].val;
      const topIntocables = intocables.filter(e => e.val === minVal).map(e => e.name);
      honors.push({
      icon: '🧘', titulo: 'El Intocable',
      jugadores: topIntocables,
      valor: minVal === 0 ? 'sin daño evitable' : fmtDmg(Math.round(minVal)) + '/sem',
      desc: 'Menos daño de mecánicas evitables media/semana',
      comentario: pickRnd([
        'Lee las mecánicas antes de la raid. Los demás leen los logs después.',
        'Se mueve antes de que el suelo le dé motivos.',
        'Juega como si el daño evitable no existiera. Porque para él no existe.',
        'Esquiva antes de que la mecánica aparezca en pantalla.',
        'El daño evitable le resulta un concepto abstracto y ajeno.',
      ]),
      });
    }
  }

  // El Verdugo (F2) — mayor golpe dado
  if (records.biggestDealt) honors.push({
    icon: '🗡️', titulo: 'El Verdugo', jugador: records.biggestDealt.heroe,
    valor: fmtDmg(records.biggestDealt.amount) + (records.biggestDealt.ability ? ` · ${records.biggestDealt.ability}` : ''),
    desc: 'Mayor golpe infligido en toda la fase',
    comentario: pickRnd([
      'El boss lo sintió. El log lo recuerda.',
      'Ese número tardará en superarse. Mucho.',
      'Récord histórico de daño en un solo golpe.',
      'Cuando el boss le ve apuntar, se preocupa.',
      'Golpe histórico. Le pertenece hasta que alguien lo bata.',
    ]),
  });

  // El Exterminador (F2) — mayor media de DPS en todos los boss kills
  {
    const allDps = new Map();
    for (const e of historial) {
      for (const entry of (e.globalDps ?? [])) {
        const c = allDps.get(entry.name) ?? { total: 0, time: 0 };
        allDps.set(entry.name, { total: c.total + entry.total, time: c.time + entry.time });
      }
    }
    const extList = [...allDps.entries()]
      .filter(([n]) => eligible(n))
      .map(([name, v]) => ({ name, dps: Math.round(v.total / v.time) }))
      .sort((a, b) => b.dps - a.dps);
    const extWinners = topWinners(extList, 'dps', 'desc');
    if (extWinners.length) honors.push({
      icon: '⚔️', titulo: 'El Exterminador', ...mkPlayers(extWinners),
      valor: fmtDmg(extWinners[0].dps) + ' DPS',
      desc: 'Mayor media de DPS en todos los boss kills',
      comentario: pickRnd([
        'Los bosses le tienen en la memoria muscular. Para mal.',
        'Cada semana aporta un número que duele verlo.',
        'El daño que hace es inverosímil. Hasta que ves el log.',
        'Golpe a golpe ha construido una estadística imponente.',
        'Los bosses saben cuándo le ve llegar. Ya es tarde.',
      ]),
    });
  }

  // El Aerith (F2) — mayor media de HPS en todos los boss kills
  {
    const allHps = new Map();
    for (const e of historial) {
      for (const entry of (e.globalHps ?? [])) {
        const c = allHps.get(entry.name) ?? { total: 0, time: 0 };
        allHps.set(entry.name, { total: c.total + entry.total, time: c.time + entry.time });
      }
    }
    const aerithList = [...allHps.entries()]
      .filter(([n]) => eligible(n))
      .map(([name, v]) => ({ name, hps: Math.round(v.total / v.time) }))
      .sort((a, b) => b.hps - a.hps);
    const aerithWinners = topWinners(aerithList, 'hps', 'desc');
    if (aerithWinners.length) honors.push({
      icon: '💚', titulo: 'El Aerith', ...mkPlayers(aerithWinners),
      valor: fmtDmg(aerithWinners[0].hps) + ' HPS',
      desc: 'Mayor media de HPS en todos los boss kills',
      comentario: pickRnd([
        'Cada semana alguien le debe la vida. Varias veces.',
        'Sus números de curación hacen llorar de alegría.',
        'El grupo sobrevive porque él no falla.',
        'Una curación enorme cada semana. Como un reloj.',
        'Sus cifras de cura son un insulto al daño recibido.',
      ]),
    });
  }

  // El Muro (F2) — mayor % de mitigación acumulada en boss kills
  {
    const tankGlobal = new Map();
    for (const e of historial) {
      for (const b of (e.bosses ?? [])) {
        for (const t of (b.tankMitigation ?? [])) {
          const curr = tankGlobal.get(t.name) ?? { taken: 0, reduced: 0, gross: 0 };
          curr.taken   += t.taken;
          curr.reduced += t.reduced;
          curr.gross   += t.gross;
          tankGlobal.set(t.name, curr);
        }
      }
    }
    const muroList = [...tankGlobal.entries()]
      .filter(([n, v]) => v.gross > 0 && eligible(n))
      .map(([name, v]) => ({ name, pct: Math.round(v.reduced / v.gross * 1000) / 10 }))
      .sort((a, b) => b.pct - a.pct);
    const muroWinners = topWinners(muroList, 'pct', 'desc');
    if (muroWinners.length) honors.push({
      icon: '🗿', titulo: 'El Muro', ...mkPlayers(muroWinners),
      valor: muroWinners[0].pct + '% mitigado',
      desc: 'Mayor % de daño mitigado en todos los boss kills',
      comentario: pickRnd([
        'El boss pegó con todo. Él absorbió con más.',
        'Bloquea, esquiva y reduce. Sistemáticamente.',
        'Sus compañeros no saben lo que les habría dolido sin él.',
        'Un tanque que hace que el boss parezca menos boss.',
        'Inamovible. Impenetrable. El Muro.',
      ]),
    });
  }

  // El Boy Scout — mejor PREP % media
  {
    const list = [...claPrepMap.entries()]
      .filter(([n]) => eligible(n))
      .map(([name, d]) => ({ name, avg: Math.round(d.sum / d.count) }));
    const winners = topWinners(list, 'avg');
    if (winners.length) honors.push({
      icon: '🏕️', titulo: 'El Boy Scout', ...mkPlayers(winners),
      valor: winners[0].avg + '% prep media',
      desc: 'Mejor PREP % media entre los asiduos',
      comentario: pickRnd([
        'Tiene los consumibles preparados antes de que el raid leader diga invitar.',
        'Sus buffs son más consistentes que la asistencia del 90% de la raid.',
        'El vendor le guarda el stock. Solo para él.',
        'Nunca ha pulsado el boss sin frasco. Ni una vez en su vida.',
        'Mientras los demás buscaban la comida, él ya tenía el buff desde hace 10 minutos.',
      ]),
    });
  }

  TITULOS_F2 = [
    ...shames.map(t => ({ ...t, tipo: 'shame' })),
    ...honors.map(t => ({ ...t, tipo: 'honor' })),
  ];

  if (shames.length === 0 && honors.length === 0) {
    document.getElementById('tab-logros').innerHTML = '<p class="empty-msg">Aun no hay suficientes datos para calcular logros.</p>';
    return;
  }

  function renderCard(t, tipo) {
    const players = t.jugadores ?? [t.jugador ?? '?'];
    const playerHTML = players.map(p =>
      `<span class="clickable-player" data-player="${p}">${p}</span>`
    ).join(', ');
    return `
      <div class="titulo-card titulo-card--${tipo}">
        <div class="titulo-icon">${t.icon}</div>
        <div class="titulo-body">
          <div class="titulo-titulo">${t.titulo}</div>
          <div class="titulo-jugador">${playerHTML}</div>
          <div class="titulo-desc">${t.desc}</div>
          ${t.comentario ? `<div class="titulo-comentario">${t.comentario}</div>` : ''}
          <div class="titulo-valor">${t.valor}</div>
        </div>
      </div>`;
  }

  const f1Ach  = window.__F1_ACHIEVEMENTS__;
  const f1Html = f1Ach ? `
    <div class="f1-accordion">
      <div class="f1-accordion-header" onclick="toggleF1Accordion(this)">
        Legado de Fase 1 — La Resaca de Gruul <span>▶</span>
      </div>
      <div class="f1-accordion-body">
        ${renderF1Achievements(f1Ach)}
      </div>
    </div>` : '';

  document.getElementById('tab-logros').innerHTML = `
    <div class="section-title" style="font-size:1.3rem">Títulos de la Infamia</div>
    <div class="titulos-grid">${shames.map(t => renderCard(t, 'shame')).join('')}</div>
    <div class="section-title" style="margin-top:2rem;font-size:1.3rem">Títulos de Honor</div>
    <div class="titulos-grid">${honors.map(t => renderCard(t, 'honor')).join('')}</div>
    ${f1Html}`;

  attachPlayerClicks('#tab-logros');

  // Si el loot aún no está cargado, arrancarlo en segundo plano.
  // Cuando termine, _checkLootReady → _calcMimadoF2 → renderLogros() de nuevo con El Mimado.
  if (!lootLoaded) fetchLootData();
}

function _calcMimadoF2() {
  if (!lootRows) return;
  const count = new Map();
  lootRows
    .filter(r => ASSIGNED.has(r.response))
    .forEach(r => { count.set(r.nombre, (count.get(r.nombre) ?? 0) + 1); });
  if (!count.size) return;
  const max = Math.max(...count.values());
  const mimados = [...count.entries()]
    .filter(([, c]) => c === max)
    .map(([n]) => n);
  const comments = [
    'El loot le conoce por el nombre.',
    'El banco del personaje necesita ampliación urgente.',
    'Cada raid es Navidad para él.',
    'Los demás farmean experiencia, él farmea ítems.',
    'El sistema de loot funciona. Para él, concretamente.',
    'No sabe lo que es irse de vacío. Estadísticamente.',
    'Los demás votan, él recibe.',
    'Su personaje brilla más cada semana. Literalmente.',
  ];
  _mimadoTituloF2 = {
    id: 'mimado',
    icon: '💸',
    titulo: 'El Mimado',
    desc: 'Más ítems de loot recibidos en F2',
    jugadores: mimados,
    comentario: comments[Math.floor(Math.random() * comments.length)],
    valor: max + (max === 1 ? ' ítem' : ' ítems'),
  };
  if (TITULOS_F2 !== null) renderLogros();
}

function getF1DescById() {
  const titles = window.__F1_ACHIEVEMENTS__?.titles ?? [];
  return new Map(titles.map(t => [t.id, t.desc ?? '']));
}

function renderF1Achievements(f1Ach) {
  if (!f1Ach?.byPlayer) return '<p style="color:#888">No hay datos de F1.</p>';
  const descById = getF1DescById();
  return `<table class="semanas-table">
    <thead><tr><th>Jugador</th><th>Logros en F1</th></tr></thead>
    <tbody>
      ${Object.entries(f1Ach.byPlayer).sort((a, b) => a[0].localeCompare(b[0])).map(([name, titles]) => `
        <tr>
          <td><span class="clickable-player" data-player="${name}">${name}</span></td>
          <td style="line-height:2">${titles.map(t => {
            const color = (t.tipo === 'shame') ? 'var(--red2)' : '#4ec97e';
            const desc  = descById.get(t.id) ?? '';
            return `<span data-tooltip="${desc}" style="display:inline-flex;align-items:center;gap:.35rem;margin-right:.6rem;font-size:.9rem;font-weight:700;color:${color};cursor:default">${t.icon} ${t.titulo}</span>`;
          }).join('')}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

function toggleF1Accordion(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  header.querySelector('span').textContent = body.classList.contains('open') ? '▼' : '▶';
}

// ── POR SEMANA ────────────────────────────────────────────────────────────────
function navigateToPorSemana(semanaNum) {
  _pendingReportCode = semanaNum; // reuse field to pass semanaNum (resolved in renderPorSemana)
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="por-semana"]')?.classList.add('active');
  document.getElementById('tab-por-semana')?.classList.add('active');
  location.hash = 'por-semana';
  if (!rendered.has('por-semana')) {
    rendered.add('por-semana');
    renderPorSemana();
  } else {
    const sel = document.getElementById('semana-selector');
    if (sel) { sel.value = String(semanaNum); sel.dispatchEvent(new Event('change')); }
    _pendingReportCode = null;
  }
  window.scrollTo(0, 0);
}

function renderPorSemana() {
  const el = document.getElementById('tab-por-semana');
  if (!historial.length) {
    el.innerHTML = '<p class="empty-msg">No hay sesiones registradas aun.</p>';
    return;
  }

  const semanas = getSemanas().slice().reverse(); // más reciente primero

  const options = semanas.map(s =>
    `<option value="${s.semanaNum}">Semana ${s.semanaNum} · ${semanaDateRange(s.semana)}</option>`
  ).join('');

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
      <span style="color:var(--text-dim);font-size:1rem;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.05em;line-height:1;align-self:center">Semana</span>
      <select class="loot-select" id="semana-selector" style="min-width:160px;width:auto;margin-bottom:0">${options}</select>
      <span id="wcl-links" style="display:flex;gap:.5rem;flex-wrap:wrap"></span>
    </div>
    <div id="report-view"></div>`;

  const sel = document.getElementById('semana-selector');
  sel.addEventListener('change', () => {
    const s = semanas.find(s => String(s.semanaNum) === sel.value);
    if (s) renderSemanaView(s);
  });

  // Resolve pending navigation (semanaNum passed via _pendingReportCode)
  let initSemana = semanas[0];
  if (_pendingReportCode !== null) {
    const found = semanas.find(s => s.semanaNum === _pendingReportCode);
    if (found) initSemana = found;
    _pendingReportCode = null;
  }
  if (initSemana) {
    sel.value = String(initSemana.semanaNum);
    renderSemanaView(initSemana);
  }
}

function updateWclLinks(entries) {
  const span = document.getElementById('wcl-links');
  if (!span) return;
  const linkStyle = 'font-size:.82rem;color:var(--text-dim);text-decoration:none;border:1px solid var(--border2);border-radius:5px;padding:.3rem .7rem;transition:color .15s,border-color .15s';
  const hover = `onmouseover="this.style.color='var(--text-bright)';this.style.borderColor='var(--gold)'" onmouseout="this.style.color='var(--text-dim)';this.style.borderColor='var(--border2)'"`;
  const reportCodes = (entries[0]?.reports ?? [entries[0]?.report]).filter(Boolean);
  span.innerHTML = reportCodes.map((code, i) =>
    `<a href="https://www.warcraftlogs.com/reports/${code}" target="_blank" rel="noopener" style="${linkStyle}" ${hover}>${reportCodes.length === 1 ? 'Ver en WarcraftLogs ↗' : `Sesión ${i + 1} ↗`}</a>`
  ).join('');
}

function renderSemanaView(semana) {
  const entries = semana.entries;
  const agg     = agregarSemana(entries);
  const el      = document.getElementById('report-view');
  if (!el) return;
  updateWclLinks(entries);

  // Aggregate death stats across all entries in the semana
  const deathsByName = new Map();
  const timeDeadByName = new Map();
  let firstDieOverall = null;
  for (const e of entries) {
    for (const d of (e.deathStats?.deaths ?? []))
      deathsByName.set(d.name, (deathsByName.get(d.name) ?? 0) + d.count);
    for (const d of (e.deathStats?.timeDead ?? []))
      timeDeadByName.set(d.name, (timeDeadByName.get(d.name) ?? 0) + (d.ms ?? d.total ?? 0));
    if (!firstDieOverall && e.deathStats?.firstToDie) firstDieOverall = e.deathStats.firstToDie;
  }
  const kills       = agg.bosses.filter(b => b.killed).length;
  const totalWipes  = agg.totalWipes;
  const totalDeaths = agg.totalDeaths;

  // notasSemana from any entry
  const notas = entries.find(e => e.notasSemana)?.notasSemana ?? null;
  const notasHtml = notas ? `
    <div class="notas-semana" style="margin-bottom:2rem">${notas.replace(/\n+/g, '<br>')}</div>` : '';

  // Stat cards
  const statsHtml = `<div class="stat-cards" style="margin-bottom:2rem">
    <div class="stat-card"><div class="label">Duración Total</div><div class="value">${fmtDur(agg.totalRaidTime)}</div><div class="sub">${(() => { const n = entries[0]?.reports?.length ?? entries.length; return `${n} sesion${n !== 1 ? 'es' : ''}`; })()}</div></div>
    <div class="stat-card"><div class="label">Boss Kills</div><div class="value" style="color:#7dce82">${kills}</div><div class="sub">${totalWipes} wipe${totalWipes !== 1 ? 's' : ''}</div></div>
    ${firstDieOverall?.name ? `<div class="stat-card"><div class="label">Primero en Morir</div><div class="value" style="font-size:1.4rem;color:var(--red2);font-family:'Barlow',system-ui,sans-serif;font-weight:600">${firstDieOverall.name}</div><div class="sub">${firstDieOverall.timeMs ? `a los ${(firstDieOverall.timeMs / 1000).toFixed(1)}s del pull` : 'abrió el marcador'}</div></div>` : ''}
    <div class="stat-card"><div class="label">DPS / HPS</div><div class="value">${agg.dps ? fmtDps(agg.dps) + ' / ' + fmtDps(agg.hps) : '—'}</div><div class="sub">media kills</div></div>
  </div>`;

  // Boss cards aggregated per semana
  const sscBossesAgg = agg.bosses.filter(b => b.raid === 'SSC');
  const tkBossesAgg  = agg.bosses.filter(b => b.raid === 'TK');

  // Pull full boss detail from entries for wipes/kill times/dps
  function aggBossCard(b) {
    const bEntries = [];
    for (const e of entries)
      for (const be of (e.bosses ?? []))
        if (be.boss === b.boss) bEntries.push(be);
    const bestKill = bEntries.filter(be => be.killed).sort((a, c) => (a.killDurationMs ?? 0) - (c.killDurationMs ?? 0))[0];
    const killMs   = bestKill?.killDurationMs ?? null;
    const preWipes = b.attempts - (b.killed ? 1 : 0);

    // DPS/HPS from all kill attempts of this boss
    let bDmg = 0, bHeal = 0, bDurMs = 0;
    for (const be of bEntries) {
      if (!be.killed) continue;
      for (const d of (be.dpsStats ?? [])) {
        bDmg   += d.totalDmg   ?? 0;
        bHeal  += d.totalHeal  ?? 0;
        bDurMs += d.durationMs ?? 0;
      }
    }
    const bDps = bDurMs > 0 ? Math.round(bDmg  / bDurMs * 1000) : null;
    const bHps = bDurMs > 0 ? Math.round(bHeal / bDurMs * 1000) : null;

    const color = bossColor(b.boss);
    const fmtKill = ms => { const s = Math.floor(ms/1000); const m = Math.floor(s/60); return `${m}m ${String(s%60).padStart(2,'0')}s`; };
    const wipeSub = b.killed
      ? (preWipes > 0 ? `<div class="sub" style="color:var(--red2)">${preWipes} wipe${preWipes !== 1 ? 's' : ''} antes del kill</div>` : '<div class="sub" style="color:var(--green)">sin wipes ✓</div>')
      : `<div class="sub" style="color:var(--red2)">${b.attempts} wipe${b.attempts !== 1 ? 's' : ''}</div>`;
    return `<div class="stat-card">
      <div class="label" style="color:${color};font-size:0.95rem">${BOSS_DISPLAY[b.boss] ?? b.boss}</div>
      <div class="value" style="font-size:1.2rem">${b.killed && killMs ? fmtKill(killMs) : '—'}</div>
      ${bDps ? `<div class="sub">${fmtDps(bDps)} DPS · ${fmtDps(bHps)} HPS</div>` : ''}
      ${wipeSub}
    </div>`;
  }

  const bossHtml = `
    ${sscBossesAgg.length ? `<div style="margin-bottom:.5rem"><span class="raid-badge ssc">SSC</span></div><div class="stat-cards" style="margin-bottom:1.5rem">${sscBossesAgg.map(aggBossCard).join('')}</div>` : ''}
    ${tkBossesAgg.length  ? `<div style="margin-bottom:.5rem"><span class="raid-badge tk">TK</span></div><div class="stat-cards"  style="margin-bottom:1.5rem">${tkBossesAgg.map(aggBossCard).join('')}</div>`  : ''}`;

  // Artista del Desastre / MVP — vergüenza score como F1
  const rosterSet = new Set(entries.flatMap(e => e.roster ?? []));
  const avoidByName = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      for (const m of (b.avoidableDamage ?? []))
        for (const p of (m.players ?? []))
          avoidByName.set(p.name, (avoidByName.get(p.name) ?? 0) + (p.total ?? 0));
  // Include ALL roster players (with 0 for missing) so percentile pool matches getShameRanking
  const deathsList = [...rosterSet].map(name => ({ name, count: deathsByName.get(name) ?? 0 })).sort((a, b) => b.count - a.count);
  const avoidList  = [...rosterSet].map(name => ({ name, total: avoidByName.get(name)  ?? 0 })).sort((a, b) => b.total - a.total);
  // Trolleos: construir listas individuales y calcular percentil combinado
  const starMechLists = [];
  const buildStarList = (map) => [...rosterSet].map(name => ({ name, v: map.get(name) ?? 0 })).sort((a, b) => b.v - a.v);

  const demonsByName2 = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Leotheras')
        for (const d of (b.innerDemons ?? []))
          demonsByName2.set(d.name, (demonsByName2.get(d.name) ?? 0) + d.mcCount);
  if (demonsByName2.size > 0) starMechLists.push(buildStarList(demonsByName2));

  const wrathByName2 = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Solarian')
        for (const d of (b.wrathOfAstromancer ?? []))
          wrathByName2.set(d.name, (wrathByName2.get(d.name) ?? 0) + d.damageToAllies);
  if (wrathByName2.size > 0) starMechLists.push(buildStarList(wrathByName2));

  const staticByName2 = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      if (b.boss === 'Vashj')
        for (const d of (b.staticCharges ?? []))
          staticByName2.set(d.name, (staticByName2.get(d.name) ?? 0) + d.damageToAllies);
  if (staticByName2.size > 0) starMechLists.push(buildStarList(staticByName2));

  // Attendance filter: ≥30% of raids in this semana (counted by WCL report codes, using CLA data if available)
  const semAttCount = new Map();
  let semTotalRaids = 0;
  for (const e of entries) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    const hasCla = codes.some(c => e.claReports?.[c]);
    if (hasCla) {
      for (const c of codes) {
        const jugs = e.claReports?.[c]?.jugadores;
        if (!jugs) continue;
        semTotalRaids++;
        for (const name of Object.keys(jugs))
          semAttCount.set(name, (semAttCount.get(name) ?? 0) + 1);
      }
    } else {
      semTotalRaids += codes.length;
      for (const name of (e.roster ?? []))
        semAttCount.set(name, (semAttCount.get(name) ?? 0) + codes.length);
    }
  }
  const semMinRaids = Math.ceil((semTotalRaids || 1) * 0.3);
  const eligibleRoster = new Set([...rosterSet].filter(name => (semAttCount.get(name) ?? 0) >= semMinRaids));

  function semPctOf(sorted, getValue, name) {
    const n = sorted.length;
    if (n <= 1) return 0;
    const entry = sorted.find(e => e.name === name);
    if (!entry) return 0;
    const targetVal = getValue(entry);
    if (targetVal <= 0) return 0;
    let first = sorted.findIndex(e => getValue(e) === targetVal);
    let last = first;
    while (last + 1 < n && getValue(sorted[last + 1]) === targetVal) last++;
    return (n - 1 - (first + last) / 2) / (n - 1);
  }

  // Compute shame over ALL roster players (same pool as getShameRanking)
  const SHAME_TERMS = starMechLists.some(l => l.length > 0) ? 3 : 2;
  const allShame = rosterSet.size > 1
    ? [...rosterSet].map(name => {
        const dPct = semPctOf(deathsList, e => e.count, name);
        const aPct = semPctOf(avoidList,  e => e.total, name);
        const sPct = SHAME_TERMS === 3
          ? starMechLists.reduce((sum, l) => sum + semPctOf(l, e => e.v, name), 0) / starMechLists.length
          : 0;
        return { name, score: (dPct + aPct + (SHAME_TERMS === 3 ? sPct : 0)) / SHAME_TERMS };
      }).sort((a, b) => b.score - a.score)
    : [];
  // MVP/Artista only from players with ≥30% raid attendance
  const allShameEligible = allShame.filter(e => eligibleRoster.has(e.name));
  const topScore = allShameEligible[0]?.score ?? null;
  const botScore = allShameEligible[allShameEligible.length - 1]?.score ?? null;
  const hazGroup = allShameEligible.filter(e => e.score === topScore);
  const mvpGroup = allShameEligible.filter(e => e.score === botScore);
  const nameFontSize = count => count === 1 ? '1.4rem' : count <= 3 ? '1.1rem' : '0.9rem';
  const renderNames = (group) => group.map(e => `<span class="clickable-player" data-player="${e.name}" style="font-size:inherit">${e.name}</span>`).join(', ');
  const artistaMvpHtml = (hazGroup.length && mvpGroup.length && hazGroup[0].name !== mvpGroup[0].name) ? `
    <div class="two-col" style="margin-bottom:2rem">
      <div class="panel" style="border-color:var(--red2);text-align:center;padding:1.5rem 1.2rem">
        <div style="font-size:2rem;margin-bottom:.4rem">🤦</div>
        <div style="font-family:'Barlow',sans-serif;font-size:.85rem;font-weight:600;color:var(--red2);letter-spacing:.04em;text-transform:uppercase;margin-bottom:.6rem">Artista del Desastre</div>
        <div style="font-size:${nameFontSize(hazGroup.length)};font-weight:700;color:var(--gold)">${renderNames(hazGroup)}</div>
        <div style="color:var(--text-dim);font-size:.82rem;margin-top:.4rem">${(hazGroup[0].score * 100).toFixed(0)}% de vergüenza</div>
      </div>
      <div class="panel" style="border-color:var(--green);text-align:center;padding:1.5rem 1.2rem">
        <div style="font-size:2rem;margin-bottom:.4rem">🌟</div>
        <div style="font-family:'Barlow',sans-serif;font-size:.85rem;font-weight:600;color:var(--green);letter-spacing:.04em;text-transform:uppercase;margin-bottom:.6rem">MVP de la Semana</div>
        <div style="font-size:${nameFontSize(mvpGroup.length)};font-weight:700;color:var(--gold)">${renderNames(mvpGroup)}</div>
        <div style="color:var(--text-dim);font-size:.82rem;margin-top:.4rem">${(mvpGroup[0].score * 100).toFixed(0)}% de vergüenza</div>
      </div>
    </div>` : '';

  // Lo Mejor de la Semana
  let bestDealt = null, bestHeal = null, bestReceived = null, bestTopDps = null, bestTopHps = null, bestMitig = null;
  for (const e of entries) {
    const bh = e.biggestHits;
    if (bh) {
      if ((bh.biggestDealt?.amount    ?? 0) > (bestDealt?.amount    ?? 0)) bestDealt    = bh.biggestDealt;
      if ((bh.biggestHeal?.amount     ?? 0) > (bestHeal?.amount     ?? 0)) bestHeal     = bh.biggestHeal;
      if ((bh.biggestReceived?.amount ?? 0) > (bestReceived?.amount ?? 0)) bestReceived = bh.biggestReceived;
    }
    for (const b of (e.bosses ?? [])) {
      if (!b.killed) continue;
      for (const d of (b.dpsStats ?? [])) {
        if (d.topDps && (d.topDps.dps ?? 0) > (bestTopDps?.dps ?? 0)) bestTopDps = { ...d.topDps, boss: b.boss };
        if (d.topHps && (d.topHps.hps ?? 0) > (bestTopHps?.hps ?? 0)) bestTopHps = { ...d.topHps, boss: b.boss };
      }
      for (const m of (b.tankMitigation ?? [])) {
        if ((m.pct ?? 0) > (bestMitig?.pct ?? 0)) bestMitig = { ...m, boss: b.boss };
      }
    }
  }
  const nightCard = (icon, label, playerName, valueStr, secondary, extra) => `
    <div class="record-card night-card">
      <div class="record-icon">${icon}</div>
      <div class="record-label">${label}</div>
      <div class="record-amount" style="color:var(--f2-accent)">${valueStr}</div>
      <div class="record-who"><span class="clickable-player" data-player="${playerName}">${playerName}</span></div>
      ${secondary ? `<div class="record-ability" style="color:var(--text-dim)">${secondary}</div>` : ''}
      ${extra     ? `<div class="record-ability">${extra}</div>` : ''}
    </div>`;
  const loMejorCards = [
    bestTopDps   ? nightCard('⚡', 'Top DPS',                   bestTopDps.name,       fmtDps(bestTopDps.dps) + ' DPS', BOSS_DISPLAY[bestTopDps.boss] ?? bestTopDps.boss, '') : '',
    bestTopHps   ? nightCard('💊', 'Top HPS',                   bestTopHps.name,       fmtDps(bestTopHps.hps) + ' HPS', BOSS_DISPLAY[bestTopHps.boss] ?? bestTopHps.boss, '') : '',
    bestMitig    ? nightCard('🛡️', 'Top Mitigación',            bestMitig.name,        bestMitig.pct + '%',              BOSS_DISPLAY[bestMitig.boss] ?? bestMitig.boss, '') : '',
    bestDealt    ? nightCard('⚔️', 'Golpe más fuerte',          bestDealt.heroe,       fmtDmg(bestDealt.amount),    '→ ' + (bestDealt.objetivo ?? '?')    + (bestDealt.ability    ? ` · <span style="color:var(--purple2);font-style:italic">${bestDealt.ability}</span>`    : ''), '') : '',
    bestHeal     ? nightCard('💚', 'Cura más gorda',            bestHeal.healer,       fmtDmg(bestHeal.amount),     '→ ' + (bestHeal.target ?? '?')       + (bestHeal.ability     ? ` · <span style="color:var(--purple2);font-style:italic">${bestHeal.ability}</span>`     : ''), '') : '',
    bestReceived ? nightCard('💀', 'Golpe más bestia recibido', bestReceived.victima,  fmtDmg(bestReceived.amount), '← ' + (bestReceived.agresor ?? '?')  + (bestReceived.ability ? ` · <span style="color:var(--purple2);font-style:italic">${bestReceived.ability}</span>` : ''), '') : '',
  ].filter(Boolean).join('');
  const loMejorHtml = loMejorCards ? `
    <div class="section-title" style="margin-top:1rem">Lo Mejor de la Semana</div>
    <div class="records-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:2rem">${loMejorCards}</div>` : '';

  // ── Helpers tablas ──
  const rankClass  = i => i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
  const medalEmoji = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
  function miniTableExpand(headers, rows, emptyMsg) {
    if (!rows.length) return `<div class="section-note">${emptyMsg}</div>`;
    const VISIBLE = 5;
    const extra = rows.length > VISIBLE;
    const rowsHTML = rows.map((r, i) => i >= VISIBLE ? r.replace('<tr', '<tr class="expand-row" style="display:none"') : r).join('');
    const toggleRow = extra ? `<tr class="expand-toggle-row" style="cursor:pointer"><td colspan="${headers.length}" style="text-align:center;padding:.5rem .4rem;color:var(--text-dim);font-size:.82rem;user-select:none">▼ Ver todos (${rows.length})</td></tr>` : '';
    return `<table class="ranked-list"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHTML}${toggleRow}</tbody></table>`;
  }
  const fmtMs2 = v => { const s = Math.floor(v / 1000), m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

  // ── Vergüenza rows ──
  const shameRows = allShame.filter(e => e.score > 0).map((e, i) => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
    <td class="bar-cell">${makeBar(Math.round(e.score * 100))}</td>
    <td class="val-cell">${(e.score * 100).toFixed(0)}%</td>
  </tr>`);

  // ── Trolleos tabla ──
  const starCols = [];
  if (demonsByName2.size > 0) starCols.push({ label: 'Inner Demon<br><small style="color:var(--text-dim);font-weight:400">Leotheras · MC</small>',                          map: demonsByName2, fmt: v => `${v}×` });
  if (wrathByName2.size  > 0) starCols.push({ label: 'Wrath of Astro.<br><small style="color:var(--text-dim);font-weight:400">Solarian · daño a aliados</small>',          map: wrathByName2,  fmt: v => fmtDmg(v) });
  if (staticByName2.size > 0) starCols.push({ label: 'Static Charge<br><small style="color:var(--text-dim);font-weight:400">Vashj · daño a aliados</small>',               map: staticByName2, fmt: v => fmtDmg(v) });

  const starFullTable = (() => {
    if (!starCols.length) return '<div class="section-note">Sin trolleos esta semana. 🎉</div>';
    const playerSet = new Set(starCols.flatMap(c => [...c.map.keys()]));
    const starAllRows = [...playerSet]
      .map(name => ({ name, vals: starCols.map(c => c.map.get(name) ?? 0) }))
      .sort((a, b) => { for (let i = 0; i < a.vals.length; i++) if (a.vals[i] !== b.vals[i]) return b.vals[i] - a.vals[i]; return 0; });
    return `<div style="overflow-x:auto">
      <table class="ranked-list"><thead><tr>
        <th></th><th>Jugador</th>
        ${starCols.map(c => `<th class="val-cell td-dim" style="white-space:nowrap">${c.label}</th>`).join('')}
      </tr></thead><tbody>${starAllRows.map((e, i) => `<tr${i >= 5 ? ' class="expand-row" style="display:none"' : ''}>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
        ${starCols.map((c, j) => `<td class="val-cell td-dim">${e.vals[j] ? c.fmt(e.vals[j]) : '—'}</td>`).join('')}
      </tr>`).join('')}${starAllRows.length > 5 ? `<tr class="expand-toggle-row" style="cursor:pointer"><td colspan="${2 + starCols.length}" style="text-align:center;padding:.5rem .4rem;color:var(--text-dim);font-size:.82rem;user-select:none">▼ Ver todos (${starAllRows.length})</td></tr>` : ''}</tbody></table></div>`;
  })();

  // ── Mecánicas Evitables (tabla completa con columnas por mecánica) ──
  const avoidMechNames = [...new Set(entries.flatMap(e => e.bosses ?? []).flatMap(b => b.avoidableDamage ?? []).map(m => m.mechanic))];
  const avoidFullMap = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      for (const m of (b.avoidableDamage ?? []))
        for (const p of (m.players ?? [])) {
          if (!avoidFullMap.has(p.name)) { const o = { total: 0 }; avoidMechNames.forEach(k => o[k] = 0); avoidFullMap.set(p.name, o); }
          const o = avoidFullMap.get(p.name); o.total += p.total; if (m.mechanic in o) o[m.mechanic] += p.total;
        }
  const avoidSorted = [...avoidFullMap.entries()].map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
  const avoidFullTable = avoidSorted.length ? `<div style="overflow-x:auto">
    <table class="ranked-list"><thead><tr>
      <th></th><th>Jugador</th>
      <th class="val-cell" style="color:var(--red2)">Total</th>
      ${avoidMechNames.map(m => `<th class="val-cell td-dim" style="white-space:nowrap">${m}</th>`).join('')}
    </tr></thead><tbody>${avoidSorted.map((e, i) => `<tr${i >= 5 ? ' class="expand-row" style="display:none"' : ''}>
      <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
      <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
      <td class="val-cell red">${fmtDmg(e.total)}</td>
      ${avoidMechNames.map(m => `<td class="val-cell td-dim">${e[m] ? fmtDmg(e[m]) : '—'}</td>`).join('')}
    </tr>`).join('')}${avoidSorted.length > 5 ? `<tr class="expand-toggle-row" style="cursor:pointer"><td colspan="${2 + avoidMechNames.length + 1}" style="text-align:center;padding:.5rem .4rem;color:var(--text-dim);font-size:.82rem;user-select:none">▼ Ver todos (${avoidSorted.length})</td></tr>` : ''}</tbody></table></div>`
    : '<div class="section-note">¡Nadie recibió daño evitable! 🎉</div>';

  // ── Muertes rows ──
  const deathsSortedArr = [...deathsByName.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const deathMax = deathsSortedArr[0]?.count ?? 1;
  const deathRows = deathsSortedArr.map((e, i) => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
    <td class="bar-cell">${makeBar(Math.round((e.count / deathMax) * 100), 'red')}</td>
    <td class="val-cell red">${e.count} ×</td>
  </tr>`);

  // ── Tiempo Muerto rows ──
  const timeDeadSorted = [...timeDeadByName.entries()].map(([name, ms]) => ({ name, ms })).sort((a, b) => b.ms - a.ms);
  const timeDeadMax = timeDeadSorted[0]?.ms ?? 1;
  const timeDeadRows = timeDeadSorted.map((e, i) => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
    <td class="bar-cell">${makeBar(Math.round((e.ms / timeDeadMax) * 100), 'red')}</td>
    <td class="val-cell red">${fmtMs2(e.ms)}</td>
  </tr>`);

  // ── Interrupts / Dispels rows ──
  const intMap2 = new Map(), dispMap2 = new Map();
  for (const e of entries) {
    for (const d of (e.interrupts ?? [])) intMap2.set(d.name,  (intMap2.get(d.name)  ?? 0) + d.total);
    for (const d of (e.dispels    ?? [])) dispMap2.set(d.name, (dispMap2.get(d.name) ?? 0) + d.total);
  }
  const intsSorted  = [...intMap2.entries()].sort((a, b) => b[1] - a[1]);
  const dispsSorted = [...dispMap2.entries()].sort((a, b) => b[1] - a[1]);
  const intsMax  = intsSorted[0]?.[1]  ?? 1;
  const dispsMax = dispsSorted[0]?.[1] ?? 1;
  const intRows  = intsSorted.map(([name, val], i)  => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${name}">${name}</span></td>
    <td class="bar-cell">${makeBar(Math.round((val / intsMax)  * 100), 'purple')}</td>
    <td class="val-cell purple">${val}</td>
  </tr>`);
  const dispRows = dispsSorted.map(([name, val], i) => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${name}">${name}</span></td>
    <td class="bar-cell">${makeBar(Math.round((val / dispsMax) * 100), 'purple')}</td>
    <td class="val-cell purple">${val}</td>
  </tr>`);

  // ── Mitigación de Tanks rows ──
  const mitigMap = new Map();
  for (const e of entries)
    for (const b of (e.bosses ?? []))
      if (b.killed)
        for (const m of (b.tankMitigation ?? [])) {
          const curr = mitigMap.get(m.name) ?? { reduced: 0, gross: 0 };
          curr.reduced += m.reduced;
          curr.gross   += m.gross;
          mitigMap.set(m.name, curr);
        }
  const mitigSorted = [...mitigMap.entries()]
    .filter(([, v]) => v.gross > 0)
    .map(([name, v]) => ({ name, pct: Math.round(v.reduced / v.gross * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
  const mitigMax = mitigSorted[0]?.pct ?? 1;
  const mitigRows = mitigSorted.map((e, i) => `<tr>
    <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
    <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
    <td class="bar-cell">${makeBar(Math.round((e.pct / mitigMax) * 100), 'purple')}</td>
    <td class="val-cell purple">${e.pct}%</td>
  </tr>`);

  const rankingsHtml = `
    <div style="margin-bottom:2rem">
      <div class="section-title">Vergüenza</div>
      ${miniTableExpand(['', 'Jugador', '', 'Score'], shameRows, 'Sin datos suficientes.')}
    </div>
    <div style="margin-bottom:2rem">
      <div class="section-title">Trolleos a la Raid</div>
      ${starFullTable}
    </div>
    <div style="margin-bottom:2rem">
      <div class="section-title">Mecánicas Evitables</div>
      ${avoidFullTable}
    </div>
    <div class="two-col" style="margin-bottom:2rem">
      <div>
        <div class="section-title">Muertes</div>
        ${miniTableExpand(['', 'Jugador', '', 'Muertes'], deathRows, '¡Nadie murió! 🎉')}
      </div>
      <div>
        <div class="section-title">Tiempo Muerto</div>
        ${miniTableExpand(['', 'Jugador', '', 'Tiempo'], timeDeadRows, 'Sin datos de tiempo muerto.')}
      </div>
    </div>
    <div class="two-col" style="margin-bottom:2rem">
      <div>
        <div class="section-title">Interrupts</div>
        ${miniTableExpand(['', 'Jugador', '', 'Total'], intRows, 'Sin datos de interrupts.')}
      </div>
      <div>
        <div class="section-title">Dispels</div>
        ${miniTableExpand(['', 'Jugador', '', 'Total'], dispRows, 'Sin datos de dispels.')}
      </div>
    </div>
    ${(() => {
      const HEALER_SPECS = new Set(['Restoration', 'Holy', 'Discipline']);
      const specMapW = {};
      for (const e of entries) Object.assign(specMapW, e.playerSpecs ?? {});
      const isHealer = name => HEALER_SPECS.has(specMapW[name]);
      const dpsAgg = new Map(), hpsAgg = new Map();
      for (const e of entries) {
        for (const d of (e.globalDps ?? [])) { const p = dpsAgg.get(d.name) ?? { total: 0, time: 0 }; dpsAgg.set(d.name, { total: p.total + (d.total ?? 0), time: p.time + (d.time ?? 0) }); }
        for (const d of (e.globalHps ?? [])) { const p = hpsAgg.get(d.name) ?? { total: 0, time: 0 }; hpsAgg.set(d.name, { total: p.total + (d.total ?? 0), time: p.time + (d.time ?? 0) }); }
      }
      const dpsArr = [...dpsAgg.entries()].filter(([n]) => !isHealer(n)).map(([name, d]) => ({ name, dps: d.time > 0 ? Math.round(d.total / d.time) : 0 })).sort((a, b) => b.dps - a.dps);
      const hpsArr = [...hpsAgg.entries()].filter(([n]) =>  isHealer(n)).map(([name, d]) => ({ name, hps: d.time > 0 ? Math.round(d.total / d.time) : 0 })).sort((a, b) => b.hps - a.hps);
      const dpsMax = dpsArr[0]?.dps ?? 1, hpsMax = hpsArr[0]?.hps ?? 1;
      const dpsRows = dpsArr.map((e, i) => `<tr>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(Math.round((e.dps / dpsMax) * 100))}</td>
        <td class="val-cell">${fmtDps(e.dps)} DPS</td>
      </tr>`);
      const hpsRows = hpsArr.map((e, i) => `<tr>
        <td class="rank-num ${rankClass(i)}">${medalEmoji(i)}</td>
        <td><span class="clickable-player" data-player="${e.name}">${e.name}</span></td>
        <td class="bar-cell">${makeBar(Math.round((e.hps / hpsMax) * 100), 'green')}</td>
        <td class="val-cell green">${fmtDps(e.hps)} HPS</td>
      </tr>`);
      return (dpsRows.length || hpsRows.length) ? `<div class="two-col" style="margin-bottom:2rem">
        <div><div class="section-title">Media DPS (Boss Kills)</div>${miniTableExpand(['', 'Jugador', '', 'Media DPS'], dpsRows, 'Sin datos de DPS.')}</div>
        <div><div class="section-title">Media HPS (Boss Kills)</div>${miniTableExpand(['', 'Jugador', '', 'Media HPS'], hpsRows, 'Sin datos de HPS.')}</div>
      </div>` : '';
    })()}
    ${mitigRows.length ? `<div style="margin-bottom:2rem"><div class="section-title">Mitigación de Tanks</div>${miniTableExpand(['', 'Tank', '', 'Mitigación'], mitigRows, 'Sin datos de mitigación.')}</div>` : ''}
  `;

  el.innerHTML = `
    <div class="section-title" style="font-size:1.3rem;margin-bottom:1.5rem">Semana ${semana.semanaNum} — ${fmtDate(semana.semana)}</div>
    ${notasHtml}
    ${statsHtml}
    ${bossHtml}
    ${artistaMvpHtml}
    ${loMejorHtml}
    ${rankingsHtml}
  `;
  attachPlayerClicks('#report-view');
  el.querySelectorAll('.expand-toggle-row').forEach(toggleRow => {
    toggleRow.addEventListener('click', () => {
      const table = toggleRow.closest('table');
      const hiddenRows = table.querySelectorAll('.expand-row');
      const expanded = hiddenRows[0]?.style.display !== 'none';
      hiddenRows.forEach(r => { r.style.display = expanded ? 'none' : ''; });
      const td = toggleRow.querySelector('td');
      td.textContent = expanded ? `▼ Ver todos (${hiddenRows.length + 5})` : '▲ Ver menos';
    });
  });
}

// ── HISTORIAL ─────────────────────────────────────────────────────────────────
function renderHistorialTab() {
  const container = document.getElementById('tab-historial');
  if (!historial.length) {
    container.innerHTML = '<div class="empty-msg">No hay raids registradas.</div>';
    return;
  }

  // Best kill time per boss across all reports
  const bestByBoss = new Map();
  for (const e of historial)
    for (const b of (e.bosses ?? []))
      if (b.killed && b.killDurationMs)
        if (!bestByBoss.has(b.boss) || b.killDurationMs < bestByBoss.get(b.boss))
          bestByBoss.set(b.boss, b.killDurationMs);

  // Class colors for roster
  const classMap = {};
  for (const e of historial) Object.assign(classMap, e.playerClasses ?? {});
  const CLS_COLOR = {
    Warrior:'#C69B3A', Paladin:'#F48CBA', Hunter:'#AAD372', Rogue:'#FFF468',
    Priest:'#FFFFFF', Shaman:'#0070DD', Mage:'#68CCEF', Warlock:'#9482C9', Druid:'#FF7C0A',
  };
  const BOSS_ABBR = {
    Lurker:'Lurker', Hydross:'Hydross', Morogrim:'Morogrim',
    Karathress:'Karat.', Leotheras:'Leotheras', Vashj:'Vashj',
    VoidReaver:'V.Reaver', Solarian:'Solarian', Alar:"Al'ar", Kaelthas:"Kael'thas",
  };

  const fmtKillMs = ms => { const s = Math.floor(ms / 1000), m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

  const timeCell = (boss, entry) => {
    const all = (entry.bosses ?? []).filter(x => x.boss === boss);
    const b = all.find(x => x.killed) ?? all[0];
    if (!b) return '<span class="td-dim">—</span>';
    if (!b.killed) return `<span class="td-dim" style="font-size:.8rem">${b.attempts ?? 1}W</span>`;
    if (!b.killDurationMs) return '<span style="color:var(--green);font-size:.85rem">✓</span>';
    const isBest = b.killDurationMs === bestByBoss.get(boss);
    return isBest
      ? `<span class="time-best">★ ${fmtKillMs(b.killDurationMs)}</span>`
      : `<span class="time-normal">${fmtKillMs(b.killDurationMs)}</span>`;
  };

  // Efficiency and DPS for a subset of bosses
  const calcRaidStats = (entry, bossNames) => {
    const rel = (entry.bosses ?? []).filter(b => bossNames.includes(b.boss));
    const kills    = rel.filter(b => b.killed).length;
    const attempts = rel.reduce((s, b) => s + (b.attempts ?? 1), 0);
    const wipes    = attempts - kills;
    const effVal   = attempts > 0 ? Math.round(kills / attempts * 100) : null;
    const effColor = effVal === null ? 'var(--text-dim)' : effVal >= 80 ? 'var(--gold)' : effVal >= 50 ? 'var(--purple2)' : 'var(--red2)';
    let dmg = 0, ms = 0;
    for (const b of rel) { if (!b.killed) continue; for (const d of (b.dpsStats ?? [])) { dmg += d.totalDmg ?? 0; ms += d.durationMs ?? 0; } }
    const dps = ms > 0 ? Math.round(dmg / ms * 1000) : null;
    return { kills, wipes, effVal, effColor, dps };
  };

  const sorted = [...historial].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const buildTable = (label, bossNames, badgeClass) => {
    const entries = sorted.filter(e => (e.bosses ?? []).some(b => bossNames.includes(b.boss)));
    if (!entries.length) return '';

    const getRaidMs = e => (badgeClass === 'ssc' ? e.sscDurationMs : e.tkDurationMs) ?? null;
    let bestRaidMs = null;
    for (const e of entries) {
      const d = getRaidMs(e);
      if (d && (bestRaidMs === null || d < bestRaidMs)) bestRaidMs = d;
    }

    const colCount = 3 + bossNames.length + 3;
    const bossThHtml = bossNames.map(boss =>
      `<th style="text-align:center">${BOSS_ABBR[boss] ?? boss}</th>`
    ).join('');

    const rowsHtml = entries.map(e => {
      const raidDeathStats = badgeClass === 'ssc' ? (e.sscDeathStats ?? e.deathStats) : (e.tkDeathStats ?? e.deathStats);
      const deaths = (raidDeathStats?.deaths ?? []).reduce((s, d) => s + d.count, 0);
      const { kills, wipes, effVal, effColor, dps } = calcRaidStats(e, bossNames);
      const rosterHtml = (e.roster ?? [])
        .map(n => `<span class="clickable-player" data-player="${n}" style="color:${CLS_COLOR[classMap[n]] ?? 'var(--text-dim)'}">${n}</span>`)
        .join('<span style="color:var(--border2)"> · </span>');
      const raidMs = getRaidMs(e);
      const isRaidBest = raidMs != null && raidMs === bestRaidMs;

      return `
        <tr class="historial-row" data-report="${e.reports?.[0] ?? e.report ?? ''}">
          <td><strong style="color:var(--gold)">Sem ${e.semanaNum}</strong></td>
          <td>${isRaidBest ? `<span class="time-best">★ ${fmtDur(raidMs)}</span>` : `<span class="time-normal">${fmtDur(raidMs)}</span>`}</td>
          <td style="white-space:nowrap">${effVal !== null
            ? `<strong style="color:${effColor}">${effVal}%</strong> <span class="td-dim" style="font-size:.78rem">${kills}K/${wipes}W</span>`
            : '<span class="td-dim">—</span>'}</td>
          ${bossNames.map(boss => `<td style="text-align:center;white-space:nowrap">${timeCell(boss, e)}</td>`).join('')}
          <td style="color:var(--gold);white-space:nowrap">${dps ? fmtDps(dps) + ' DPS' : '<span class="td-dim">—</span>'}</td>
          <td class="td-red" style="text-align:center">${deaths || '<span class="td-dim">0</span>'}</td>
          <td style="text-align:right"><button class="h-nav-btn" data-semana="${e.semanaNum}">Ver →</button></td>
        </tr>
        <tr class="historial-detail">
          <td colspan="${colCount}">
            <div class="raid-body-grid">
              <div class="raid-section" style="grid-column:1/-1">
                <div class="raid-section-title">Roster (${(e.roster ?? []).length})</div>
                <span style="font-size:.82rem;line-height:1.9">${rosterHtml || '<span class="td-dim">—</span>'}</span>
              </div>
            </div>
          </td>
        </tr>`;
    }).join('');

    return `
      <div class="section-title" style="margin-bottom:.75rem"><span class="raid-badge ${badgeClass}" style="font-size:.8rem;margin-right:.5rem">${badgeClass.toUpperCase()}</span>${label}</div>
      <table class="historial-table" style="margin-bottom:2.5rem">
        <thead><tr>
          <th>Semana</th>
          <th>Duración</th>
          <th>Efectividad</th>
          ${bossThHtml}
          <th>DPS</th>
          <th style="text-align:center">Muertes</th>
          <th style="text-align:right"></th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
  };

  container.innerHTML =
    buildTable('Serpentshrine Cavern', SSC_BOSSES, 'ssc') +
    buildTable('The Eye', TK_BOSSES, 'tk');

  container.querySelectorAll('.historial-row').forEach(row => {
    row.addEventListener('click', () => {
      row.classList.toggle('open');
      row.nextElementSibling.classList.toggle('open');
    });
  });

  container.querySelectorAll('.h-nav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      navigateToPorSemana(Number(btn.dataset.semana));
    });
  });

  attachPlayerClicks('#tab-historial');
}

// ── CLASES WOW ────────────────────────────────────────────────────────────────

const CLASS_COLOR = {
  Warrior: '#C69B3A', Paladin: '#F48CBA', Hunter: '#AAD372', Rogue: '#FFF468',
  Priest: '#FFFFFF', Shaman: '#0070DD', Mage: '#68CCEF', Warlock: '#8788EE', Druid: '#FF7C0A',
};
const CLASS_ES = {
  Warrior: 'Guerrero', Paladin: 'Paladín', Hunter: 'Cazador', Rogue: 'Pícaro',
  Priest: 'Sacerdote', Shaman: 'Chamán', Mage: 'Mago', Warlock: 'Brujo', Druid: 'Druida',
};
function classIcon(cls, spec) {
  if (!cls) return '';
  const slug = cls.toLowerCase();
  const tooltip = [CLASS_ES[cls] ?? cls, spec].filter(Boolean).join(' · ');
  return `<img src="https://wow.zamimg.com/images/wow/icons/medium/classicon_${slug}.jpg" class="class-icon" title="${tooltip}" alt="${cls}">`;
}

// ── JUGADOR ───────────────────────────────────────────────────────────────────

function openPlayer(name) {
  switchTab('jugador');
  document.getElementById('player-search').value = name;
  document.getElementById('player-suggestions').classList.remove('visible');
  document.getElementById('player-empty').style.display = 'none';
  renderJugador(name);
}

function setupJugador() {
  const input = document.getElementById('player-search');
  const sugg  = document.getElementById('player-suggestions');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { sugg.classList.remove('visible'); return; }
    const matches = getPlayers().filter(p => p.toLowerCase().includes(q)).slice(0, 12);
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

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !sugg.contains(e.target))
      sugg.classList.remove('visible');
  });
}

function renderJugador(name) {
  const profile = document.getElementById('player-profile');
  if (!name) {
    profile.className = '';
    profile.innerHTML = '';
    document.getElementById('player-empty').style.display = '';
    return;
  }
  document.getElementById('player-empty').style.display = 'none';

  const reportsAttended = historial.filter(e => (e.roster ?? []).includes(name));
  if (reportsAttended.length === 0) {
    profile.className = 'visible';
    profile.innerHTML = `<p class="empty-msg">No hay datos para <strong>${name}</strong>.</p>`;
    return;
  }

  const cls      = historial.find(e => e.playerClasses?.[name])?.playerClasses?.[name] ?? '';
  const spec     = historial.find(e => e.playerSpecs?.[name])?.playerSpecs?.[name] ?? '';
  const clsColor = cls ? (CLASS_COLOR[cls] ?? 'var(--text-bright)') : 'var(--text-bright)';
  const clsLabel = [CLASS_ES[cls] ?? cls, spec].filter(Boolean).join(' · ');

  const HEALER_SPECS_P = new Set(['Holy', 'Discipline', 'Restoration']);
  const isHealer = HEALER_SPECS_P.has(spec);

  // Construir rows (igual que F1) con todos los datos por raid
  let totalDeaths = 0, totalAvoid = 0, totalInts = 0, totalDisp = 0;
  const rows = reportsAttended.map(e => {
    const dEntry  = (e.deathStats?.deaths  ?? []).find(x => x.name === name);
    const tEntry  = (e.deathStats?.timeDead ?? []).find(x => x.name === name);
    const intEntry = (e.interrupts ?? []).find(x => x.name === name);
    const disEntry = (e.dispels   ?? []).find(x => x.name === name);
    const d   = dEntry?.count ?? 0;
    const td  = tEntry?.ms ?? tEntry?.total ?? 0;
    const int = intEntry?.total ?? 0;
    const dis = disEntry?.total ?? 0;
    let avoid = 0;
    for (const b of (e.bosses ?? []))
      for (const m of (b.avoidableDamage ?? []))
        for (const p of m.players) if (p.name === name) avoid += p.total;
    totalDeaths += d; totalAvoid += avoid; totalInts += int; totalDisp += dis;

    // Vergüenza de esta raid
    const participants = new Set(e.roster ?? []);
    const n = participants.size;
    let shameScore = null;
    if (n > 1) {
      const pct = (list) => { const idx = list.findIndex(x => x.name === name); return idx === -1 ? 0 : (n - 1 - idx) / (n - 1); };
      const avM = new Map();
      for (const b of (e.bosses ?? []))
        for (const m of (b.avoidableDamage ?? []))
          for (const p of m.players) avM.set(p.name, (avM.get(p.name) ?? 0) + p.total);
      const avS = [...avM.entries()].map(([n2, t]) => ({ name: n2, total: t })).sort((a, b) => b.total - a.total);
      shameScore = ((pct(e.deathStats?.deaths ?? []) + pct(avS)) / 2) * 100;
    }

    // Media DPS/HPS global de la raid
    const globalArr = isHealer ? (e.globalHps ?? []) : (e.globalDps ?? []);
    const globalEntry = globalArr.find(x => x.name === name);
    const perf = isHealer ? (globalEntry?.hps ?? null) : (globalEntry?.dps ?? null);

    // Trolleos: MC count (Leotheras) + daño a aliados (Solarian wrath + Vashj static)
    let mcCount = null, dmgToAllies = null;
    for (const b of (e.bosses ?? [])) {
      const mc = b.innerDemons?.find(x => x.name === name);
      if (mc?.mcCount) mcCount = (mcCount ?? 0) + mc.mcCount;
      const wrath = b.wrathOfAstromancer?.find(x => x.name === name);
      if (wrath?.damageToAllies) dmgToAllies = (dmgToAllies ?? 0) + wrath.damageToAllies;
      const sc = b.staticCharges?.find(x => x.name === name);
      if (sc?.damageToAllies) dmgToAllies = (dmgToAllies ?? 0) + sc.damageToAllies;
    }

    return { fecha: e.fecha, semanaNum: e.semanaNum, d, td, int, dis, avoid, shameScore, hitStats: e.playerHitStats?.[name] ?? null, perf, mcCount, dmgToAllies };
  });

  // Récords personales
  let prHit = null, prHeal = null, prReceived = null;
  for (const r of rows) {
    const h = r.hitStats; if (!h) continue;
    if ((h.biggestHit?.amount      ?? 0) > (prHit?.amount      ?? 0)) prHit      = { ...h.biggestHit,      fecha: r.fecha };
    if ((h.biggestHeal?.amount     ?? 0) > (prHeal?.amount     ?? 0)) prHeal     = { ...h.biggestHeal,     fecha: r.fecha };
    if ((h.biggestReceived?.amount ?? 0) > (prReceived?.amount ?? 0)) prReceived = { ...h.biggestReceived, fecha: r.fecha };
  }
  const hasHitData  = rows.some(r => r.hitStats);
  const hasPerfData = rows.some(r => r.perf != null);

  // Mejor DPS/HPS personal: busca el mejor DPS/HPS del jugador en un boss kill concreto
  let prPerf = null;
  for (const e of reportsAttended) {
    for (const b of (e.bosses ?? [])) {
      if (!b.killed) continue;
      for (const stat of (b.dpsStats ?? [])) {
        const arr = isHealer ? (stat.playerHps ?? []) : (stat.playerDps ?? []);
        const entry = arr.find(x => x.name === name);
        const val = isHealer ? entry?.hps : entry?.dps;
        if (val && (!prPerf || val > prPerf.value))
          prPerf = { value: val, bossName: BOSS_DISPLAY[b.boss] ?? b.boss, fecha: e.fecha };
      }
    }
  }

  const semanasAttended = new Set(reportsAttended.map(e => e.semanaNum)).size;
  const totalTrolleos   = rows.reduce((s, r) => s + (r.dmgToAllies ?? 0), 0);
  const totalMcCount    = rows.reduce((s, r) => s + (r.mcCount    ?? 0), 0);

  // CLA data + accurate raid count — use CLA presence as source of truth per report code.
  // For entries without CLA, fall back to roster (count once per entry, not per code).
  const claRaids = [];
  let reportsCount = 0;
  for (const e of historial) {
    const codes = e.reports ?? (e.report ? [e.report] : []);
    const hasCla = codes.some(c => e.claReports?.[c]);
    if (hasCla) {
      for (const code of codes) {
        const jugador = e.claReports?.[code]?.jugadores?.[name];
        if (!jugador) continue;
        reportsCount++;
        const cons = (jugador.consumiblesScore ?? 0) + (jugador.scrollBonus ?? 0);
        const gear = jugador.gearStats?.gearPrepPct ?? jugador.gearScore ?? null;
        const prep = Math.min(100, Math.round(gear !== null ? (cons + gear) / 2 : cons));
        const fecha = e.claReports[code].fecha ?? e.fecha;
        const [, m, d] = fecha.split('-');
        claRaids.push({ label: `${d}/${m}`, prep, fecha });
      }
    } else if ((e.roster ?? []).includes(name)) {
      reportsCount++;
    }
  }
  claRaids.sort((a, b) => a.fecha.localeCompare(b.fecha));
  const avgPrep = claRaids.length > 0
    ? Math.round(claRaids.reduce((s, r) => s + r.prep, 0) / claRaids.length)
    : null;

  // Title badges — ensure titles are computed even if Logros tab hasn't been visited
  if (!TITULOS_F2) renderLogros();
  const playerTitles = (TITULOS_F2 ?? []).filter(t => t.jugador === name || (t.jugadores ?? []).includes(name));
  const f1Titles  = (window.__F1_ACHIEVEMENTS__?.byPlayer?.[name] ?? []);
  const f1DescMap = getF1DescById();
  const allBadges = [
    ...playerTitles.map(t => `<span class="titulo-badge titulo-badge--${t.tipo}" data-tooltip="${t.desc ?? ''}">${t.icon} ${t.titulo} (F2)</span>`),
    ...f1Titles.map(t => `<span class="titulo-badge titulo-badge--${t.tipo}" data-tooltip="${f1DescMap.get(t.id) ?? ''}">${t.icon} ${t.titulo} (F1)</span>`),
  ];
  const badgesHTML = allBadges.length ? `
    <div class="titulo-badges" style="margin-bottom:1.25rem">
      ${allBadges.join('')}
    </div>` : '';

  profile.className = 'visible';
  profile.innerHTML = `
    <div class="profile-header">
      ${classIcon(cls, spec)}
      <div>
        <div class="profile-name" style="color:${clsColor}">${name}</div>
        ${clsLabel ? `<div class="profile-class">${clsLabel}</div>` : ''}
      </div>
      <button class="profile-loot-btn" onclick="goToLootJugador('${name}')">🎁 Ver loot</button>
    </div>
    ${badgesHTML}
    <div class="profile-stats">
      <div class="pstat"><div class="plabel">Raids</div><div class="pval purple">${reportsCount}</div></div>
      ${avgPrep !== null ? `<div class="pstat"><div class="plabel">Prep. Media</div><div class="pval" style="color:${_claColor(avgPrep)}">${avgPrep}%</div></div>` : ''}
      <div class="pstat"><div class="plabel">Evitables</div><div class="pval red">${fmtDmg(totalAvoid)}</div></div>
      <div class="pstat" data-tooltip="Daño a aliados: Wrath of the Astromancer (Solarian) + Static Charge (Vashj)<br>MC: veces controlado por Inner Demon (Leotheras)" style="cursor:default"><div class="plabel">Trolleos</div><div class="pval red" style="font-size:1rem;white-space:nowrap">${[totalTrolleos ? fmtDmg(totalTrolleos) : '', totalMcCount ? totalMcCount + '× MC' : ''].filter(Boolean).join(' · ') || '—'}</div></div>
      <div class="pstat"><div class="plabel">Muertes</div><div class="pval red">${totalDeaths}</div></div>
      <div class="pstat"><div class="plabel">Interrupts</div><div class="pval purple">${totalInts}</div></div>
      <div class="pstat"><div class="plabel">Dispels</div><div class="pval purple">${totalDisp}</div></div>
    </div>
    ${hasHitData || prPerf ? `
    <div class="section-title">Récords Personales</div>
    <div class="records-grid" style="margin-bottom:1.5rem${prPerf ? ';grid-template-columns:repeat(4,1fr)' : ''}">
      ${prPerf ? `<div class="record-card"><div class="record-icon">${isHealer ? '💊' : '⚡'}</div><div class="record-label">Mejor ${isHealer ? 'HPS' : 'DPS'}</div><div class="record-amount">${fmtDps(prPerf.value)} ${isHealer ? 'HPS' : 'DPS'}</div>${prPerf.bossName ? `<div class="record-ability">${prPerf.bossName}</div>` : ''}<div class="record-date">${fmtDate(prPerf.fecha)}</div></div>` : ''}
      ${prHit      ? `<div class="record-card"><div class="record-icon">⚔️</div><div class="record-label">Mayor golpe dado</div><div class="record-amount">${fmtDmg(prHit.amount)}</div><div class="record-who">${name} → ${prHit.target ?? '?'}</div>${prHit.ability ? `<div class="record-ability">${prHit.ability}</div>` : ''}<div class="record-date">${fmtDate(prHit.fecha)}</div></div>` : ''}
      ${prHeal     ? `<div class="record-card"><div class="record-icon">💚</div><div class="record-label">Mayor curación</div><div class="record-amount">${fmtDmg(prHeal.amount)}</div><div class="record-who">${name} → ${prHeal.target ?? '?'}</div>${prHeal.ability ? `<div class="record-ability">${prHeal.ability}</div>` : ''}<div class="record-date">${fmtDate(prHeal.fecha)}</div></div>` : ''}
      ${prReceived ? `<div class="record-card"><div class="record-icon">💀</div><div class="record-label">Mayor golpe recibido</div><div class="record-amount">${fmtDmg(prReceived.amount)}</div><div class="record-who">${prReceived.source ?? '?'} → ${name}</div>${prReceived.ability ? `<div class="record-ability">${prReceived.ability}</div>` : ''}<div class="record-date">${fmtDate(prReceived.fecha)}</div></div>` : ''}
    </div>` : ''}
    ${claRaids.length >= 1 ? `
      <div class="section-title">Evolución de Preparación</div>
      <div class="prog-chart" style="margin-bottom:1.5rem">
        ${drawLineChart(claRaids.map(r => r.label), [{ label: 'PREP %', color: '#7dce82', values: claRaids.map(r => r.prep) }], v => Math.round(v) + '%', 100)}
      </div>` : ''}
    ${(() => {
      if (reportsAttended.length < 1) return '';
      const sorted = [...reportsAttended].sort((a, b) => a.fecha.localeCompare(b.fecha));
      const xLabels = sorted.map(e => fmtDate(e.fecha));
      const shameValues = sorted.map(e => {
        const participants = new Set(e.roster ?? []);
        const n = participants.size;
        if (n <= 1) return null;
        const pct = (list) => { const idx = list.findIndex(x => x.name === name); return idx === -1 ? 0 : (n - 1 - idx) / (n - 1); };
        const avM = new Map();
        for (const b of (e.bosses ?? []))
          for (const m of (b.avoidableDamage ?? []))
            for (const p of m.players) avM.set(p.name, (avM.get(p.name) ?? 0) + p.total);
        const avS = [...avM.entries()].map(([n2, t]) => ({ name: n2, total: t })).sort((a, b) => b.total - a.total);
        return ((pct(e.deathStats?.deaths ?? []) + pct(avS)) / 2) * 100;
      });
      const series = [{ label: 'Vergüenza', color: 'var(--red2)', values: shameValues }];
      return `
        <div class="section-title">Evolución del Score de Vergüenza</div>
        <div class="prog-chart" style="margin-bottom:1.5rem">
          ${drawLineChart(xLabels, series, v => v.toFixed(0) + '%', 100)}
        </div>`;
    })()}
    <div class="section-title">Histórico por Raid</div>
    <table class="raid-table">
      <thead><tr>
        <th>Semana</th>
        ${hasPerfData ? `<th>${isHealer ? 'Media HPS' : 'Media DPS'}</th>` : ''}
        <th>Vergüenza</th>
        <th>Mec. Evitables</th>
        <th>Trolleos</th>
        <th>Muertes</th>
        <th>T. Muerto</th>
        <th>Interrupts</th>
        <th>Dispels</th>
        ${hasHitData ? '<th>Mayor Golpe</th><th>Mayor Cura</th><th>Mayor Recibido</th>' : ''}
      </tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td class="td-gold" title="${r.fecha}">Sem. ${r.semanaNum}</td>
          ${hasPerfData ? `<td style="color:${isHealer ? '#4ec97e' : 'var(--gold)'}">${r.perf ? fmtDps(r.perf) : '<span class="td-dim">—</span>'}</td>` : ''}
          <td class="td-red">${r.shameScore != null ? r.shameScore.toFixed(0) + '%' : '<span class="td-dim">—</span>'}</td>
          <td class="td-red">${r.avoid ? fmtDmg(r.avoid) : '<span class="td-dim">—</span>'}</td>
          <td class="td-gold">${[r.dmgToAllies ? fmtDmg(r.dmgToAllies) + ' aliados' : '', r.mcCount ? r.mcCount + '× MC' : ''].filter(Boolean).join(' · ') || '<span class="td-dim">—</span>'}</td>
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
    ${(() => {
      const f1Ach = window.__F1_ACHIEVEMENTS__;
      const titles = f1Ach?.byPlayer?.[name];
      if (!titles || titles.length === 0) return '';
      const descMap = getF1DescById();
      return `
    <div class="section-title" style="margin-top:2rem">Legado de Fase 1</div>
    <div style="margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.6rem">
      ${titles.map(t => {
        const color = (t.tipo === 'shame') ? 'var(--red2)' : '#4ec97e';
        const desc  = descMap.get(t.id) ?? '';
        return `<div style="display:flex;align-items:baseline;gap:.6rem;padding:.55rem .9rem;background:var(--bg2);border:1px solid var(--border);border-left:3px solid ${color};border-radius:6px">
          <span style="font-size:1.15rem">${t.icon}</span>
          <div>
            <div style="font-size:.95rem;font-weight:700;color:${color}">${t.titulo}</div>
            <div style="font-size:.78rem;color:var(--text-dim);margin-top:.1rem">${desc}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
    })()}
  `;
  _attachChartTooltips(profile);
}

// ── LOOT ──────────────────────────────────────────────────────────────────────

const LOOT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1DGpJobX1aH2Q2GRIBeXDvPZmEOAgapIvwopLoKl42Jc/gviz/tq?sheet=Data%20F2';
const SHEET_BASE     = 'https://docs.google.com/spreadsheets/d/1DGpJobX1aH2Q2GRIBeXDvPZmEOAgapIvwopLoKl42Jc/gviz/tq?sheet=';
const ASSIGNED       = new Set(['BiS', 'Upgrade', 'Off-Spec']);
const ICON_MAP       = {};
const QUALITY_MAP    = {};

let lootRows          = null;
let lootLoaded        = false;
let _dataReady        = false;
let _iconsReady       = false;
let _qualityFetchDone = false;
let _currentRaidKey   = null;

function normalizeInstance(inst) {
  if (!inst) return inst;
  const l = inst.toLowerCase();
  if (l.includes('serpent') || l.includes('ssc')) return 'SSC';
  if (l.includes('tempest') || l.includes('tk'))  return 'TK';
  return inst;
}
function isDisenchant(resp) { return resp === 'Disenchant' || resp === 'Desencantar'; }
function stripBrackets(s)   { if (!s) return ''; return s.startsWith('[') && s.endsWith(']') ? s.slice(1, -1) : s; }
function makeBar(pct)       { return `<div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>`; }

function itemIcon(id) {
  if (!id) return '';
  const icon = ICON_MAP[String(id)];
  const src  = icon ? `https://wow.zamimg.com/images/wow/icons/small/${icon}.jpg` : '';
  return `<img class="item-icon" data-itemid="${id}"${src ? ` src="${src}"` : ''} alt="">`;
}

async function fetchMissingIcons(tableId = 'loot-items-table') {
  const imgs = [...document.querySelectorAll(`#${tableId} .item-icon[data-itemid]:not([src])`)];
  if (!imgs.length) return;
  const ids = [...new Set(imgs.map(img => img.dataset.itemid))];
  await Promise.all(ids.map(async id => {
    if (ICON_MAP[id] !== undefined) return;
    try {
      const res = await fetch(`https://nether.wowhead.com/tbc/tooltip/item/${id}?locale=0`);
      const d   = await res.json();
      ICON_MAP[id] = d.icon ? d.icon.toLowerCase() : null;
      if (d.quality !== undefined) QUALITY_MAP[id] = d.quality;
    } catch { ICON_MAP[id] = null; }
  }));
  document.querySelectorAll(`#${tableId} .item-icon[data-itemid]`).forEach(img => {
    const icon = ICON_MAP[img.dataset.itemid];
    if (icon) img.src = `https://wow.zamimg.com/images/wow/icons/small/${icon}.jpg`;
  });
}

async function prefetchDisenchantQualities() {
  if (!lootRows) return;
  const ids = [...new Set(lootRows.filter(r => isDisenchant(r.response) && r.itemID).map(r => String(r.itemID)))]
    .filter(id => QUALITY_MAP[id] === undefined);
  await Promise.all(ids.map(async id => {
    if (QUALITY_MAP[id] !== undefined) return;
    try {
      const res = await fetch(`https://nether.wowhead.com/tbc/tooltip/item/${id}?locale=0`);
      const d   = await res.json();
      ICON_MAP[id]    = d.icon ? d.icon.toLowerCase() : null;
      QUALITY_MAP[id] = d.quality ?? null;
    } catch { QUALITY_MAP[id] = null; }
  }));
  _qualityFetchDone = true;
  if (_currentRaidKey) renderLootRaid(_currentRaidKey);
}

function _checkLootReady() {
  if (!_dataReady || !_iconsReady) return;
  lootLoaded = true;
  buildLootResumen();
  buildLootRegistroShell();
  _calcMimadoF2();
  prefetchDisenchantQualities();
  if (window._pendingLootJugador) {
    const nombre = window._pendingLootJugador;
    delete window._pendingLootJugador;
    goToLootJugador(nombre);
  }
}

function fetchLootData() {
  if (lootLoaded) return;

  window.__lootCallback = function(json) {
    delete window.__lootCallback;
    try {
      const cols = json.table.cols;
      const idx  = {};
      cols.forEach((c, i) => { if (c.label) idx[c.label] = i; });
      const get = (row, label) => { const i = idx[label]; return i !== undefined && row.c[i] ? row.c[i].v : null; };
      lootRows = (json.table.rows || []).filter(r => r && r.c).map(row => {
        const rawDate = get(row, 'date');
        let dateStr = '';
        if (typeof rawDate === 'string' && rawDate.startsWith('Date(')) {
          const [y, m, d] = rawDate.slice(5, -1).split(',').map(Number);
          dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        const rawTime = get(row, 'time');
        let timeMinutes = -1;
        if (rawTime !== null) {
          if (typeof rawTime === 'string') {
            if (rawTime.startsWith('TimeOfDay(')) {
              const parts = rawTime.slice(10, -1).split(',').map(Number);
              timeMinutes = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
            } else if (rawTime.startsWith('Date(')) {
              const parts = rawTime.slice(5, -1).split(',').map(Number);
              timeMinutes = (parts[3] ?? 0) * 60 + (parts[4] ?? 0);
            }
          } else if (typeof rawTime === 'number') {
            timeMinutes = Math.round(rawTime * 24 * 60);
          }
        }
        let raidDate = dateStr;
        if (timeMinutes >= 0 && timeMinutes < 300 && dateStr) {
          const d2 = new Date(dateStr + 'T00:00:00');
          d2.setDate(d2.getDate() - 1);
          raidDate = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
        }
        const rawInstance = get(row, 'instance');
        return {
          nombre:             get(row, 'Nombre'),
          date:               dateStr,
          timeMinutes,
          raidDate,
          instance:           rawInstance,
          normalizedInstance: normalizeInstance(rawInstance),
          item:               get(row, 'item'),
          itemID:             get(row, 'itemID'),
          response:           get(row, 'response'),
          boss:               get(row, 'boss'),
        };
      }).filter(r => r.nombre && r.item);
    } catch(e) {
      const el = document.getElementById('loot-resumen-inner');
      if (el) el.innerHTML = `<div class="loot-loading">Error al procesar loot: ${e.message}</div>`;
    }
    _dataReady = true;
    _checkLootReady();
  };
  const s1 = document.createElement('script');
  s1.src = LOOT_SHEET_URL + '&tqx=responseHandler:__lootCallback';
  s1.onerror = () => {
    const el = document.getElementById('loot-resumen-inner');
    if (el) el.innerHTML = '<div class="loot-loading">No se pudieron cargar los datos. Comprueba que el sheet es público.</div>';
    _dataReady = true;
    _checkLootReady();
  };
  document.head.appendChild(s1);

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
    } catch (_) {}
    _iconsReady = true;
    _checkLootReady();
  };
  const s2 = document.createElement('script');
  s2.src = SHEET_BASE + 'IconCache&tqx=responseHandler:__iconCacheCallback';
  s2.onerror = () => { _iconsReady = true; _checkLootReady(); };
  document.head.appendChild(s2);
}

function buildLootResumen() {
  const CHAMPION_TIP = `<span style='color:#F48CBA'>Paladin</span> · <span style='color:#FFF468'>Rogue</span> · <span style='color:#0070DD'>Shaman</span>`;
  const DEFENDER_TIP = `<span style='color:#C69B3A'>Warrior</span> · <span style='color:#FFFFFF'>Priest</span> · <span style='color:#FF7C0A'>Druid</span>`;
  const HERO_TIP     = `<span style='color:#AAD372'>Hunter</span> · <span style='color:#3FC7EB'>Mage</span> · <span style='color:#8788EE'>Warlock</span>`;

  const byPlayer = new Map();
  let totDE = 0, totBank = 0, totBis = 0, totUpgrade = 0, totOffspec = 0;
  let totChampion = 0, totDefender = 0, totHero = 0;
  lootRows.forEach(r => {
    if (!byPlayer.has(r.nombre)) byPlayer.set(r.nombre, { bis: 0, upgrade: 0, offspec: 0, total: 0, tier: 0 });
    const p = byPlayer.get(r.nombre);
    const isTier = r.item && r.item.includes('Vanquished');
    const tierType = isTier
      ? (r.item.includes('Champion') ? 'Champion' : r.item.includes('Defender') ? 'Defender' : r.item.includes('Hero') ? 'Hero' : null)
      : null;
    if      (r.response === 'BiS')     { p.bis++;     p.total++; totBis++; }
    else if (r.response === 'Upgrade') { p.upgrade++; p.total++; totUpgrade++; }
    else if (r.response === 'Off-Spec'){ p.offspec++; p.total++; totOffspec++; }
    else if (isDisenchant(r.response)) totDE++;
    else if (r.response === 'Banking') totBank++;
    if (ASSIGNED.has(r.response) && tierType) {
      p.tier++;
      if (tierType === 'Champion') totChampion++;
      else if (tierType === 'Defender') totDefender++;
      else if (tierType === 'Hero') totHero++;
    }
  });
  const totAssigned = totBis + totUpgrade + totOffspec;
  const rows = [...byPlayer.entries()].map(([name, s]) => ({ name, ...s })).sort((a, b) => b.bis - a.bis || b.total - a.total);
  const maxTotal = rows[0]?.total || 1;

  const classMap = {};
  for (const e of historial) Object.assign(classMap, e.playerClasses ?? {});

  document.getElementById('loot-resumen-inner').innerHTML = `
    <style>#loot-resumen-inner .loot-stat-card{padding:.6rem .5rem;min-width:0;flex:1}#loot-resumen-inner .lsc-val{font-size:1.5rem}</style>
    <div class="loot-stat-cards" style="flex-wrap:nowrap">
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-bright)">${totAssigned}</div><div class="lsc-label">Items</div></div>
      <div class="loot-stat-card"><div class="lsc-val">${totBis}</div><div class="lsc-label">BiS</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--purple2)">${totUpgrade}</div><div class="lsc-label">Upgrade</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:#87ceeb">${totOffspec}</div><div class="lsc-label">Off-Spec</div></div>
      <div style="width:1px;background:var(--border);margin:0 0.25rem;align-self:stretch;flex-shrink:0"></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totDE}</div><div class="lsc-label">Desenc.</div></div>
      <div class="loot-stat-card"><div class="lsc-val" style="color:var(--text-dim)">${totBank}</div><div class="lsc-label">Banking</div></div>
      <div style="width:1px;background:var(--border);margin:0 0.25rem;align-self:stretch;flex-shrink:0"></div>
      <div class="loot-stat-card" data-tooltip="${CHAMPION_TIP}" style="cursor:help;flex-shrink:0"><div class="lsc-val" style="color:#7eb8f7">${totChampion}</div><div class="lsc-label">Champion</div></div>
      <div class="loot-stat-card" data-tooltip="${DEFENDER_TIP}" style="cursor:help;flex-shrink:0"><div class="lsc-val" style="color:#5dcf8a">${totDefender}</div><div class="lsc-label">Defender</div></div>
      <div class="loot-stat-card" data-tooltip="${HERO_TIP}"     style="cursor:help;flex-shrink:0"><div class="lsc-val" style="color:#f59e42">${totHero}</div><div class="lsc-label">Hero</div></div>
    </div>
    <div class="section-title">Por Jugador</div>
    <table class="ranked-list">
      <thead><tr>
        <th>Jugador</th>
        <th style="text-align:right">BiS</th>
        <th style="text-align:right">Upgrade</th>
        <th style="text-align:right">Off-Spec</th>
        <th style="text-align:right">Total</th>
        <th style="text-align:right;color:#f59e42">Tier</th>
        <th class="bar-cell"></th>
      </tr></thead>
      <tbody>
        ${rows.map(r => {
          const cls = classMap[r.name] ?? '';
          const nameColor = cls ? (CLASS_COLOR[cls] ?? 'var(--text-bright)') : 'var(--text-bright)';
          return `<tr>
          <td class="player-link" style="cursor:pointer;color:${nameColor}" onclick="goToLootRegistro('${r.name}')">${r.name}</td>
          <td class="val-cell">${r.bis || '<span class="td-dim">—</span>'}</td>
          <td class="val-cell purple">${r.upgrade || '<span class="td-dim">—</span>'}</td>
          <td style="color:#87ceeb;font-family:'Cinzel',serif;font-size:.9rem;font-weight:600;text-align:right">${r.offspec || '<span class="td-dim">—</span>'}</td>
          <td style="color:var(--text-bright);font-family:'Cinzel',serif;font-size:.9rem;font-weight:600;text-align:right">${r.total || '—'}</td>
          <td style="color:#f59e42;font-family:'Cinzel',serif;font-size:.9rem;font-weight:600;text-align:right">${r.tier || '<span class="td-dim">—</span>'}</td>
          <td class="bar-cell">${makeBar(Math.round((r.total / maxTotal) * 100))}</td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function buildLootRegistroShell() {
  const players = [...new Set(lootRows.map(r => r.nombre))].sort();
  const raidsByInstance = new Map();
  lootRows.filter(r => ASSIGNED.has(r.response) && r.normalizedInstance && r.raidDate).forEach(r => {
    if (!raidsByInstance.has(r.normalizedInstance)) raidsByInstance.set(r.normalizedInstance, new Set());
    raidsByInstance.get(r.normalizedInstance).add(r.raidDate);
  });
  const instances = [...raidsByInstance.keys()].sort();

  document.getElementById('loot-registro-inner').innerHTML = `
    <div class="section-title">Registro de Loot · Fase 2</div>
    <div class="sub-nav" id="sub-nav-loot-reg">
      <button class="sub-tab-btn active" data-loot-sub="jugador">Por Jugador</button>
      <button class="sub-tab-btn" data-loot-sub="raid">Por Raid</button>
    </div>
    <div class="sub-tab-content active" id="loot-sub-jugador">
      <select class="loot-select" id="loot-player-select">
        <option value="">— Selecciona un jugador —</option>
        ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
      <div id="loot-player-detail"></div>
    </div>
    <div class="sub-tab-content" id="loot-sub-raid">
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.5rem">
        <select class="loot-select" id="loot-instance-select" style="margin-bottom:0;max-width:220px">
          <option value="">— Selecciona una raid —</option>
          ${instances.map(i => `<option value="${i}">${i}</option>`).join('')}
        </select>
        <select class="loot-select" id="loot-date-select" style="margin-bottom:0;max-width:200px" disabled>
          <option value="">— Selecciona fecha —</option>
        </select>
      </div>
      <div id="loot-raid-detail"></div>
    </div>
  `;

  document.querySelectorAll('#sub-nav-loot-reg .sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#sub-nav-loot-reg .sub-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sub = btn.dataset.lootSub;
      document.getElementById('loot-sub-jugador').classList.toggle('active', sub === 'jugador');
      document.getElementById('loot-sub-raid').classList.toggle('active', sub === 'raid');
    });
  });

  document.getElementById('loot-player-select').addEventListener('change', e => renderLootPlayer(e.target.value));

  function selectInstance(inst) {
    const instSel = document.getElementById('loot-instance-select');
    const dateSel = document.getElementById('loot-date-select');
    instSel.value = inst;
    document.getElementById('loot-raid-detail').innerHTML = '';
    if (inst) {
      const dates = [...(raidsByInstance.get(inst) ?? [])].sort().reverse();
      dateSel.innerHTML = '<option value="">— Selecciona fecha —</option>' +
        dates.map(d => `<option value="${inst}|${d}">${fmtDate(d)}</option>`).join('');
      dateSel.disabled = false;
      if (dates.length) { dateSel.value = `${inst}|${dates[0]}`; renderLootRaid(dateSel.value); }
    } else {
      dateSel.innerHTML = '<option value="">— Selecciona fecha —</option>';
      dateSel.disabled = true;
    }
  }

  document.getElementById('loot-instance-select').addEventListener('change', e => selectInstance(e.target.value));
  document.getElementById('loot-date-select').addEventListener('change', e => renderLootRaid(e.target.value));

  let latestInst = instances[0] ?? '', latestDate = '';
  raidsByInstance.forEach((dates, inst) => {
    const top = [...dates].sort().reverse()[0] ?? '';
    if (top > latestDate) { latestDate = top; latestInst = inst; }
  });
  document.querySelector('#sub-nav-loot-reg [data-loot-sub="raid"]').addEventListener('click', () => {
    const instSel = document.getElementById('loot-instance-select');
    if (!instSel.value && latestInst) selectInstance(latestInst);
  });
}

function renderLootPlayer(nombre) {
  const el = document.getElementById('loot-player-detail');
  if (!nombre) { el.innerHTML = ''; return; }
  const allPlayerRows = lootRows.filter(r => r.nombre === nombre);
  if (!allPlayerRows.length) {
    el.innerHTML = `<div class="loot-loading">No hay loot registrado para <strong>${nombre}</strong>.</div>`;
    return;
  }
  const items = allPlayerRows.filter(r => ASSIGNED.has(r.response)).sort((a, b) => b.date.localeCompare(a.date));
  const counts = {};
  items.forEach(r => { counts[r.response] = (counts[r.response] || 0) + 1; });
  const chipColor = { BiS: '', Upgrade: 'purple', 'Off-Spec': 'blue' };

  el.innerHTML = `
    <div class="loot-chips">
      <div class="loot-chip"><div class="chip-val" style="color:var(--text-bright)">${items.length}</div><div class="chip-label">Total</div></div>
      ${['BiS', 'Upgrade', 'Off-Spec'].map(k => `<div class="loot-chip">
        <div class="chip-val ${chipColor[k] || ''}">${counts[k] || 0}</div>
        <div class="chip-label">${k}</div>
      </div>`).join('')}
    </div>
    <table class="ranked-list" id="loot-items-table">
      <thead><tr><th>Fecha</th><th>Item</th><th>Boss</th><th>Tipo</th></tr></thead>
      <tbody>
        ${items.map(r => `<tr>
          <td class="td-gold" style="white-space:nowrap">${
            r.raidDate && r.normalizedInstance
              ? `<span style="cursor:pointer" onclick="goToLootRaid('${r.normalizedInstance}','${r.raidDate}')">${fmtDate(r.raidDate)}</span>`
              : r.date ? fmtDate(r.date) : '—'
          }</td>
          <td style="white-space:nowrap">${r.itemID
            ? `<a class="item-link" href="https://www.wowhead.com/tbc/item=${r.itemID}" target="_blank">${itemIcon(r.itemID)}${stripBrackets(r.item)}</a>`
            : stripBrackets(r.item)}</td>
          <td class="td-dim" style="font-size:.85rem">${r.boss === 'Unknown' ? 'Trash' : r.boss || '—'}</td>
          <td>${lootBadge(r.response)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;
  fetchMissingIcons();
}

function renderLootRaid(raidKey) {
  _currentRaidKey = raidKey;
  const el = document.getElementById('loot-raid-detail');
  if (!raidKey) { el.innerHTML = ''; return; }
  const sep      = raidKey.indexOf('|');
  const instance = raidKey.slice(0, sep);
  const raidDate = raidKey.slice(sep + 1);
  const normTime = t => (t >= 0 && t < 300 ? t + 1440 : t >= 0 ? t : 9999);

  const allRaidRows = lootRows.filter(r => r.normalizedInstance === instance && r.raidDate === raidDate);
  const items   = allRaidRows.filter(r => ASSIGNED.has(r.response)).sort((a, b) => normTime(a.timeMinutes) - normTime(b.timeMinutes));
  const deItems = allRaidRows
    .filter(r => isDisenchant(r.response) && r.itemID && (QUALITY_MAP[String(r.itemID)] ?? -1) >= 4)
    .sort((a, b) => normTime(a.timeMinutes) - normTime(b.timeMinutes));

  const counts = {};
  items.forEach(r => { counts[r.response] = (counts[r.response] || 0) + 1; });
  const totDE   = allRaidRows.filter(r => isDisenchant(r.response)).length;
  const totBank = allRaidRows.filter(r => r.response === 'Banking').length;
  const chipColor = { BiS: '', Upgrade: 'purple', 'Off-Spec': 'blue' };

  const deSection = deItems.length
    ? `<h4 style="margin:1.2rem 0 0.5rem;color:var(--purple2);font-size:.85rem;letter-spacing:.05em">DESENCANTADOS ÉPICOS+</h4>
      <table class="ranked-list" id="loot-raid-de-table">
        <thead><tr><th>Item</th><th>Jugador</th><th>Boss</th></tr></thead>
        <tbody>${deItems.map(r => `<tr>
          <td style="white-space:nowrap">${r.itemID ? `<a class="item-link" href="https://www.wowhead.com/tbc/item=${r.itemID}" target="_blank">${itemIcon(r.itemID)}${stripBrackets(r.item)}</a>` : stripBrackets(r.item)}</td>
          <td class="player-link" style="cursor:pointer" onclick="goToLootJugador('${r.nombre}')">${r.nombre}</td>
          <td class="td-dim" style="font-size:.85rem">${r.boss === 'Unknown' ? 'Trash' : r.boss || '—'}</td>
        </tr>`).join('')}</tbody>
      </table>`
    : (!_qualityFetchDone && totDE > 0 ? '<p style="color:var(--text-dim);font-size:.8rem;margin-top:1rem">Cargando calidades de desencantos...</p>' : '');

  el.innerHTML = `
    <div class="loot-chips">
      <div class="loot-chip"><div class="chip-val" style="color:var(--text-bright)">${items.length}</div><div class="chip-label">Total</div></div>
      ${['BiS', 'Upgrade', 'Off-Spec'].map(k => `<div class="loot-chip">
        <div class="chip-val ${chipColor[k] || ''}">${counts[k] || 0}</div>
        <div class="chip-label">${k}</div>
      </div>`).join('')}
      <div style="width:1px;background:var(--border);margin:0 0.1rem;align-self:stretch"></div>
      <div class="loot-chip"><div class="chip-val dim">${totDE}</div><div class="chip-label">Desenc.</div></div>
      <div class="loot-chip"><div class="chip-val dim">${totBank}</div><div class="chip-label">Banking</div></div>
    </div>
    <table class="ranked-list" id="loot-raid-table">
      <thead><tr><th>Item</th><th>Jugador</th><th>Boss</th><th>Tipo</th></tr></thead>
      <tbody>${items.map(r => `<tr>
        <td style="white-space:nowrap">${r.itemID ? `<a class="item-link" href="https://www.wowhead.com/tbc/item=${r.itemID}" target="_blank">${itemIcon(r.itemID)}${stripBrackets(r.item)}</a>` : stripBrackets(r.item)}</td>
        <td class="player-link" style="cursor:pointer" onclick="goToLootJugador('${r.nombre}')">${r.nombre}</td>
        <td class="td-dim" style="font-size:.85rem">${r.boss === 'Unknown' ? 'Trash' : r.boss || '—'}</td>
        <td>${lootBadge(r.response)}</td>
      </tr>`).join('')}</tbody>
    </table>
    ${deSection}
  `;
  fetchMissingIcons('loot-raid-table');
  if (deItems.length) fetchMissingIcons('loot-raid-de-table');
}

function goToLootJugador(nombre) {
  switchTab('loot-registro');
  if (!lootLoaded) {
    const el = document.getElementById('loot-player-detail');
    if (el) el.innerHTML = '<div class="loot-loading">Cargando datos de loot...</div>';
    window._pendingLootJugador = nombre;
    return;
  }
  document.querySelectorAll('#sub-nav-loot-reg .sub-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('#sub-nav-loot-reg [data-loot-sub="jugador"]')?.classList.add('active');
  document.getElementById('loot-sub-jugador')?.classList.add('active');
  document.getElementById('loot-sub-raid')?.classList.remove('active');
  const sel = document.getElementById('loot-player-select');
  if (sel) { sel.value = nombre; renderLootPlayer(nombre); }
}

function goToLootRegistro(nombre) {
  switchTab('loot-registro');
  if (!lootLoaded) { window._pendingLootJugador = nombre; return; }
  document.querySelectorAll('#sub-nav-loot-reg .sub-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('#sub-nav-loot-reg [data-loot-sub="jugador"]')?.classList.add('active');
  document.getElementById('loot-sub-jugador')?.classList.add('active');
  document.getElementById('loot-sub-raid')?.classList.remove('active');
  const sel = document.getElementById('loot-player-select');
  if (sel) { sel.value = nombre; renderLootPlayer(nombre); }
}

function goToLootRaid(normalizedInstance, raidDate) {
  switchTab('loot-registro');
  if (!lootLoaded) return;
  document.querySelectorAll('#sub-nav-loot-reg .sub-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('#sub-nav-loot-reg [data-loot-sub="raid"]')?.classList.add('active');
  document.getElementById('loot-sub-jugador')?.classList.remove('active');
  document.getElementById('loot-sub-raid')?.classList.add('active');
  const instSel = document.getElementById('loot-instance-select');
  const dateSel = document.getElementById('loot-date-select');
  if (!instSel || !dateSel) return;
  instSel.value = normalizedInstance;
  const dates = [...new Set(lootRows.filter(r => r.normalizedInstance === normalizedInstance && r.raidDate).map(r => r.raidDate))].sort().reverse();
  dateSel.innerHTML = '<option value="">— Selecciona fecha —</option>' +
    dates.map(d => `<option value="${normalizedInstance}|${d}">${fmtDate(d)}</option>`).join('');
  dateSel.disabled = false;
  const key = `${normalizedInstance}|${raidDate}`;
  dateSel.value = key;
  renderLootRaid(key);
}

function lootBadge(resp) {
  if (!resp) return '<span class="response-badge other">—</span>';
  const cls = resp === 'BiS' ? 'bis' : resp === 'Upgrade' ? 'upgrade' : resp === 'Off-Spec' ? 'offspec' : 'other';
  return `<span class="response-badge ${cls}">${resp}</span>`;
}

// Enlaza clics en nombres de jugadores a la ficha modal.
function attachPlayerClicks(selector) {
  document.querySelectorAll(`${selector} .clickable-player`).forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openPlayer(el.dataset.player));
  });
}

// ── CLA (Combat Log Analysis) ─────────────────────────────────────────────────

function _claColor(pct) {
  return pct >= 90 ? '#7dce82' : pct >= 70 ? '#f0c84a' : '#e07070';
}

// Estado de ordenación de las tablas CLA (persiste entre rerenders)
let _claSort = {
  consum: { col: 'prepPct', dir: 1 },
  equipo: { col: 'gearPrepPct', dir: 1 },
};
function _sortArrow(tab, col) {
  const s = _claSort[tab];
  const active = s.col === col;
  return `<span class="sort-arrow${active ? ' active' : ''}">${active ? (s.dir === 1 ? '▼' : '▲') : '⇅'}</span>`;
}
function _sortEntries(entries, tab, getVal) {
  const s = _claSort[tab];
  return [...entries].sort((a, b) => s.dir * ((getVal(b[1], s.col) ?? -1) - (getVal(a[1], s.col) ?? -1)));
}

function _claBar(pct) {
  const color = _claColor(pct);
  return `<div style="display:flex;align-items:center;gap:0.4rem">
    <div style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;min-width:40px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
    </div>
    <span style="color:${color};font-size:0.82rem;min-width:2.5rem;text-align:right">${pct}%</span>
  </div>`;
}

// Clases melee que presuponen Windfury de chamán y no necesitan aceite de arma
const _WF_MELEE_CLASSES = new Set(['Warrior', 'Paladin', 'Rogue']);

// Devuelve el valor efectivo de mejora de arma para display, y un tooltip si aplica corrección Windfury
function _effectiveArma(j, playerSpecs) {
  if (j.armaWindfury) {
    const spec = j.spec ?? playerSpecs?.[j._name] ?? '';
    const tip = (j.clase === 'Shaman' && spec === 'Enhancement')
      ? 'Enhancement: Windfury propio — no aplica aceite de arma'
      : 'Presupone Windfury de chamán — no enchanta el arma';
    return { val: 100, tooltip: tip };
  }
  return { val: j.consumibles.arma, tooltip: '' };
}

function renderCLAView(cla, playerSpecs = {}, activeSub = 'consumibles') {
  const el = document.getElementById('cla-view');
  if (!cla) { el.innerHTML = '<p style="color:var(--text-dim);font-style:italic">Sin datos CLA para esta semana.</p>'; return; }

  const { jugadores, mediaRaid, numTotalFights } = cla;
  const entries = Object.entries(jugadores);

  // Helpers de extracción de valor por columna
  const _consumVal = (j, col) => {
    if (col === 'prepPct')    return (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0);
    if (col === 'frasco')     return j.consumibles?.frasco ?? 0;
    if (col === 'comida')     return j.consumibles?.comida ?? 0;
    if (col === 'arma')       return j.consumibles?.arma ?? 0;
    if (col === 'pociones')   return j.consumibles?.pociones ?? -1;
    if (col === 'scroll')     return j.scrollBonus ?? 0;
    return (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0);
  };
  const _gearVal = (j, col) => {
    const gs = j.gearStats;
    if (col === 'gearPrepPct')  return gs?.gearPrepPct ?? j.gearScore ?? 0;
    if (col === 'enchantScore') return gs?.enchantScore ?? 0;
    if (col === 'gemScore')     return gs?.gemScore ?? 0;
    if (col === 'subOccurrences') return -(gs?.subOccurrences ?? 0); // menor = mejor
    return gs?.gearPrepPct ?? j.gearScore ?? 0;
  };

  const consumSorted = _sortEntries(entries, 'consum', _consumVal);
  const equipoSorted = _sortEntries(entries, 'equipo', _gearVal);

  // Para compatibilidad con código existente que usa 'sorted'
  const sorted = consumSorted;

  // ── CONSUMIBLES ──────────────────────────────────────────────────────────────
  const consumRows = sorted.map(([name, j]) => {
    const jWithName = { ...j, _name: name };
    const clsColor  = CLASS_COLOR[j.clase] ?? 'var(--text-bright)';
    const consWithScroll = Math.round((j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0));
    const prepColor = _claColor(consWithScroll);
    const { val: armaVal, tooltip: armaTip } = _effectiveArma(jWithName, playerSpecs);
    const armaCell = armaTip
      ? `<span data-tooltip="${armaTip}" style="cursor:help">${_claBar(armaVal)}</span>`
      : _claBar(armaVal);

    // Pociones — null si la clase/spec no tiene poción esperada
    const pocionVal = j.consumibles?.pociones ?? null;
    let pocionCell;
    if (pocionVal === null) {
      pocionCell = `<span style="color:var(--text-dim);font-size:0.85rem">N/A</span>`;
    } else {
      const usadas     = j.pocionUsadas ?? {};
      const healUsadas = j.healPocionUsadas ?? {};
      const numTries   = j.numTries ?? 0;
      const lines = Object.entries(usadas).map(([n, c]) => `• ${n}: ${c} pociones en ${numTries} trys`);
      const healLines = Object.entries(healUsadas).map(([n, c]) => `• ${n} (x0.5): ${c} pociones en ${numTries} trys`);
      const allLines = [...lines, ...healLines];
      const tip = allLines.length > 0 ? allLines.join('<br>') : `Ninguna (${numTries} trys)`;
      pocionCell = `<span data-tooltip="${tip}" style="cursor:help">${_claBar(pocionVal)}</span>`;
    }

    // Pergaminos — bonus 0-10%
    const scrollBonus   = j.scrollBonus ?? 0;
    const scrollDetails = j.scrollDetails ?? {};
    const nb = numTotalFights ?? '?';
    let scrollCell;
    if (scrollBonus === 0) {
      scrollCell = `<span style="color:var(--text-dim)">—</span>`;
    } else {
      const scrollLines = Object.entries(scrollDetails).map(([k, v]) => `• ${k}: ${v}/${nb} trys`);
      const scrollTip   = scrollLines.join('<br>');
      scrollCell = `<span data-tooltip="${scrollTip}" style="color:#d4af37;cursor:help;font-weight:600">+${scrollBonus}%</span>`;
    }

    return `<tr>
      <td><span class="player-link clickable-player" data-player="${name}" style="color:${clsColor}">${name}</span></td>
      <td style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:${prepColor};text-align:center">${consWithScroll}%</td>
      <td>${_claBar(j.consumibles.frasco)}</td>
      <td>${_claBar(j.consumibles.comida)}</td>
      <td>${armaCell}</td>
      <td>${pocionCell}</td>
      <td style="text-align:center">${scrollCell}</td>
    </tr>`;
  }).join('');

  const avgConsScore = Math.round(sorted.reduce((s, [, j]) => s + (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0), 0) / (sorted.length || 1));
  const mediaColor = _claColor(avgConsScore);
  const avgFlask  = Math.round(sorted.reduce((s, [, j]) => s + j.consumibles.frasco, 0) / (sorted.length || 1));
  const avgFood   = Math.round(sorted.reduce((s, [, j]) => s + j.consumibles.comida,  0) / (sorted.length || 1));
  const avgWeapon = Math.round(sorted.reduce((s, [name, j]) => s + _effectiveArma({ ...j, _name: name }, playerSpecs).val, 0) / (sorted.length || 1));
  const pocionPlayers = sorted.filter(([, j]) => (j.consumibles?.pociones ?? null) !== null);
  const avgPocion = pocionPlayers.length > 0
    ? Math.round(pocionPlayers.reduce((s, [, j]) => s + j.consumibles.pociones, 0) / pocionPlayers.length)
    : null;
  const scrollPlayers    = sorted.filter(([, j]) => (j.scrollBonus ?? 0) > 0);
  const avgScroll        = sorted.length > 0
    ? parseFloat((sorted.reduce((s, [, j]) => s + (j.scrollBonus ?? 0), 0) / sorted.length).toFixed(2))
    : 0;
  const scrollUsersCount = scrollPlayers.length;

  // ── EQUIPO ────────────────────────────────────────────────────────────────────
  // Categorización de issues por tipo (compatible con formato antiguo y nuevo)
  const _isEnchIssue = i => {
    if (i.includes('[sin encantamiento]')) return true;
    const tag = (i.match(/\[([^\]]+)\]$/) ?? [])[1] ?? '';
    return tag.includes(' - ');
  };
  const _isGemIssue = i => {
    if (i.includes('[socket vacio]') || i.includes('[baja calidad]')) return true;
    const tag = (i.match(/\[([^\]]+)\]$/) ?? [])[1] ?? '';
    return tag === 'sin gema' || tag.startsWith('gema ');
  };
  const _isSubIssue = i => {
    const tag = (i.match(/\[([^\]]+)\]$/) ?? [])[1] ?? '';
    return tag.includes('inutil') || tag.includes('suboptimo') || tag.startsWith('gear pvp') || tag === 'gema meta inactiva';
  };

  // Promedios de gear para tarjetas de resumen
  const playersWithGs    = equipoSorted.filter(([, j]) => j.gearStats);
  const avgGearPrep  = playersWithGs.length ? Math.round(playersWithGs.reduce((s, [, j]) => s + (j.gearStats.gearPrepPct ?? 0), 0) / playersWithGs.length) : null;
  const avgEnchant   = playersWithGs.length ? Math.round(playersWithGs.reduce((s, [, j]) => s + (j.gearStats.enchantScore ?? 0), 0) / playersWithGs.length) : null;
  const avgGem       = playersWithGs.length ? Math.round(playersWithGs.reduce((s, [, j]) => s + (j.gearStats.gemScore ?? 0), 0) / playersWithGs.length) : null;
  const playersWithSub = equipoSorted.filter(([, j]) => (j.gearStats?.subOccurrences ?? 0) > 0).length;

  // Fallback para datos sin gearStats (datos históricos pre-backfill)
  const _isEnchIssueFb  = i => { if (i.includes('[sin encantamiento]')) return true; const tag = (i.match(/\[([^\]]+)\]$/) ?? [])[1] ?? ''; return tag.includes(' - '); };
  const _isGemIssueFb   = i => { if (i.includes('[socket vacio]') || i.includes('[baja calidad]')) return true; const tag = (i.match(/\[([^\]]+)\]$/) ?? [])[1] ?? ''; return tag === 'sin gema' || tag.startsWith('gema '); };

  const gearRows = equipoSorted.map(([name, j]) => {
    const clsColor = CLASS_COLOR[j.clase] ?? 'var(--text-bright)';
    const gs       = j.gearStats;
    const issues   = j.gearIssues ?? [];

    let gearPrepCell, enchCell, gemCell;

    if (gs) {
      // Datos nuevos con gearStats
      const gearPrepColor = _claColor(gs.gearPrepPct);
      const enchTip = issues.filter(_isEnchIssue).map(i => `• ${i}`).join('<br>') || 'Sin problemas';
      const gemTip  = issues.filter(_isGemIssue).map(i => `• ${i}`).join('<br>') || 'Sin problemas';

      let enchDetail = '';
      if (gs.missingEnchants > 0 || gs.badEnchants > 0) {
        enchDetail = `(${gs.missingEnchants} sin enc. / ${gs.badEnchants} malos de ${gs.totalEnchantSlots} slots)`;
      }
      let gemDetail = '';
      if (gs.emptyGems > 0 || gs.badGems > 0) {
        gemDetail = `(${gs.emptyGems} vacíos / ${gs.badGems} malos de ${gs.totalGemSockets} sockets)`;
      }

      const enchFullTip = [enchDetail, enchTip].filter(Boolean).join('<br>');
      const gemFullTip  = [gemDetail, gemTip].filter(Boolean).join('<br>');

      gearPrepCell = `<span style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:${gearPrepColor}">${Math.round(gs.gearPrepPct)}%</span>`;
      enchCell = `<div data-tooltip="${enchFullTip}" style="cursor:help">${_claBar(gs.enchantScore)}</div>`;
      gemCell  = `<div data-tooltip="${gemFullTip}" style="cursor:help">${_claBar(gs.gemScore)}</div>`;
    } else {
      // Fallback legacy: usar gearScore y conteo de issues
      const legacyScore = j.gearScore ?? 0;
      const enchIssues = issues.filter(_isEnchIssueFb);
      const gemIssues  = issues.filter(_isGemIssueFb);
      const enchTip = enchIssues.length ? enchIssues.map(i => `• ${i}`).join('<br>') : 'Sin problemas';
      const gemTip  = gemIssues.length  ? gemIssues.map(i => `• ${i}`).join('<br>') : 'Sin problemas';
      gearPrepCell = `<span style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:${_claColor(legacyScore)}">${Math.round(legacyScore)}%</span>`;
      enchCell = `<div data-tooltip="${enchTip}" style="cursor:help">${_claBar(enchIssues.length > 0 ? 0 : 100)}</div>`;
      gemCell  = `<div data-tooltip="${gemTip}"  style="cursor:help">${_claBar(gemIssues.length  > 0 ? 0 : 100)}</div>`;
    }

    const subIssuesList = issues.filter(_isSubIssue);
    const subOcc  = gs?.subOccurrences ?? subIssuesList.length;
    const subPen  = gs?.subPenalty ?? 0;
    const metaPen = gs?.metaPenalty ?? 0;
    const totalPen = subPen + metaPen;
    let subCell;
    if (subOcc > 0 || metaPen > 0) {
      const subLines = subIssuesList.map(i => `• ${i}`);
      if (gs?.metaInactive) subLines.push('• Meta gem inactiva (−5%)');
      if (subPen > 0) subLines.push(`Penalización: −${subPen}% (${subOcc} × 3%, cap 30%)`);
      const displayPen = (gs && totalPen > 0) ? `-${totalPen}%` : `${subOcc} item${subOcc !== 1 ? 's' : ''}${metaPen > 0 ? ' + meta' : ''}`;
      subCell = `<span data-tooltip="${subLines.join('<br>')}" style="cursor:help;color:#e07070;font-size:0.9rem;font-weight:600">${displayPen}</span>`;
    } else {
      subCell = `<span style="color:var(--text-dim)">—</span>`;
    }

    return `<tr>
      <td><span class="player-link clickable-player" data-player="${name}" style="color:${clsColor}">${name}</span></td>
      <td style="text-align:center">${gearPrepCell}</td>
      <td>${enchCell}</td>
      <td>${gemCell}</td>
      <td data-sort-sub="${subOcc}">${subCell}</td>
    </tr>`;
  }).join('');

  const consumHtml = `
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card" style="text-align:center;border-color:${mediaColor};box-shadow:0 0 8px ${mediaColor}33">
        <div class="stat-label" style="color:var(--gold);font-size:0.82rem;font-weight:700;letter-spacing:0.06em">CONS PREP MEDIA</div>
        <div class="stat-value" style="color:${mediaColor};font-size:2rem">${avgConsScore}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Frasco / Elixir</div>
        <div class="stat-value" style="color:${_claColor(avgFlask)}">${avgFlask}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Comida</div>
        <div class="stat-value" style="color:${_claColor(avgFood)}">${avgFood}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Mejora Arma</div>
        <div class="stat-value" style="color:${_claColor(avgWeapon)}">${avgWeapon}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Pociones</div>
        <div class="stat-value" style="color:${avgPocion !== null ? _claColor(avgPocion) : 'var(--text-dim)'}">${avgPocion !== null ? avgPocion + '%' : 'N/A'}</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Pergaminos</div>
        <div class="stat-value" style="color:${scrollUsersCount > 0 ? '#d4af37' : 'var(--text-dim)'}">${scrollUsersCount}/${sorted.length}</div>
      </div>
    </div>
    <table class="ranked-list" style="table-layout:fixed;width:100%">
      <thead>
        <tr>
          <th style="width:17%;white-space:nowrap;overflow:hidden">Jugador</th>
          <th data-sort="prepPct" style="width:10%;text-align:center;white-space:nowrap;overflow:hidden">CONS % ${_sortArrow('consum','prepPct')}</th>
          <th data-sort="frasco" style="width:16%;white-space:nowrap;overflow:hidden">Flask/Elix ${_sortArrow('consum','frasco')}</th>
          <th data-sort="comida" style="width:16%;white-space:nowrap;overflow:hidden">Comida ${_sortArrow('consum','comida')}</th>
          <th data-sort="arma" style="width:16%;white-space:nowrap;overflow:hidden">Arma ${_sortArrow('consum','arma')}</th>
          <th data-sort="pociones" style="width:16%;white-space:nowrap;overflow:hidden"><span data-tooltip="DPS: 1 pocion por boss = 100%<br>Tank/Healer: 1 pocion cada 2 trys = 100%<br><br>Destruction: Warlock, Mage, Paladin, Balance, Elemental<br>Haste: Warrior, Rogue, Hunter, Feral, Enh Sham<br>Ironshield: Warrior, Feral, Prot/Justicar Paladin<br>Mana: Priest, Mage, Paladin, Elemental, Resto Sham, Druid Resto/Bal, Hunter<br><br>Healing Potion (x0.5): todo el mundo — 2 por try = 100%" style="cursor:help">Pociones (?)</span> ${_sortArrow('consum','pociones')}</th>
          <th data-sort="scroll" style="width:9%;text-align:center;white-space:nowrap;overflow:hidden"><span data-tooltip="Bonus sobre el CONS% base (max +5%)<br><br>Nivel V (full) o IV (x0.5) de cada tipo:<br>• Strength, Agility, Armor<br><br>Los 3 pergaminos V en todos los bosses = +5%<br>Los 3 pergaminos IV en todos los bosses = +2.5%<br>1 pergamino V en todos los bosses = +1.66%<br>Cobertura parcial de bosses reduce proporcionalmente" style="cursor:help">Pergs (?)</span> ${_sortArrow('consum','scroll')}</th>
        </tr>
      </thead>
      <tbody>${consumRows}</tbody>
    </table>`;

  const equipoHtml = `
    <div class="stats-grid" style="margin-bottom:1.5rem;grid-template-columns:repeat(4,1fr)">
      <div class="stat-card" style="text-align:center;border-color:${avgGearPrep !== null ? _claColor(avgGearPrep) : 'var(--border)'};box-shadow:0 0 8px ${avgGearPrep !== null ? _claColor(avgGearPrep) : 'transparent'}33">
        <div class="stat-label" style="color:var(--gold);font-size:0.82rem;font-weight:700;letter-spacing:0.06em">GEAR PREP MEDIA</div>
        <div class="stat-value" style="color:${avgGearPrep !== null ? _claColor(avgGearPrep) : 'var(--text-dim)'};font-size:2rem">${avgGearPrep !== null ? avgGearPrep + '%' : '—'}</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Enchants</div>
        <div class="stat-value" style="color:${avgEnchant !== null ? _claColor(avgEnchant) : 'var(--text-dim)'}">${avgEnchant !== null ? avgEnchant + '%' : '—'}</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Gemas</div>
        <div class="stat-value" style="color:${avgGem !== null ? _claColor(avgGem) : 'var(--text-dim)'}">${avgGem !== null ? avgGem + '%' : '—'}</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Equipo subóptimo</div>
        <div class="stat-value" style="color:${playersWithSub > 0 ? '#b9a3ee' : '#7dce82'}">${playersWithSub} / ${equipoSorted.length}</div>
      </div>
    </div>
    <table class="ranked-list" style="table-layout:fixed;width:100%">
      <thead>
        <tr>
          <th style="width:20%">Jugador</th>
          <th data-sort="gearPrepPct" style="width:12%;text-align:center">GEAR % ${_sortArrow('equipo','gearPrepPct')}</th>
          <th data-sort="enchantScore" style="width:23%">Enchants ${_sortArrow('equipo','enchantScore')}</th>
          <th data-sort="gemScore" style="width:23%">Gemas ${_sortArrow('equipo','gemScore')}</th>
          <th data-sort="subOccurrences" style="width:22%"><span data-tooltip="Items subóptimos detectados (montura, PvP, ingeniería…)<br>−3% por cada aparición en un boss (cap −30%)<br>Meta gem inactiva: −5% adicional" style="cursor:help">Subóptimo (?)</span> ${_sortArrow('equipo','subOccurrences')}</th>
        </tr>
      </thead>
      <tbody>${gearRows}</tbody>
    </table>`;

  // ── RESUMEN: cálculo por jugador ─────────────────────────────────────────────
  // PREP % = avg(consumiblesScore + scrollBonus, gearPrepPct) — calculado en tiempo real
  // para evitar datos desactualizados en entradas antiguas con backfill parcial
  const _calcOverall = (j) => {
    const cons  = (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0);
    const gear  = j.gearStats?.gearPrepPct ?? j.gearScore ?? null;
    const raw   = gear !== null ? (cons + gear) / 2 : cons;
    return Math.min(100, Math.round(raw));
  };

  const playersWithGear = entries.filter(([, j]) => (j.gearStats?.gearPrepPct ?? j.gearScore ?? null) !== null);
  const avgGearResumen  = playersWithGear.length
    ? Math.round(playersWithGear.reduce((s, [, j]) => s + (j.gearStats?.gearPrepPct ?? j.gearScore ?? 0), 0) / playersWithGear.length)
    : null;

  const resumenSorted = [...entries].sort((a, b) => {
    const prepDiff = _calcOverall(b[1]) - _calcOverall(a[1]);
    if (prepDiff !== 0) return prepDiff;
    const consDiff = ((b[1].consumiblesScore ?? 0) + (b[1].scrollBonus ?? 0)) - ((a[1].consumiblesScore ?? 0) + (a[1].scrollBonus ?? 0));
    if (consDiff !== 0) return consDiff;
    return (b[1].gearStats?.gearPrepPct ?? b[1].gearScore ?? 0) - (a[1].gearStats?.gearPrepPct ?? a[1].gearScore ?? 0);
  });
  const avgOverall    = resumenSorted.length
    ? Math.round(resumenSorted.reduce((s, [, j]) => s + _calcOverall(j), 0) / resumenSorted.length)
    : 0;

  const resumenRows = resumenSorted.map(([name, j]) => {
    const clsColor     = CLASS_COLOR[j.clase] ?? 'var(--text-bright)';
    const overall      = _calcOverall(j);
    const consTotal    = Math.round((j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0));
    const equipPct     = j.gearStats?.gearPrepPct ?? j.gearScore ?? null;
    const equipRounded = equipPct !== null ? Math.round(equipPct) : null;
    return `<tr>
      <td><span class="player-link clickable-player" data-player="${name}" style="color:${clsColor}">${name}</span></td>
      <td style="text-align:center"><span style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:${_claColor(overall)}">${overall}%</span></td>
      <td>${_claBar(consTotal)}</td>
      <td>${equipRounded !== null ? _claBar(equipRounded) : '<span style="color:var(--text-dim)">—</span>'}</td>
    </tr>`;
  }).join('');

  const resumenHtml = `
    <div class="stats-grid" style="margin-bottom:1.5rem;grid-template-columns:repeat(3,1fr)">
      <div class="stat-card" style="text-align:center;border-color:${_claColor(avgOverall)};box-shadow:0 0 8px ${_claColor(avgOverall)}33">
        <div class="stat-label" style="color:var(--gold);font-size:0.82rem;font-weight:700;letter-spacing:0.06em">PREP % MEDIA</div>
        <div class="stat-value" style="color:${_claColor(avgOverall)};font-size:2rem">${avgOverall}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">CONS % media</div>
        <div class="stat-value" style="color:${_claColor(avgConsScore)}">${avgConsScore}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">GEAR % media</div>
        <div class="stat-value" style="color:${avgGearResumen !== null ? _claColor(avgGearResumen) : 'var(--text-dim)'}">${avgGearResumen !== null ? avgGearResumen + '%' : '—'}</div>
      </div>
    </div>
    <table class="ranked-list" style="margin-bottom:1.5rem;table-layout:fixed;width:100%">
      <thead>
        <tr>
          <th style="width:20%">Jugador</th>
          <th style="width:12%;text-align:center">PREP %</th>
          <th style="width:34%">CONS %</th>
          <th style="width:34%">GEAR %</th>
        </tr>
      </thead>
      <tbody>${resumenRows}</tbody>
    </table>`;

  // ── INGENIERÍA ────────────────────────────────────────────────────────────────
  // Construir lista de items usados en esta raid (columnas dinámicas)
  const engiItemsUsed = [];
  {
    const seen = new Set();
    for (const [, j] of entries) {
      for (const name of Object.keys(j.engiUsadas ?? {})) {
        if (!seen.has(name)) { seen.add(name); engiItemsUsed.push(name); }
      }
    }
  }
  const engiEntries = entries.filter(([, j]) => Object.keys(j.engiUsadas ?? {}).length > 0);
  const engiHtml = engiItemsUsed.length === 0
    ? `<p style="color:var(--text-dim);font-style:italic;margin-top:1rem">Nadie usó ingeniería en esta raid.</p>`
    : `<div style="overflow-x:auto">
    <table class="ranked-list" style="min-width:max-content">
      <thead><tr>
        <th style="white-space:nowrap">Jugador</th>
        <th style="text-align:right;white-space:nowrap;font-size:.78rem">Daño total</th>
        ${engiItemsUsed.map(item => `<th style="text-align:right;white-space:nowrap;font-size:.78rem">${item}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${engiEntries.sort((a, b) => {
          const dmg = ([, j]) => Object.values(j.engiUsadas ?? {}).reduce((s, e) => s + (e.damage ?? 0), 0);
          return dmg(b) - dmg(a);
        }).map(([name, j]) => {
          const clsColor  = CLASS_COLOR[j.clase] ?? 'var(--text-bright)';
          const totalDmg  = Object.values(j.engiUsadas ?? {}).reduce((s, e) => s + (e.damage ?? 0), 0);
          const cells = engiItemsUsed.map(item => {
            const e = (j.engiUsadas ?? {})[item];
            if (!e) return `<td style="text-align:right"><span class="td-dim">—</span></td>`;
            const dmgStr = e.damage > 0 ? ` <span style="color:var(--text-dim);font-size:.8rem">(${fmtDmg(e.damage)})</span>` : '';
            return `<td style="text-align:right;white-space:nowrap;font-family:'Cinzel',serif;font-size:.85rem;font-weight:600;color:#f59e42">${e.count}${dmgStr}</td>`;
          }).join('');
          return `<tr>
            <td><span class="player-link clickable-player" data-player="${name}" style="color:${clsColor};white-space:nowrap">${name}</span></td>
            <td style="text-align:right;font-family:'Cinzel',serif;font-size:.9rem;font-weight:700;color:var(--text-bright);white-space:nowrap">${totalDmg > 0 ? fmtDmg(totalDmg) : '<span class="td-dim">—</span>'}</td>
            ${cells}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;

  el.innerHTML = `
    <div id="sub-nav-cla" style="display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem">
      <button class="cla-sub-pill ${activeSub === 'resumen' ? 'active' : ''}" data-clasub="resumen">
        <span class="cla-sub-icon">📋</span>
        <span class="cla-sub-label">Resumen</span>
      </button>
      <button class="cla-sub-pill ${activeSub === 'consumibles' ? 'active' : ''}" data-clasub="consumibles">
        <span class="cla-sub-icon">🧪</span>
        <span class="cla-sub-label">Consumibles</span>
      </button>
      <button class="cla-sub-pill ${activeSub === 'equipo' ? 'active' : ''}" data-clasub="equipo">
        <span class="cla-sub-icon">🛡️</span>
        <span class="cla-sub-label">Equipo</span>
      </button>
      <button class="cla-sub-pill ${activeSub === 'ingenieria' ? 'active' : ''}" data-clasub="ingenieria">
        <span class="cla-sub-icon">💣</span>
        <span class="cla-sub-label">Ingeniería</span>
      </button>
    </div>
    <div class="sub-tab-content ${activeSub === 'resumen' ? 'active' : ''}" id="clasub-resumen">${resumenHtml}</div>
    <div class="sub-tab-content ${activeSub === 'consumibles' ? 'active' : ''}" id="clasub-consumibles">${consumHtml}</div>
    <div class="sub-tab-content ${activeSub === 'equipo' ? 'active' : ''}" id="clasub-equipo">${equipoHtml}</div>
    <div class="sub-tab-content ${activeSub === 'ingenieria' ? 'active' : ''}" id="clasub-ingenieria">${engiHtml}</div>`;

  // Sub-tab switching
  document.getElementById('sub-nav-cla').addEventListener('click', e => {
    const btn = e.target.closest('.cla-sub-pill');
    if (!btn) return;
    document.querySelectorAll('#sub-nav-cla .cla-sub-pill').forEach(b => b.classList.toggle('active', b === btn));
    const sub = btn.dataset.clasub;
    document.querySelectorAll('#cla-view .sub-tab-content').forEach(c => c.classList.toggle('active', c.id === `clasub-${sub}`));
  });

  // Sort on column header click
  document.querySelectorAll('#clasub-consumibles th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (_claSort.consum.col === col) _claSort.consum.dir *= -1;
      else _claSort.consum = { col, dir: -1 };
      renderCLAView(cla, playerSpecs, 'consumibles');
    });
  });
  document.querySelectorAll('#clasub-equipo th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (_claSort.equipo.col === col) _claSort.equipo.dir *= -1;
      else _claSort.equipo = { col, dir: -1 };
      renderCLAView(cla, playerSpecs, 'equipo');
    });
  });

  attachPlayerClicks('#cla-view');
}

function renderCLAGlobal(raids) {
  // ── Agregado por jugador ──────────────────────────────────────────────────
  const playerMap = new Map();
  for (const r of raids) {
    for (const [name, j] of Object.entries(r.cla.jugadores)) {
      if (!playerMap.has(name)) playerMap.set(name, { clase: j.clase, prepSum: 0, consSum: 0, gearSum: 0, gearCount: 0, count: 0 });
      const d    = playerMap.get(name);
      const cons = (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0);
      const gear = j.gearStats?.gearPrepPct ?? j.gearScore ?? null;
      const prep = Math.min(100, Math.round(gear !== null ? (cons + gear) / 2 : cons));
      d.prepSum += prep;
      d.consSum += cons;
      if (gear !== null) { d.gearSum += gear; d.gearCount++; }
      d.count++;
    }
  }
  const players = [...playerMap.entries()].map(([name, d]) => ({
    name, clase: d.clase, count: d.count,
    avgPrep: Math.min(100, Math.round(d.prepSum / d.count)),
    avgCons: Math.round(d.consSum / d.count),
    avgGear: d.gearCount > 0 ? Math.round(d.gearSum / d.gearCount) : null,
  })).sort((a, b) => {
    const pd = b.avgPrep - a.avgPrep; if (pd !== 0) return pd;
    const cd = b.avgCons - a.avgCons; if (cd !== 0) return cd;
    return (b.avgGear ?? 0) - (a.avgGear ?? 0);
  });

  // ── Badges ────────────────────────────────────────────────────────────────
  const guildAvg   = players.length ? Math.round(players.reduce((s, p) => s + p.avgPrep, 0) / players.length) : 0;
  const bestPrep   = players[0]?.avgPrep ?? 0;
  const worstPrep  = players[players.length - 1]?.avgPrep ?? 0;
  const bestList   = players.filter(p => p.avgPrep === bestPrep);
  const worstList  = players.filter(p => p.avgPrep === worstPrep);
  const guildColor = _claColor(guildAvg);
  const nameSpans  = ps => ps.map(p =>
    `<span class="clickable-player" data-player="${p.name}" style="color:${CLASS_COLOR[p.clase] ?? 'var(--text-bright)'};cursor:pointer">${p.name}</span>`
  ).join(', ');

  // ── Gráfica evolutiva (orden cronológico) ─────────────────────────────────
  const raidsChron = [...raids].reverse();
  const chartLabels = raidsChron.map(r => { const [y,m,d] = r.fecha.split('-'); return `${d}/${m}`; });
  const chartValues = raidsChron.map(r => {
    const jugs = Object.values(r.cla.jugadores);
    if (!jugs.length) return null;
    const vals = jugs.map(j => {
      const cons = (j.consumiblesScore ?? 0) + (j.scrollBonus ?? 0);
      const gear = j.gearStats?.gearPrepPct ?? j.gearScore ?? null;
      return Math.min(100, gear !== null ? (cons + gear) / 2 : cons);
    });
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  });
  const chart = drawLineChart(chartLabels, [{ label: 'PREP % media', color: '#7dce82', values: chartValues }], v => Math.round(v) + '%', 100);

  // ── Tabla ─────────────────────────────────────────────────────────────────
  const tableRows = players.map(p => {
    const clsColor = CLASS_COLOR[p.clase] ?? 'var(--text-bright)';
    return `<tr>
      <td><span class="player-link clickable-player" data-player="${p.name}" style="color:${clsColor}">${p.name}</span></td>
      <td style="text-align:center;color:var(--text-dim);font-size:0.85rem">${p.count}</td>
      <td style="text-align:center"><span style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:${_claColor(p.avgPrep)}">${p.avgPrep}%</span></td>
      <td>${_claBar(p.avgCons)}</td>
      <td>${p.avgGear !== null ? _claBar(p.avgGear) : '<span style="color:var(--text-dim)">—</span>'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="stats-grid" style="margin-bottom:1.5rem;grid-template-columns:repeat(3,1fr)">
      <div class="stat-card" style="text-align:center;border-color:${guildColor};box-shadow:0 0 8px ${guildColor}33">
        <div class="stat-label" style="color:var(--gold);font-size:0.82rem;font-weight:700;letter-spacing:0.06em">PREP % MEDIA GUILD</div>
        <div class="stat-value" style="color:${guildColor};font-size:2rem">${guildAvg}%</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Mejor preparado</div>
        <div class="stat-value" style="color:#7dce82;font-size:1.4rem">${bestPrep}%</div>
        <div style="margin-top:0.4rem;font-size:0.85rem">${nameSpans(bestList)}</div>
      </div>
      <div class="stat-card" style="text-align:center">
        <div class="stat-label" style="color:#aaa">Peor preparado</div>
        <div class="stat-value" style="color:#e07070;font-size:1.4rem">${worstPrep}%</div>
        <div style="margin-top:0.4rem;font-size:0.85rem">${nameSpans(worstList)}</div>
      </div>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.5rem">
      <button class="cla-goto-card" data-goto="consumibles">
        <span style="font-size:1.6rem;line-height:1;flex-shrink:0">🧪</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-weight:700;font-size:.88rem;color:var(--text-bright);letter-spacing:.04em">Consumibles por Raid</div>
          <div style="font-size:.78rem;color:var(--text-dim);margin-top:.15rem">Flask, comida, pociones y pergaminos</div>
        </div>
        <span class="cla-goto-arrow" style="color:var(--text-dim);font-size:1.1rem;flex-shrink:0;transition:color .15s">→</span>
      </button>
      <button class="cla-goto-card" data-goto="equipo">
        <span style="font-size:1.6rem;line-height:1;flex-shrink:0">🛡️</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-weight:700;font-size:.88rem;color:var(--text-bright);letter-spacing:.04em">Equipo por Raid</div>
          <div style="font-size:.78rem;color:var(--text-dim);margin-top:.15rem">Enchants, gemas e ítems subóptimos</div>
        </div>
        <span class="cla-goto-arrow" style="color:var(--text-dim);font-size:1.1rem;flex-shrink:0;transition:color .15s">→</span>
      </button>
    </div>
    <div class="prog-chart" style="margin-bottom:1.5rem">
      <div class="prog-chart-title">Evolución del PREP % medio</div>
      ${chart}
    </div>
    <table class="ranked-list" style="table-layout:fixed;width:100%">
      <thead>
        <tr>
          <th style="width:20%;white-space:nowrap;overflow:hidden">Jugador</th>
          <th style="width:8%;text-align:center;white-space:nowrap;overflow:hidden">Raids</th>
          <th style="width:12%;text-align:center;white-space:nowrap;overflow:hidden">PREP %</th>
          <th style="width:30%;white-space:nowrap;overflow:hidden">CONS %</th>
          <th style="width:30%;white-space:nowrap;overflow:hidden">GEAR %</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;
}

function renderCLA() {
  const el = document.getElementById('tab-cla');
  if (!historial.length) {
    el.innerHTML = '<p class="empty-msg">No hay sesiones registradas aun.</p>';
    return;
  }

  // Lista plana de todas las raids con CLA, más reciente primero
  const raids = [];
  for (const entry of historial) {
    if (!entry.claReports) continue;
    const reports = entry.reports ?? (entry.report ? [entry.report] : []);
    for (const code of reports) {
      const cla = entry.claReports[code];
      if (!cla) continue;
      const claFecha = cla.fecha ?? entry.fecha;
      const instance = cla.instance ?? null;
      raids.push({ code, cla, fecha: claFecha, semanaNum: entry.semanaNum, playerSpecs: entry.playerSpecs ?? {}, instance });
    }
  }
  raids.sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (!raids.length) {
    el.innerHTML = `<div class="empty-msg">
      <p>No hay datos CLA aun.</p>
      <p style="font-size:0.85rem;color:var(--text-dim);margin-top:0.5rem">
        Los datos CLA se generan al subir un report con <code>node subir_report.js</code>.
      </p>
    </div>`;
    return;
  }

  const options = raids.map(r =>
    `<option value="${r.code}">S${r.semanaNum} · ${fmtDate(r.fecha)}${r.instance ? ' · ' + r.instance : ''}</option>`
  ).join('');

  el.innerHTML = `
    <div style="display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem">
      <div id="sub-nav-cla-main" style="display:flex;gap:0;flex:1">
        <button class="sub-tab-btn active" data-clamain="general" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">Resumen General</button>
        <button class="sub-tab-btn" data-clamain="porraid" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">Por Raid</button>
      </div>
      <button id="cla-calc-btn" class="sub-tab-btn" style="margin-left:auto;border-left:1px solid rgba(255,255,255,0.08);border-bottom-color:transparent;-webkit-font-smoothing:antialiased">ℹ️ Cálculos</button>
    </div>
    <div id="cla-calc-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);overflow-y:auto;padding:2rem 1rem">
      <div style="max-width:700px;margin:auto;background:var(--bg-card);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:2rem;position:relative">
        <button id="cla-calc-close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--text-dim);font-size:1.4rem;cursor:pointer;line-height:1" onmouseover="this.style.color='var(--text-bright)'" onmouseout="this.style.color='var(--text-dim)'">&times;</button>
        <h3 style="font-family:'Cinzel',serif;font-size:1rem;letter-spacing:0.08em;color:var(--gold);margin:0 0 1.2rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">Cómo se realizan los cálculos</h3>
        <div class="cla-details-body">
          <p>Todos los cálculos se realizan <strong>únicamente sobre peleas de boss</strong> (tries y kills). El trash no se tiene en cuenta.</p>
          <p>El <strong>PREP % de consumibles</strong> es la media de las siguientes categorías, medidas en cada boss fight:</p>
          <ul>
            <li><strong>Flask/Elixir</strong>: % de bosses donde llevabas preparación activa. Puedes usar un <em>Frasco de Batalla</em> (cuenta como ambos elixires), o la combinación <em>Elixir de Guardián + Elixir de Batalla</em>.</li>
            <li><strong>Comida</strong>: % de bosses donde llevabas buff de comida.</li>
            <li><strong>Mejora de Arma</strong>: % de bosses con aceite, sharpening stone o equivalente. Enhancement y melees con 0% cuentan 100% (Windfury de chamán).</li>
            <li><strong>Pociones</strong> (si aplica según clase/spec): DPS = 1 poción por try = 100%; Tanks/Healers = 1 cada 2 trys = 100%.</li>
          </ul>
          <p>Los <strong>Pergaminos</strong> (Strength, Agility, Armor) son opcionales y añaden un bonus de hasta <strong>+5%</strong> al CONS %. No penaliza no llevarlos, pero llevarlos sube el CONS % y con ello el PREP % final. El <strong>PREP % nunca superará el 100%</strong>.</p>
          <p>El <strong>Gear PREP %</strong> combina tres componentes:</p>
          <ul>
            <li><strong>Enchant %</strong>: porcentaje de slots enchantables con encantamiento correcto. Se comprueba cabeza, hombros, pecho, brazales, guantes, piernas, botas, capa y arma(s).
              <ul>
                <li>Slot sin encantamiento → <code>−(100 / total slots)%</code></li>
                <li>Encantamiento subóptimo → <code>−(50 / total slots)%</code></li>
              </ul>
            </li>
            <li><strong>Gem %</strong>: porcentaje de sockets con gema correcta (usando la base de datos de sockets de TBC).
              <ul>
                <li>Socket vacío → <code>−(100 / total sockets)%</code></li>
                <li>Gema subóptima, sin cortar o de tipo equivocado → <code>−(50 / total sockets)%</code></li>
              </ul>
            </li>
            <li><strong>Equipo subóptimo</strong>: items de montura, ingeniería o PvP detectados durante el combate. <code>−3% por cada aparición en un boss</code>, con un máximo de <strong>−30%</strong>.</li>
            <li><strong>Meta gem inactiva</strong>: si llevas meta gema pero los requisitos de color no están cumplidos → <strong>−5%</strong> fijo.</li>
          </ul>
          <p>Fórmula: <code>Gear PREP = avg(Enchant%, Gem%) − penalización subóptimo − penalización meta</code></p>
          <p>El <strong>PREP % final</strong> es la media de los dos grandes bloques, cappado al 100%:</p>
          <p style="margin-left:1rem"><code>PREP General = min(100, avg(CONS % + Pergaminos, Gear PREP))</code></p>
          <p>Esto da igual peso a consumibles y equipo. En ningún caso el resultado final superará el 100%.</p>
        </div>
      </div>
    </div>
    <div class="sub-tab-content active" id="clamain-general">${renderCLAGlobal(raids)}</div>
    <div class="sub-tab-content" id="clamain-porraid">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <span style="color:var(--text-dim);font-size:1rem;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.05em;align-self:center">Raid</span>
        <select class="loot-select" id="cla-raid-sel" style="min-width:200px;width:auto;margin-bottom:0">${options}</select>
        <span style="color:var(--text-dim);font-size:0.8rem;line-height:1.4;margin-left:1rem;padding-left:1rem;border-left:1px solid rgba(255,255,255,0.1)">
          Ve a <strong style="color:var(--text-bright)">Consumibles</strong> o <strong style="color:var(--text-bright)">Equipo</strong> para ver el detalle.<br>
          Pasa el ratón por encima de los % de encantamientos/gemas para ver qué slots llevas mal.
        </span>
      </div>
      <div id="cla-view"></div>
    </div>`;

  // Top-level tab switching
  document.getElementById('sub-nav-cla-main').addEventListener('click', e => {
    const btn = e.target.closest('.sub-tab-btn');
    if (!btn) return;
    document.querySelectorAll('#sub-nav-cla-main .sub-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    const main = btn.dataset.clamain;
    document.getElementById('clamain-general').classList.toggle('active', main === 'general');
    document.getElementById('clamain-porraid').classList.toggle('active', main === 'porraid');
  });

  // Popup cálculos
  const calcModal = document.getElementById('cla-calc-modal');
  document.getElementById('cla-calc-btn').addEventListener('click', () => { calcModal.style.display = 'block'; });
  document.getElementById('cla-calc-close').addEventListener('click', () => { calcModal.style.display = 'none'; });
  calcModal.addEventListener('click', e => { if (e.target === calcModal) calcModal.style.display = 'none'; });

  // Player clicks en resumen general
  attachPlayerClicks('#clamain-general');
  _attachChartTooltips(document.getElementById('clamain-general'));

  // Shortcut cards: navegar a Por Raid + subtab concreto
  document.getElementById('clamain-general').addEventListener('click', e => {
    const card = e.target.closest('[data-goto]');
    if (!card) return;
    const sub = card.dataset.goto;
    document.querySelectorAll('#sub-nav-cla-main .sub-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.clamain === 'porraid'));
    document.getElementById('clamain-general').classList.remove('active');
    document.getElementById('clamain-porraid').classList.add('active');
    const r = raids[0];
    renderCLAView(r.cla, r.playerSpecs, sub);
  });

  // Raid selector
  const sel = document.getElementById('cla-raid-sel');
  sel.addEventListener('change', () => {
    const r = raids.find(r => r.code === sel.value);
    if (!r) return;
    const activeSub = document.querySelector('#sub-nav-cla .cla-sub-pill.active')?.dataset.clasub ?? 'resumen';
    renderCLAView(r.cla, r.playerSpecs, activeSub);
  });

  renderCLAView(raids[0].cla, raids[0].playerSpecs, 'resumen');
}

// ── PERFORMANCE ───────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function renderPerformance() {
  const el = document.getElementById('tab-performance');
  const perfData = window.__PERFORMANCE_F2__ ?? [];

  if (!perfData.length) {
    el.innerHTML = '<p class="empty-msg">No hay datos de rendimiento aún. Ejecuta <code>node backfill_performance.js</code>.</p>';
    return;
  }

  const semanas = [...perfData].sort((a, b) => b.semana.localeCompare(a.semana));

  // ── Helpers ────────────────────────────────────────────────────────────────
  const CLASS_ORDER  = ['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];
  const CLASS_COLORS = {
    Warrior:'#C79C6E',Paladin:'#F58CBA',Hunter:'#ABD473',Rogue:'#FFF569',
    Priest:'#FFFFFF',Shaman:'#0070DE',Mage:'#69CCF0',Warlock:'#9482C9',Druid:'#FF7D0A',
  };

  function weekEndStr(semana) {
    const d = new Date(semana + 'T12:00:00');
    d.setDate(d.getDate() + 6);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  }
  function semanaLabel(s) {
    const [y,m,d] = s.semana.split('-');
    return `S${s.semanaNum} · ${d}/${m}/${y} – ${weekEndStr(s.semana)}`;
  }

  // Mapa spell-ID → item-ID para trinkets donde se conoce el item ID real de WoWHead.
  // Los IDs en TRACKED_TRINKETS son spell/buff IDs (los que usa WCL). Para el tooltip
  // de WoWHead necesitamos el item ID. Si no está en el mapa, se usa spell= como fallback
  // (muestra el tooltip del efecto, no la ficha completa del item).
  const TRINKET_ITEM_IDS = {
    35163: 29370,  // Icon of the Silver Crescent
    // Añadir aquí otros trinkets si el tooltip muestra el item incorrecto:
    // spellId: itemId,
  };

  // Icon + WoWHead link helpers (NO $WowheadPower.refreshLinks — evita iconos duplicados)
  function perfIcon(iconFile, size) {
    if (!iconFile) return '';
    const sz = size || 18;
    return `<img src="https://wow.zamimg.com/images/wow/icons/small/${iconFile}" alt="" style="width:${sz}px;height:${sz}px;border-radius:2px;vertical-align:middle;margin-right:0.35rem;flex-shrink:0;border:1px solid rgba(255,255,255,0.15)">`;
  }
  function perfLink(id, name, iconFile, isItem, iconSize) {
    // Para trinkets: si hay item ID conocido → item=X, si no → spell=X (evita tooltip incorrecto)
    const href = isItem
      ? (TRINKET_ITEM_IDS[id] ? `item=${TRINKET_ITEM_IDS[id]}` : `spell=${id}`)
      : `spell=${id}`;
    return `<a href="https://www.wowhead.com/tbc/${href}" class="item-link" target="_blank" style="display:inline-flex;align-items:center;color:var(--text-bright);text-decoration:none;white-space:nowrap">${perfIcon(iconFile, iconSize)}${name}</a>`;
  }
  function uptimeColor(u) {
    return u >= 80 ? 'var(--f2-accent)' : u >= 50 ? '#f0c84a' : '#e07070';
  }
  function playerColor(name, playerClasses) {
    const cls = playerClasses[name] ?? '';
    return CLASS_COLORS[cls] ?? 'var(--text-bright)';
  }
  function playerNameHtml(name, playerClasses) {
    return `<span style="font-weight:600;color:${playerColor(name, playerClasses)}">${name}</span>`;
  }
  function sortByClass(arr, playerClasses, getName) {
    const fn = getName ?? (x => x.name);
    return [...arr].sort((a, b) => {
      const ca = CLASS_ORDER.indexOf(playerClasses[fn(a)] ?? '');
      const cb = CLASS_ORDER.indexOf(playerClasses[fn(b)] ?? '');
      if (ca !== cb) return (ca === -1 ? 999 : ca) - (cb === -1 ? 999 : cb);
      return fn(a).localeCompare(fn(b));
    });
  }

  // Tooltip flotante con position:fixed — no lo corta ningún overflow
  if (!document.getElementById('perf-tip-box')) {
    const box = document.createElement('div');
    box.id = 'perf-tip-box';
    document.body.appendChild(box);

    document.addEventListener('mouseover', e => {
      const cell = e.target.closest('[data-perf-tip]');
      if (!cell) return;
      box.innerHTML = cell.dataset.perfTip.split(';').map(s => {
        const i = s.lastIndexOf('|');
        return `<div class="tip-row"><span class="tip-name">${s.slice(0,i)}</span><span class="tip-count">×${s.slice(i+1)}</span></div>`;
      }).join('');
      box.style.display = 'block';
    });
    document.addEventListener('mousemove', e => {
      if (box.style.display === 'none') return;
      const x = e.clientX + 14, y = e.clientY + 14;
      box.style.left = (x + box.offsetWidth  > window.innerWidth  ? e.clientX - box.offsetWidth  - 8 : x) + 'px';
      box.style.top  = (y + box.offsetHeight > window.innerHeight ? e.clientY - box.offsetHeight - 8 : y) + 'px';
    });
    document.addEventListener('mouseout', e => {
      if (!e.target.closest('[data-perf-tip]')) return;
      if (e.relatedTarget?.closest('[data-perf-tip]')) return;
      box.style.display = 'none';
    });
  }

  // Uptime % bar + value cell con data-perf-tip para el tooltip
  function uptimeCell(u, casters) {
    const color = uptimeColor(u);
    const tipData = casters && casters.length
      ? casters.map(c => `${c.name}|${c.count}`).join(';')
      : '';
    const tipAttr = tipData ? ` data-perf-tip="${tipData}"` : '';
    return `<td class="val-cell" style="color:${color};${tipData ? 'cursor:help' : ''}"${tipAttr}>${u}%</td>
      <td class="bar-cell"><div class="bar-wrap"><div class="bar-fill" style="width:${Math.min(u,100)}%;background:${color}"></div></div></td>`;
  }

  // Merge duplicate boss entries (same boss can appear across multiple reports in a semana)
  function mergeBosses(sd) {
    const bossMap = new Map();
    for (const b of sd.bosses) {
      const key = `${b.boss}|${b.raid}`;
      if (!bossMap.has(key)) bossMap.set(key, { boss: b.boss, raid: b.raid, attempts: [] });
      const entry = bossMap.get(key);
      for (const a of b.attempts) entry.attempts.push({ ...a, attempt: entry.attempts.length + 1 });
    }
    return [...bossMap.values()].sort((a, b) => {
      if (a.raid !== b.raid) return a.raid === 'SSC' ? -1 : 1;
      const order = a.raid === 'SSC' ? SSC_BOSSES : TK_BOSSES;
      return order.indexOf(a.boss) - order.indexOf(b.boss);
    });
  }

  // Build per-player map for a single attempt
  function buildPlayerAttemptMap(attempt) {
    const map = new Map();
    function ensure(name) {
      if (!map.has(name)) map.set(name, { name, debuffs: [], cooldowns: [], trinkets: [] });
      return map.get(name);
    }
    for (const d of (attempt.bossDebuffs ?? [])) {
      for (const c of (d.casters ?? [])) {
        ensure(c.name).debuffs.push({ id: d.id, name: d.name, icon: d.icon, uptime: d.uptime, uses: c.count });
      }
    }
    for (const ab of (attempt.castsByAbility ?? [])) {
      for (const c of (ab.casters ?? [])) {
        const p = ensure(c.name);
        if (ab.isTrinket)    p.trinkets.push({ id: ab.id, name: ab.name, icon: ab.icon, count: c.count });
        else if (ab.isCooldown) p.cooldowns.push({ id: ab.id, name: ab.name, icon: ab.icon, count: c.count });
      }
    }
    return map;
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  // "Por Jugador" sub-tab for a single attempt
  function renderPorJugador(attempt, playerClasses) {
    const playerMap = buildPlayerAttemptMap(attempt);
    const players = sortByClass([...playerMap.values()], playerClasses);
    if (!players.length) return '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin datos para este intento.</p>';

    return players.map(p => {
      const cls = playerClasses[p.name] ?? '';

      const debuffChips = p.debuffs.map(d =>
        `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(224,112,112,0.08);border:1px solid rgba(224,112,112,0.25);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.82rem">
          ${perfLink(d.id, d.name, d.icon, false)}
          <span style="color:${uptimeColor(d.uptime)};font-size:0.78rem">${d.uptime}%</span>
          <span class="td-dim" style="font-size:0.75rem">×${d.uses}</span>
        </span>`
      ).join('');

      const cdChips = p.cooldowns.map(a =>
        `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(93,173,226,0.07);border:1px solid rgba(93,173,226,0.2);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.82rem">
          ${perfLink(a.id, a.name, a.icon, false)}
          <span class="td-dim">×${a.count}</span>
        </span>`
      ).join('');

      const tkChips = p.trinkets.map(a =>
        `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(155,89,182,0.07);border:1px solid rgba(155,89,182,0.2);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.82rem">
          ${perfLink(a.id, a.name, a.icon, true)}
          <span class="td-dim">×${a.count}</span>
        </span>`
      ).join('');

      const hasAny = debuffChips || cdChips || tkChips;
      return `<div style="display:grid;grid-template-columns:160px 1fr;gap:0.5rem 1rem;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.05);align-items:start">
        <div>
          ${playerNameHtml(p.name, playerClasses)}
          ${cls ? `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:0.1rem">${cls}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.35rem">
          ${debuffChips ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${debuffChips}</div>` : ''}
          ${cdChips     ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${cdChips}</div>` : ''}
          ${tkChips     ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${tkChips}</div>` : ''}
          ${!hasAny ? '<span class="td-dim" style="font-size:0.82rem;font-style:italic">Sin habilidades registradas</span>' : ''}
        </div>
      </div>`;
    }).join('');
  }

  // Shared table for debuffs OR buffs on boss — uptime% + bar + usos + casters
  function renderAurasTable(auras, emptyMsg, label, playerClasses) {
    if (!auras.length) return `<p class="td-dim" style="font-style:italic;padding:1rem 0">${emptyMsg}</p>`;
    const rows = auras.flatMap(d => {
      // Merged tank buff (Inspir/Ancest): one row per tank
      if (d.perTank) {
        const tankRows = d.perTank.filter(t => t.uptime > 0);
        if (!tankRows.length) return [];
        const castersHtml = (d.casters ?? []).map(c =>
          `<span style="color:var(--name)">${c.name}</span><span class="td-dim"> ×${c.count}</span>`
        ).join('&ensp;');
        return tankRows.map(t => {
          const cls = playerClasses?.[t.name] ?? '';
          const slug = cls.toLowerCase();
          const clsImg = cls ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/classicon_${slug}.jpg" style="width:13px;height:13px;border-radius:2px;vertical-align:middle;margin-right:0.2rem" alt="${cls}">` : '';
          const buffLinks = d.iconParts
            ? d.iconParts.map(({ id, icon }, pi) =>
                perfLink(id, pi === 0 ? 'Inspir' : 'Ancest', icon, false)
              ).join('<span style="color:var(--text-dim);margin:0 0.1rem">/</span>')
            : perfLink(d.id, d.name, d.icon, false);
          const tankSubLabel = `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:0.1rem;line-height:1">${clsImg}${t.name}</div>`;
          return `<tr>
            <td style="white-space:nowrap;padding-top:0.2rem;padding-bottom:0.2rem"><div style="line-height:1">${buffLinks}</div>${tankSubLabel}</td>
            ${uptimeCell(t.uptime, d.casters)}
            <td class="td-dim">${d.uses ?? '—'} veces</td>
            <td style="font-size:0.85rem">${castersHtml}</td>
          </tr>`;
        });
      }
      const castersHtml = (d.casters ?? []).map(c =>
        `<span style="color:var(--name)">${c.name}</span><span class="td-dim"> ×${c.count}</span>`
      ).join('&ensp;');
      return [`<tr>
        <td style="white-space:nowrap">${perfLink(d.id, d.name, d.icon, false)}</td>
        ${uptimeCell(d.uptime, null)}
        <td class="td-dim">${d.uses} veces</td>
        <td style="font-size:0.85rem">${castersHtml}</td>
      </tr>`];
    }).join('');
    return `<table class="ranked-list"><thead><tr><th>${label}</th><th>Uptime</th><th></th><th>Usos</th><th>Aplicado por</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // ── buildMatrix (reutilizable: por semana y global) ─────────────────────────
  // killsByBoss: [{boss, raid, kills}] ordenado SSC→TK
  function buildMatrix(killsByBoss, getAuras, sectionLabel, playerClasses) {
    const auraMap = new Map();
    for (const { kills } of killsByBoss) {
      for (const kill of kills) {
        for (const a of (getAuras(kill) ?? [])) {
          if (!auraMap.has(a.id)) auraMap.set(a.id, { id: a.id, name: a.name, icon: a.icon, iconParts: a.iconParts });
        }
      }
    }
    const allAuras = [...auraMap.values()];
    if (!allAuras.length) return '';

    function auraAvg(af) {
      let sum = 0, count = 0;
      for (const { kills } of killsByBoss) {
        const us = kills.map(k => (getAuras(k) ?? []).find(x => x.id === af.id)?.uptime).filter(u => u != null);
        if (us.length) { sum += Math.round(us.reduce((a, b) => a + b, 0) / us.length); count++; }
      }
      return count ? Math.round(sum / count) : 0;
    }
    allAuras.sort((a, b) => auraAvg(b) - auraAvg(a));

    const AURA_SHORT = {
      'Judgement of the Crusader': 'J. Crusader',
      'Judgement of Wisdom':       'J. Wisdom',
      'Judgement of Light':        'J. Light',
      'Curse of Recklessness':     'C. Reckless',
      'Curse of the Elements':     'C. Elements',
      'Demoralizing Shout':        'Demo Shout',
      'Commanding Shout':          'Comm. Shout',
      'Vampiric Embrace':          'Vamp. Embrace',
      'Vampiric Touch':            'Vamp. Touch',
      'Shadow Embrace':            'Sh. Embrace',
      'Expose Weakness':           'Exp. Weakness',
      'Expose Armor':              'Exp. Armor',
      'Hunter\'s Mark':            'Hunt. Mark',
    };
    const AURA_NOTE = {
      'Sunder Armor':        'sust. por Exp. Armor',
      'Faerie Fire (Feral)': 'innec. si hay Pollo',
    };
    const BOSS_SHORT = {
      'Lurker':     'Lurk',
      'Hydross':    'Hydr',
      'Morogrim':   'Moro',
      'Karathress': 'Kara',
      'Leotheras':  'Leo',
      'VoidReaver': 'Void',
      'Solarian':   'Solar',
      'Kaelthas':   'Kael',
    };

    const allBosses = killsByBoss;
    const sscCount  = allBosses.filter(b => b.raid === 'SSC').length;
    const tkCount   = allBosses.filter(b => b.raid === 'TK').length;
    const mediaBorder = 'border-left:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(255,255,255,0.25)';

    const groupHeader = (sscCount && tkCount)
      ? `<tr><th></th><th style="${mediaBorder}"></th>` +
        `<th colspan="${sscCount}" style="text-align:center;color:var(--text-dim);font-size:0.72rem;letter-spacing:0.06em;padding-bottom:0.1rem">SSC</th>` +
        `<th colspan="${tkCount}" style="text-align:center;color:var(--text-dim);font-size:0.72rem;letter-spacing:0.06em;padding-bottom:0.1rem;border-left:2px solid rgba(255,255,255,0.2)">TK</th></tr>`
      : '';

    const headers = allBosses.map(({ boss, raid }, i) => {
      const isTkFirst = raid === 'TK' && (i === 0 || allBosses[i - 1].raid === 'SSC');
      const border = isTkFirst ? 'border-left:2px solid rgba(255,255,255,0.2);' : '';
      return `<th style="text-align:center;${border}">${BOSS_SHORT[boss] ?? boss}</th>`;
    }).join('');

    const rows = allAuras.flatMap(af => {
      const shortName = AURA_SHORT[af.name] ?? af.name;
      const hasPerTank = allBosses.some(({ kills }) =>
        kills.some(k => (getAuras(k) ?? []).find(a => a.id === af.id)?.perTank?.length)
      );
      if (hasPerTank) {
        const tankNames = [...new Set(
          allBosses.flatMap(({ kills }) =>
            kills.flatMap(k =>
              (getAuras(k) ?? []).find(a => a.id === af.id)?.perTank?.filter(t => t.uptime > 0).map(t => t.name) ?? []
            )
          )
        )];
        return tankNames.map((tankName) => {
          let sumAll = 0, countAll = 0;
          const cells = allBosses.map(({ kills, raid }, i) => {
            const isTkFirst = raid === 'TK' && (i === 0 || allBosses[i - 1].raid === 'SSC');
            const border = isTkFirst ? 'border-left:2px solid rgba(255,255,255,0.2);' : '';
            const uptimes = [];
            const casterMap = new Map();
            for (const k of kills) {
              const a = (getAuras(k) ?? []).find(a => a.id === af.id);
              const pt = a?.perTank?.find(t => t.name === tankName);
              if (pt !== undefined) {
                uptimes.push(pt.uptime);
                for (const c of (a.casters ?? [])) casterMap.set(c.name, (casterMap.get(c.name) ?? 0) + c.count);
              }
            }
            if (!uptimes.length) return `<td class="td-dim" style="text-align:center;${border}">—</td>`;
            const avg = Math.round(uptimes.reduce((a, b) => a + b, 0) / uptimes.length);
            sumAll += avg; countAll++;
            const color = uptimeColor(avg);
            const tipData = [...casterMap.entries()].map(([n, c]) => `${n}|${c}`).join(';');
            const tipAttr = tipData ? ` data-perf-tip="${tipData}"` : '';
            return `<td style="text-align:center;color:${color};font-weight:600;${border}${tipData?'cursor:help':''}"${tipAttr}>${avg}%</td>`;
          });
          const avgAll = countAll ? Math.round(sumAll / countAll) : null;
          const avgCell = avgAll !== null
            ? `<td style="text-align:center;color:${uptimeColor(avgAll)};font-weight:700;border-left:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(255,255,255,0.25)">${avgAll}%</td>`
            : '<td class="td-dim" style="text-align:center;border-left:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(255,255,255,0.25)">—</td>';
          const labelCasterMap = new Map();
          for (const { kills } of allBosses)
            for (const k of kills)
              for (const c of ((getAuras(k) ?? []).find(a => a.id === af.id)?.casters ?? []))
                labelCasterMap.set(c.name, (labelCasterMap.get(c.name) ?? 0) + c.count);
          const labelTipData = [...labelCasterMap.entries()].map(([n, c]) => `${n}|${c}`).join(';');
          const cls = playerClasses?.[tankName] ?? '';
          const slug = cls.toLowerCase();
          const clsImg = cls ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/classicon_${slug}.jpg" style="width:13px;height:13px;border-radius:2px;vertical-align:middle;margin-right:0.2rem" alt="${cls}">` : '';
          const buffLinks = af.iconParts
            ? af.iconParts.map(({ id, icon }, pi) =>
                perfLink(id, pi === 0 ? 'Inspir' : 'Ancest', icon, false, 16)
              ).join('<span style="color:var(--text-dim);margin:0 0.1rem">/</span>')
            : perfLink(af.id, shortName, af.icon, false, 16);
          const tankSubLabel = `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:0.1rem;line-height:1">${clsImg}${tankName}</div>`;
          const labelTipAttr = labelTipData ? ` data-perf-tip="${labelTipData}" style="white-space:nowrap;padding-top:0.2rem;padding-bottom:0.2rem;cursor:help"` : ` style="white-space:nowrap;padding-top:0.2rem;padding-bottom:0.2rem"`;
          return `<tr><td${labelTipAttr}><div style="line-height:1">${buffLinks}</div>${tankSubLabel}</td>${avgCell}${cells.join('')}</tr>`;
        });
      }

      let sumAll = 0, countAll = 0;
      const cells = allBosses.map(({ kills, raid }, i) => {
        const isTkFirst = raid === 'TK' && (i === 0 || allBosses[i - 1].raid === 'SSC');
        const border = isTkFirst ? 'border-left:2px solid rgba(255,255,255,0.2);' : '';
        const uptimes = [];
        const casterMap = new Map();
        for (const kill of kills) {
          const a = (getAuras(kill) ?? []).find(a => a.id === af.id);
          if (a) {
            uptimes.push(a.uptime);
            for (const c of (a.casters ?? [])) casterMap.set(c.name, (casterMap.get(c.name) ?? 0) + c.count);
          }
        }
        if (!uptimes.length) return `<td class="td-dim" style="text-align:center;${border}">—</td>`;
        const avg = Math.round(uptimes.reduce((a, b) => a + b, 0) / uptimes.length);
        sumAll += avg; countAll++;
        const color = uptimeColor(avg);
        const tipData = [...casterMap.entries()].map(([n, c]) => `${n}|${c}`).join(';');
        const tipAttr = tipData ? ` data-perf-tip="${tipData}"` : '';
        return `<td style="text-align:center;color:${color};font-weight:600;${border}cursor:${tipData ? 'help' : 'default'}"${tipAttr}>${avg}%</td>`;
      });
      const avgAll = countAll ? Math.round(sumAll / countAll) : null;
      const avgCell = avgAll !== null
        ? `<td style="text-align:center;color:${uptimeColor(avgAll)};font-weight:700;border-left:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(255,255,255,0.25)">${avgAll}%</td>`
        : '<td class="td-dim" style="text-align:center;border-left:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(255,255,255,0.25)">—</td>';
      const auraNote = AURA_NOTE[af.name];
      const noteHtml = auraNote ? `<div style="font-size:0.68rem;color:var(--text-dim);margin-top:0.1rem;line-height:1;white-space:nowrap">${auraNote}</div>` : '';
      return [`<tr><td style="white-space:nowrap">${perfLink(af.id, shortName, af.icon, false, 16)}${noteHtml}</td>${avgCell}${cells.join('')}</tr>`];
    });

    return `<div style="overflow-x:auto;margin-bottom:1.5rem">
      <table class="ranked-list perf-matrix">
        <thead>${groupHeader}<tr><th>${sectionLabel}</th><th style="text-align:center;${mediaBorder}">Media</th>${headers}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;
  }

  // ── Resumen de Semana (matrices debuff/buff) ─────────────────────────────────
  function renderSemanaResumen(sd, playerClasses) {
    const bosses = mergeBosses(sd);
    const killsByBoss = bosses.map(b => ({
      boss: b.boss, raid: b.raid,
      kills: b.attempts.filter(a => a.killed),
    })).filter(b => b.kills.length);

    if (!killsByBoss.length) return '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin kills esta semana.</p>';

    const debuffMatrix = buildMatrix(killsByBoss, k => k.bossDebuffs, 'Debuff en Boss', playerClasses);
    const buffMatrix   = buildMatrix(killsByBoss, k => k.playerBuffs,  'Buff', playerClasses);

    const sections = [];
    if (debuffMatrix) sections.push(`<div style="margin-bottom:2rem">
      <div style="font-size:0.78rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.7rem">Uptime de Debuffs en Boss (media de kills)</div>
      ${debuffMatrix}
    </div>`);
    if (buffMatrix) sections.push(`<div style="margin-bottom:2rem">
      <div style="font-size:0.78rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.7rem">Uptime de Buffs de Raid (media de kills)</div>
      ${buffMatrix}
    </div>`);
    return sections.join('') || '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin datos esta semana.</p>';
  }

  // ── Resumen por Jugador (por semana) ────────────────────────────────────────
  function renderJugadoresResumen(sd, playerClasses) {
    const bosses = mergeBosses(sd);
    const killsByBoss = bosses.map(b => ({
      boss: b.boss, raid: b.raid,
      kills: b.attempts.filter(a => a.killed),
    })).filter(b => b.kills.length);
    if (!killsByBoss.length) return '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin kills esta semana.</p>';

    const playerSummary = new Map();
    function ensurePlayer(name) {
      if (!playerSummary.has(name)) playerSummary.set(name, { debuffs: new Map(), cooldowns: new Map(), trinkets: new Map() });
      return playerSummary.get(name);
    }
    // Recopilar kills por debuff para calcular uptime promedio sobre TODOS los bosses,
    // contando 0% en kills donde el jugador no aplicó el debuff
    const debuffKillsMap = new Map(); // id → [{uptime, name, icon, casterMap}]
    for (const { kills } of killsByBoss) {
      for (const kill of kills) {
        for (const d of (kill.bossDebuffs ?? [])) {
          if (!debuffKillsMap.has(d.id)) debuffKillsMap.set(d.id, []);
          debuffKillsMap.get(d.id).push({ uptime: d.uptime, durationMs: kill.durationMs, name: d.name, icon: d.icon, casterMap: new Map((d.casters ?? []).map(c => [c.name, c.count])) });
        }
        for (const ab of (kill.castsByAbility ?? [])) {
          for (const c of (ab.casters ?? [])) {
            const p = ensurePlayer(c.name);
            if (ab.isTrinket) {
              if (!p.trinkets.has(ab.id)) p.trinkets.set(ab.id, { id: ab.id, name: ab.name, icon: ab.icon, counts: [] });
              p.trinkets.get(ab.id).counts.push(c.count);
            } else if (ab.isCooldown) {
              if (!p.cooldowns.has(ab.id)) p.cooldowns.set(ab.id, { id: ab.id, name: ab.name, icon: ab.icon, counts: [] });
              p.cooldowns.get(ab.id).counts.push(c.count);
            }
          }
        }
      }
    }
    // Construir debuffs por jugador: uptime atribuido proporcionalmente por casts
    // attributed_ms = (player_casts / total_casts) × (uptime% × durationMs) por kill
    // uptimePct = sum(attributed_ms) / sum(durationMs de todos los kills con ese debuff)
    for (const [abilId, killDataArr] of debuffKillsMap) {
      const first = killDataArr[0];
      const totalMs = killDataArr.reduce((s, kd) => s + kd.durationMs, 0);
      const allCasters = new Set(killDataArr.flatMap(kd => [...kd.casterMap.keys()]));
      for (const name of allCasters) {
        const p = ensurePlayer(name);
        if (!p.debuffs.has(abilId)) p.debuffs.set(abilId, { id: abilId, name: first.name, icon: first.icon, uptimePct: 0, uses: 0 });
        const e = p.debuffs.get(abilId);
        const attributedMs = killDataArr.reduce((s, kd) => {
          const totalCasts = [...kd.casterMap.values()].reduce((a, b) => a + b, 0);
          const playerCasts = kd.casterMap.get(name) ?? 0;
          return s + (totalCasts > 0 ? playerCasts / totalCasts * (kd.uptime / 100 * kd.durationMs) : 0);
        }, 0);
        e.uptimePct = Math.round(attributedMs / totalMs * 100);
        e.uses += killDataArr.reduce((s, kd) => s + (kd.casterMap.get(name) ?? 0), 0);
      }
    }
    const sortedPlayers = sortByClass(
      [...playerSummary.entries()].map(([name, data]) => ({ name, ...data })),
      playerClasses
    );
    return sortedPlayers.map(({ name, debuffs, cooldowns, trinkets }) => {
      const cls = playerClasses[name] ?? '';
      const debuffChips = [...debuffs.values()].map(d => {
        return `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(224,112,112,0.08);border:1px solid rgba(224,112,112,0.25);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.8rem">
          ${perfLink(d.id, d.name, d.icon, false)}
          <span style="color:${uptimeColor(d.uptimePct)};font-size:0.78rem">${d.uptimePct}%</span>
          <span class="td-dim" style="font-size:0.75rem">×${d.uses}</span>
        </span>`;
      }).join('');
      const cdChips = [...cooldowns.values()].map(a => {
        const total = a.counts.reduce((s, c) => s + c, 0);
        return `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(93,173,226,0.07);border:1px solid rgba(93,173,226,0.2);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.8rem">
          ${perfLink(a.id, a.name, a.icon, false)}<span class="td-dim">×${total}</span>
        </span>`;
      }).join('');
      const tkChips = [...trinkets.values()].map(a => {
        const total = a.counts.reduce((s, c) => s + c, 0);
        return `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:rgba(155,89,182,0.07);border:1px solid rgba(155,89,182,0.2);border-radius:3px;padding:0.1rem 0.45rem;font-size:0.8rem">
          ${perfLink(a.id, a.name, a.icon, true)}<span class="td-dim">×${total}</span>
        </span>`;
      }).join('');
      const hasAny = debuffChips || cdChips || tkChips;
      return `<div style="display:grid;grid-template-columns:160px 1fr;gap:0.5rem 1rem;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.05);align-items:start">
        <div>
          ${playerNameHtml(name, playerClasses)}
          ${cls ? `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:0.1rem">${cls}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.35rem">
          ${debuffChips ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${debuffChips}</div>` : ''}
          ${cdChips     ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${cdChips}</div>` : ''}
          ${tkChips     ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem">${tkChips}</div>` : ''}
          ${!hasAny ? '<span class="td-dim" style="font-size:0.82rem;font-style:italic">Sin habilidades registradas</span>' : ''}
        </div>
      </div>`;
    }).join('') || '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin datos de jugadores.</p>';
  }

  // ── Resumen Global ───────────────────────────────────────────────────────────
  function renderGlobalResumen() {
    const hEntry = historial.slice().sort((a, b) => b.semana.localeCompare(a.semana))[0];
    const playerClasses = hEntry?.playerClasses ?? {};

    const globalBossMap = new Map();
    for (const sd of semanas) {
      for (const b of (sd.bosses ?? [])) {
        const key = `${b.boss}|${b.raid}`;
        if (!globalBossMap.has(key)) globalBossMap.set(key, { boss: b.boss, raid: b.raid, kills: [] });
        for (const a of (b.attempts ?? [])) {
          if (a.killed) globalBossMap.get(key).kills.push(a);
        }
      }
    }
    const globalKillsByBoss = [...globalBossMap.values()]
      .sort((a, b) => {
        if (a.raid !== b.raid) return a.raid === 'SSC' ? -1 : 1;
        const order = a.raid === 'SSC' ? SSC_BOSSES : TK_BOSSES;
        return order.indexOf(a.boss) - order.indexOf(b.boss);
      })
      .filter(b => b.kills.length);

    if (!globalKillsByBoss.length) return '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin kills registradas.</p>';

    const debuffMatrix = buildMatrix(globalKillsByBoss, k => k.bossDebuffs, 'Debuff en Boss', playerClasses);
    const buffMatrix   = buildMatrix(globalKillsByBoss, k => k.playerBuffs,  'Buff', playerClasses);

    const sections = [];
    if (debuffMatrix) sections.push(`<div style="margin-bottom:2rem">
      <div style="font-size:0.78rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.7rem">Uptime de Debuffs en Boss (media global de kills)</div>
      ${debuffMatrix}
    </div>`);
    if (buffMatrix) sections.push(`<div style="margin-bottom:2rem">
      <div style="font-size:0.78rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.7rem">Uptime de Buffs de Raid (media global de kills)</div>
      ${buffMatrix}
    </div>`);
    return sections.join('') || '<p class="td-dim" style="font-style:italic;padding:1rem 0">Sin datos.</p>';
  }

  // ── Por Boss view ───────────────────────────────────────────────────────────
  function renderBossView(sd, playerClasses) {
    const bosses = mergeBosses(sd);
    const state = { activeBoss: bosses[0] ?? null, activeAIdx: 0, activeSub: 'debuffs' };
    if (state.activeBoss) {
      const kills = state.activeBoss.attempts.map((a, i) => a.killed ? i : -1).filter(i => i !== -1);
      state.activeAIdx = kills.length ? kills[kills.length - 1] : state.activeBoss.attempts.length - 1;
    }

    const container = document.createElement('div');

    function render() {
      const SUBTABS = [
        { key: 'debuffs',   label: 'Debuffs en Boss' },
        { key: 'buffs',     label: 'Buffs' },
        { key: 'jugadores', label: 'Por Jugador' },
      ];

      const bossPills = bosses.map(b => {
        const isSel = state.activeBoss && b.boss === state.activeBoss.boss && b.raid === state.activeBoss.raid;
        const kills = b.attempts.filter(a => a.killed).length;
        return `<button class="sub-tab-btn ${isSel ? 'active' : ''}" data-pboss="${b.boss}" data-praid="${b.raid}" style="display:inline-flex;align-items:center;gap:0.35rem">
          <span class="raid-badge ${b.raid.toLowerCase()}" style="font-size:0.62rem">${b.raid}</span>
          ${b.boss}
          <span style="font-size:0.7rem;color:${kills ? '#7dce82' : '#e07070'}">${kills ? '✓' : '✗'}</span>
        </button>`;
      }).join('');

      let wipeCount = 0;
      const attemptPills = state.activeBoss ? state.activeBoss.attempts.map((a, i) => {
        const label = a.killed ? 'Kill' : `Wipe ${++wipeCount}`;
        return `<button class="sub-tab-btn ${i === state.activeAIdx ? 'active' : ''}" data-paidx="${i}">${label} <span class="td-dim" style="font-size:0.72rem">${fmtMs(a.durationMs)}</span></button>`;
      }).join('') : '';

      const subTabsHtml = SUBTABS.map(t =>
        `<button class="sub-tab-btn ${t.key === state.activeSub ? 'active' : ''}" data-perfsub="${t.key}">${t.label}</button>`
      ).join('');

      const attempt = state.activeBoss?.attempts[state.activeAIdx];
      let subContent = '<p class="td-dim">Sin datos.</p>';
      if (attempt) {
        if (state.activeSub === 'jugadores') {
          subContent = renderPorJugador(attempt, playerClasses);
        } else if (state.activeSub === 'debuffs') {
          subContent = renderAurasTable(attempt.bossDebuffs ?? [], 'Sin debuffs de boss para este intento.', 'Debuff en Boss');
        } else if (state.activeSub === 'buffs') {
          subContent = renderAurasTable(attempt.playerBuffs ?? [], 'Sin buffs para este intento.', 'Buff', playerClasses);
        }
      }

      container.innerHTML = `
        <div style="margin-bottom:1rem">
          <div style="font-size:0.72rem;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem">Boss</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem" id="perf-boss-pills">${bossPills}</div>
        </div>
        ${state.activeBoss ? `
        <div style="margin-bottom:1.5rem">
          <div style="font-size:0.72rem;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem">Intento</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem" id="perf-attempt-pills">${attemptPills}</div>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:1rem 1.25rem">
          <div class="sub-nav" style="padding:0;margin:0 0 1.25rem;border-bottom:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;display:flex" id="perf-sub-tabs">${subTabsHtml}</div>
          <div id="perf-sub-content">${subContent}</div>
        </div>` : ''}
      `;

      container.querySelector('#perf-boss-pills')?.addEventListener('click', e => {
        const btn = e.target.closest('[data-pboss]');
        if (!btn) return;
        state.activeBoss = bosses.find(b => b.boss === btn.dataset.pboss && b.raid === btn.dataset.praid);
        if (state.activeBoss) {
          const kills = state.activeBoss.attempts.map((a, i) => a.killed ? i : -1).filter(i => i !== -1);
          state.activeAIdx = kills.length ? kills[kills.length - 1] : state.activeBoss.attempts.length - 1;
        }
        render();
      });
      container.querySelector('#perf-attempt-pills')?.addEventListener('click', e => {
        const btn = e.target.closest('[data-paidx]');
        if (!btn) return;
        state.activeAIdx = +btn.dataset.paidx;
        render();
      });
      container.querySelector('#perf-sub-tabs')?.addEventListener('click', e => {
        const btn = e.target.closest('[data-perfsub]');
        if (!btn) return;
        state.activeSub = btn.dataset.perfsub;
        render();
      });
    }

    render();
    return container;
  }

  // ── Main ────────────────────────────────────────────────────────────────────

  let activeTopMode = 'global'; // 'global' | 'semana'
  let activeMode    = 'semana'; // 'semana' | 'jugadores' | 'boss'

  function renderView(sd) {
    const hEntry = historial.find(e => e.semana === sd.semana);
    const playerClasses = hEntry?.playerClasses ?? {};
    const bodyEl = document.getElementById('perf-body');
    if (activeMode === 'semana') {
      bodyEl.innerHTML = renderSemanaResumen(sd, playerClasses);
    } else if (activeMode === 'jugadores') {
      bodyEl.innerHTML = renderJugadoresResumen(sd, playerClasses);
    } else {
      bodyEl.innerHTML = '';
      bodyEl.appendChild(renderBossView(sd, playerClasses));
    }
  }

  el.innerHTML = `
    <div style="display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem">
      <button class="sub-tab-btn active" id="perf-top-global" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">Resumen General</button>
      <button class="sub-tab-btn" id="perf-top-semana" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">Por Semana</button>
    </div>
    <div id="perf-global-section">
      <div id="perf-global-body"></div>
    </div>
    <div id="perf-semana-section" style="display:none">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap">
        <span style="color:var(--text-dim);font-size:1rem;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.05em">Semana</span>
        <select class="loot-select" id="perf-semana-sel" style="min-width:260px;width:auto;margin-bottom:0">
          ${semanas.map(s => `<option value="${s.semana}">${semanaLabel(s)}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem">
        <button class="sub-tab-btn active" id="perf-mode-semana" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">📊 Resumen de Semana</button>
        <button class="sub-tab-btn" id="perf-mode-jugadores" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">👤 Resumen por Jugador</button>
        <button class="sub-tab-btn" id="perf-mode-boss" style="font-family:'Cinzel',serif;font-size:0.93rem;font-weight:600;letter-spacing:.06em;padding:.55rem 1.5rem;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">⚔️ Por Boss</button>
      </div>
      <div id="perf-body"></div>
    </div>
  `;

  // Render global resumen immediately
  document.getElementById('perf-global-body').innerHTML = renderGlobalResumen();

  // Top-level nav
  document.getElementById('perf-top-global').addEventListener('click', () => {
    activeTopMode = 'global';
    document.getElementById('perf-top-global').classList.add('active');
    document.getElementById('perf-top-semana').classList.remove('active');
    document.getElementById('perf-global-section').style.display = '';
    document.getElementById('perf-semana-section').style.display = 'none';
  });
  document.getElementById('perf-top-semana').addEventListener('click', () => {
    activeTopMode = 'semana';
    document.getElementById('perf-top-semana').classList.add('active');
    document.getElementById('perf-top-global').classList.remove('active');
    document.getElementById('perf-global-section').style.display = 'none';
    document.getElementById('perf-semana-section').style.display = '';
    const sd = semanas.find(s => s.semana === document.getElementById('perf-semana-sel').value) ?? semanas[0];
    if (sd) renderView(sd);
  });

  // Mode buttons (within Por Semana)
  document.getElementById('perf-mode-semana').addEventListener('click', () => {
    activeMode = 'semana';
    document.getElementById('perf-mode-semana').classList.add('active');
    document.getElementById('perf-mode-jugadores').classList.remove('active');
    document.getElementById('perf-mode-boss').classList.remove('active');
    const sd = semanas.find(s => s.semana === document.getElementById('perf-semana-sel').value);
    if (sd) renderView(sd);
  });
  document.getElementById('perf-mode-jugadores').addEventListener('click', () => {
    activeMode = 'jugadores';
    document.getElementById('perf-mode-jugadores').classList.add('active');
    document.getElementById('perf-mode-semana').classList.remove('active');
    document.getElementById('perf-mode-boss').classList.remove('active');
    const sd = semanas.find(s => s.semana === document.getElementById('perf-semana-sel').value);
    if (sd) renderView(sd);
  });
  document.getElementById('perf-mode-boss').addEventListener('click', () => {
    activeMode = 'boss';
    document.getElementById('perf-mode-boss').classList.add('active');
    document.getElementById('perf-mode-semana').classList.remove('active');
    document.getElementById('perf-mode-jugadores').classList.remove('active');
    const sd = semanas.find(s => s.semana === document.getElementById('perf-semana-sel').value);
    if (sd) renderView(sd);
  });
  document.getElementById('perf-semana-sel').addEventListener('change', e => {
    const sd = semanas.find(s => s.semana === e.target.value);
    if (sd) renderView(sd);
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildCitaDelDia();
  buildHeaderMeta();

  document.getElementById('loader').style.display = 'none';
  document.getElementById('app').style.display    = 'block';

  // Tabs
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  setupJugador();

  // Hash-based navigation
  const VALID_TABS = new Set(['resumen','progresion','logros','por-semana','cla','performance','verguenza','mecanicas','historial','jugador','loot-resumen','loot-registro']);
  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (VALID_TABS.has(hash)) switchTab(hash);
  });

  // Render inicial
  const initHash = location.hash.slice(1);
  if (VALID_TABS.has(initHash)) {
    switchTab(initHash);
  } else {
    rendered.add('resumen');
    renderTab('resumen');
  }
});

// ── CHANGELOG ─────────────────────────────────────────────────────────────────

const CHANGELOG = [
  {
    fecha: '21/05/2026',
    titulo: 'Tab Rendimiento',
    secciones: [
      {
        nombre: 'Rendimiento — nuevo tab',
        items: [
          'Nuevo tab <strong>Rendimiento</strong>: un vistazo completo a cómo se aplican los debuffs y buffs de boss en cada raid, y qué cooldowns y trinkets usa cada jugador.',
          '<strong>Resumen General</strong>: tabla global con el uptime % medio de todos los debuffs y buffs en cada boss, acumulando todas las semanas.',
          '<strong>Por Semana → Resumen</strong>: la misma tabla pero filtrando por semana concreta, mostrando el uptime % medio de los kills de esa raid.',
          '<strong>Por Semana → Por Jugador</strong>: para cada jugador, qué debuffs aplica a lo largo de la semana (con su uptime % y nº de aplicaciones totales), y qué cooldowns de raid y trinkets activa.',
          '<strong>Por Semana → Por Boss</strong>: detalle boss a boss e intento a intento (kill o wipe), con tres subtabs — Debuffs, Buffs y Por Jugador — donde se ve el uptime %, las aplicaciones y quién lo hace, además de los cooldowns y trinkets usados en ese intento concreto.',
        ],
      },
    ],
  },
  {
    fecha: '20/05/2026',
    titulo: 'Combat Log Analysis & Mejoras de Preparación',
    secciones: [
      {
        nombre: 'Preparación — nuevo tab',
        items: [
          'Nuevo tab <strong>CLA (Combat Log Analysis)</strong>: analiza los logs de combate para medir la preparación real de cada jugador en cada raid.',
          'Vista <strong>Resumen General</strong>: media de PREP % por jugador sobre todas las raids, con barras de consumibles y gear, gráfica evolutiva y badges de mejor/peor preparado.',
          'Vista <strong>Por Raid</strong>: desglose detallado por jugador de consumibles (flask, comida, mejora de arma, pociones, pergaminos) y gear (encantamientos, gemas, items subóptimos).',
          'Botón <em>ℹ️ Cálculos</em> con la explicación completa de cómo se calculan todos los porcentajes. Solo se tienen en cuenta peleas de boss (tries y kills), no trash.',
        ],
      },
      {
        nombre: 'Ficha de Jugador',
        items: [
          'Nueva sección <strong>Evolución de Preparación</strong> en la ficha de cada jugador con gráfica histórica de su PREP % raid a raid.',
          'Nuevo stat <strong>Prep. Media</strong> en el resumen de estadísticas del jugador.',
        ],
      },
      {
        nombre: 'Vergüenza & Logros',
        items: [
          'Corregidos algunos cálculos del score de vergüenza que no estaban bien aplicados.',
          'Los rankings de vergüenza, logros y otros apartados ahora requieren un <strong>mínimo del 30% de asistencia a raids</strong> para aparecer, evitando resultados sesgados por poca muestra.',
        ],
      },
    ],
  },
]

;(function initChangelog() {
  const modal    = document.getElementById('changelog-modal');
  const overlay  = document.getElementById('changelog-overlay');
  const closeBtn = document.getElementById('changelog-close');
  const openBtn  = document.getElementById('btn-changelog');
  const timeline = document.getElementById('changelog-timeline');
  const entries  = document.getElementById('changelog-entries');

  entries.innerHTML = CHANGELOG.map((entry, i) => {
    const id = `cl-${i}`;
    const sectionsHTML = entry.secciones.map(s => `
      <div class="cl-section">
        <div class="cl-section-name">${s.nombre}</div>
        <ul>${s.items.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>`).join('');
    return `<div class="cl-entry" id="${id}">
      <div class="cl-date">${entry.fecha}</div>
      <div class="cl-title">${entry.titulo}</div>
      ${sectionsHTML}
    </div>`;
  }).join('<hr style="border:none;border-top:1px solid var(--border);margin:1.5rem 0">');

  timeline.innerHTML = CHANGELOG.map((entry, i) =>
    `<a href="#cl-${i}" data-idx="${i}">${entry.fecha}</a>`
  ).join('');

  const entryEls = entries.querySelectorAll('.cl-entry');
  const timeLinks = timeline.querySelectorAll('a');
  if (timeLinks[0]) timeLinks[0].classList.add('active');
  entries.addEventListener('scroll', () => {
    let current = 0;
    entryEls.forEach((el, i) => { if (el.offsetTop - entries.scrollTop <= 20) current = i; });
    timeLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  });

  timeline.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = entries.querySelector(`#cl-${a.dataset.idx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const open  = () => modal.classList.add('open');
  const close = () => modal.classList.remove('open');
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
;(function () {
  const tip = document.getElementById('custom-tooltip');
  if (!tip) return;
  let current = null;
  function show(target) {
    const body = target.dataset.tooltip || '';
    if (!body) return;
    tip.innerHTML = `<div class="ct-body">${body}</div>`;
    tip.classList.add('ct-visible');
    current = target;
  }
  function hide() { tip.classList.remove('ct-visible'); current = null; }
  function place(e) {
    if (!current) return;
    const x = e.clientX + 16, y = e.clientY - 12;
    const rw = tip.offsetWidth, rh = tip.offsetHeight;
    tip.style.left = (x + rw > window.innerWidth  ? e.clientX - rw - 8 : x) + 'px';
    tip.style.top  = (y + rh > window.innerHeight ? e.clientY - rh - 8 : y) + 'px';
  }
  document.addEventListener('mouseover',  e => { const el = e.target.closest('[data-tooltip]'); if (el && el !== current) show(el); else if (!el && current) hide(); });
  document.addEventListener('mouseout',   e => { if (current && !current.contains(e.relatedTarget)) hide(); });
  document.addEventListener('mousemove',  place);
})();
