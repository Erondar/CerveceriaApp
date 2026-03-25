'use strict';

require('dotenv').config();

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const { parseReportUrl, findGruulKill, getFriendlyFireLeaderboard, fetchDeathStats, fetchAllHitStats, fetchInterruptLeaderboard, fetchDispelLeaderboard, fetchRoster } = require('./src/warcraftlogs');
const { buildResacaMessage } = require('./src/messages');

const DISCORD_API = 'https://discord.com/api/v10';

const [TARGET_USER_ID, REPORT_URL] = process.argv.slice(2);

if (!TARGET_USER_ID || !REPORT_URL) {
  console.error('Uso: node simulate_dm.js <discord_user_id> <warcraftlogs_url>');
  console.error('Ejemplo: node simulate_dm.js 1273587815153930243 https://fresh.warcraftlogs.com/reports/kyvqD9aAbF6PLYhV');
  process.exit(1);
}

const parsed_url = require('./src/warcraftlogs').parseReportUrl(REPORT_URL);
if (!parsed_url) {
  console.error('❌ URL de WarcraftLogs no válida.');
  process.exit(1);
}
const REPORT_CODE = parsed_url.code;

// ── Historial helpers (inline, con historial filtrado) ────────────────────────

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function getPodioGeneral(historial) {
  const ffTotales       = new Map();
  const deathTotales    = new Map();
  const timeDeadTotales = new Map();
  const portadorCount   = new Map();

  for (const raid of historial) {
    for (const e of raid.leaderboard)
      ffTotales.set(e.name, (ffTotales.get(e.name) ?? 0) + e.damage);
    for (const e of (raid.deathStats?.deaths   ?? []))
      deathTotales.set(e.name, (deathTotales.get(e.name) ?? 0) + e.count);
    for (const e of (raid.deathStats?.timeDead ?? []))
      timeDeadTotales.set(e.name, (timeDeadTotales.get(e.name) ?? 0) + e.ms);
    if (raid.leaderboard.length > 0) {
      const w = raid.leaderboard[0].name;
      portadorCount.set(w, (portadorCount.get(w) ?? 0) + 1);
    }
  }

  let rachaActiva = null;
  if (historial.length > 0) {
    const lastWinner = historial[historial.length - 1].leaderboard[0]?.name;
    if (lastWinner) {
      let streak = 0;
      for (let i = historial.length - 1; i >= 0; i--) {
        if (historial[i].leaderboard[0]?.name === lastWinner) streak++;
        else break;
      }
      rachaActiva = { name: lastWinner, count: streak };
    }
  }

  const ffPodio       = [...ffTotales.entries()].map(([name, damage]) => ({ name, damage })).sort((a, b) => b.damage - a.damage);
  const deathsPodio   = [...deathTotales.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const timeDeadPodio = [...timeDeadTotales.entries()].map(([name, ms]) => ({ name, ms })).sort((a, b) => b.ms - a.ms);
  const totalDaño     = ffPodio.reduce((s, e) => s + e.damage, 0);

  const interruptTotales = new Map();
  for (const raid of historial)
    for (const e of (raid.interrupts ?? []))
      interruptTotales.set(e.name, (interruptTotales.get(e.name) ?? 0) + e.total);
  const interruptPodio = [...interruptTotales.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);

  const dispelTotales = new Map();
  for (const raid of historial)
    for (const e of (raid.dispels ?? []))
      dispelTotales.set(e.name, (dispelTotales.get(e.name) ?? 0) + e.total);
  const dispelPodio = [...dispelTotales.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);

  const firstToDieCount = new Map();
  for (const raid of historial) {
    const name = raid.deathStats?.firstToDie?.name;
    if (name) firstToDieCount.set(name, (firstToDieCount.get(name) ?? 0) + 1);
  }

  return { ffPodio, deathsPodio, timeDeadPodio, portadorCount, rachaActiva, numRaids: historial.length, totalDaño, interruptPodio, dispelPodio, firstToDieCount };
}

function calcScores(historial) {
  const scores = new Map();
  for (const raid of historial) {
    const participants = raid.roster
      ? new Set(raid.roster)
      : new Set([
          ...raid.leaderboard.map(e => e.name),
          ...(raid.deathStats?.deaths   ?? []).map(e => e.name),
          ...(raid.deathStats?.timeDead ?? []).map(e => e.name),
        ]);
    const n = participants.size;
    if (n <= 1) continue;
    const percentile = (list, name) => {
      const idx = list.findIndex(e => e.name === name);
      return idx === -1 ? 0 : (n - 1 - idx) / (n - 1);
    };
    for (const name of participants) {
      const avg = (percentile(raid.leaderboard, name) + percentile(raid.deathStats?.deaths ?? [], name) + percentile(raid.deathStats?.timeDead ?? [], name)) / 3;
      const curr = scores.get(name) ?? { total: 0, count: 0 };
      scores.set(name, { total: curr.total + avg, count: curr.count + 1 });
    }
  }
  return scores;
}

function getRankingVerguenza(historial) {
  if (historial.length === 0) return null;
  const scores   = calcScores(historial);
  const minRaids = Math.max(1, Math.ceil(historial.length * 0.3));
  const ranking  = [...scores.entries()]
    .filter(([, v]) => v.count >= minRaids)
    .map(([name, { total, count }]) => ({ name, score: total / count, raidCount: count }))
    .sort((a, b) => b.score - a.score);
  return ranking.length > 0 ? { top: ranking.slice(0, 5), numRaids: historial.length } : null;
}

function getSinResaca(historial) {
  if (historial.length < 2) return null;
  const scores   = calcScores(historial);
  const minRaids = Math.max(1, Math.ceil(historial.length * 0.3));
  return [...scores.entries()]
    .filter(([, v]) => v.count >= minRaids)
    .map(([name, { total, count }]) => ({ name, shameScore: total / count, raidCount: count }))
    .sort((a, b) => a.shameScore - b.shameScore)[0] ?? null;
}

// ── Discord helpers ───────────────────────────────────────────────────────────

async function createDMChannel(userId) {
  const res = await axios.post(
    `${DISCORD_API}/users/@me/channels`,
    { recipient_id: userId },
    { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' } }
  );
  return res.data.id;
}

async function sendDM(channelId, content) {
  await axios.post(
    `${DISCORD_API}/channels/${channelId}/messages`,
    { content },
    { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' } }
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🧪 Modo simulación — sin guardar en historial, enviando por DM');

  // Cargar historial excluyendo el report del 22-03 (ya guardado, se accede por API)
  const historialPath = path.join(__dirname, 'historial.json');
  const historialCompleto = JSON.parse(fs.readFileSync(historialPath, 'utf8'));
  const historialBase     = historialCompleto.filter(e => e.report !== REPORT_CODE);
  console.log(`📂 Historial base: ${historialBase.length} raids (excluido ${REPORT_CODE})`);

  const parsed = parsed_url;
  console.log(`📜 Procesando report: ${parsed.code}`);

  const fight = await findGruulKill(parsed.code);
  if (!fight) { console.log('ℹ️  No se encontró kill de Gruul.'); process.exit(0); }
  console.log(`🐉 Kill encontrado (fight ID: ${fight.id})`);

  const [leaderboard, deathStats, allHitStats, interruptData, dispels, roster] = await Promise.all([
    getFriendlyFireLeaderboard(parsed.code, fight),
    fetchDeathStats(parsed.code),
    fetchAllHitStats(parsed.code),
    fetchInterruptLeaderboard(parsed.code),
    fetchDispelLeaderboard(parsed.code),
    fetchRoster(parsed.code),
  ]);
  const { leaderboard: interrupts, shameInterrupts } = interruptData;
  const { biggestHits, playerHitStats } = allHitStats;

  // Combinar historial filtrado + entry actual
  const entry          = { fecha: fight.reportDate, report: parsed.code, fightId: fight.id, leaderboard, deathStats, interrupts, dispels, roster, biggestHits, playerHitStats };
  const historialFinal = [...historialBase, entry];
  console.log(`📊 Total raids para stats: ${historialFinal.length}`);

  const historialData    = getPodioGeneral(historialFinal);
  const rankingVerguenza = getRankingVerguenza(historialFinal);
  const sinResaca        = getSinResaca(historialFinal);

  // Records globales inline
  let recHit = null, recHeal = null, recReceived = null;
  for (const raid of historialFinal) {
    const bh = raid.biggestHits;
    if (!bh) continue;
    if (bh.biggestDealt?.amount > 0 && (!recHit || bh.biggestDealt.amount > recHit.amount))
      recHit = { ...bh.biggestDealt, fecha: raid.fecha };
    if (bh.biggestHeal?.amount > 0 && (!recHeal || bh.biggestHeal.amount > recHeal.amount))
      recHeal = { ...bh.biggestHeal, fecha: raid.fecha };
    if (bh.biggestReceived?.amount > 0 && (!recReceived || bh.biggestReceived.amount > recReceived.amount))
      recReceived = { ...bh.biggestReceived, fecha: raid.fecha };
  }
  const recordsGlobales = { biggestHit: recHit, biggestHeal: recHeal, biggestReceived: recReceived };

  const msgs = buildResacaMessage(leaderboard, parsed.fullUrl, parsed.code, fight.id, historialData, fight.reportDate, deathStats, biggestHits, rankingVerguenza, sinResaca, interrupts, shameInterrupts, dispels, recordsGlobales);

  console.log(`📨 Creando DM con usuario ${TARGET_USER_ID}...`);
  const dmChannelId = await createDMChannel(TARGET_USER_ID);
  console.log(`✅ Canal DM: ${dmChannelId}`);

  for (const msg of msgs) {
    await sendDM(dmChannelId, msg);
  }

  console.log(`✅ ${msgs.length} mensaje(s) enviados por DM. Historial NO modificado.`);
}

main().catch(err => {
  console.error('❌ Error:', err.response?.data ?? err.message);
  process.exit(1);
});
