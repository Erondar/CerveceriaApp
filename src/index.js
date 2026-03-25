'use strict';

require('dotenv').config();

const { parseReportUrl, findGruulKill, getFriendlyFireLeaderboard, fetchDeathStats, fetchAllHitStats, fetchInterruptLeaderboard, fetchDispelLeaderboard, fetchRoster, fetchBossStats } = require('./warcraftlogs');
const { buildResacaMessage } = require('./messages');
const { postMessage } = require('./discord');
const { guardarEntrada, getPodioGeneral, getRankingVerguenza, getSinResaca, getRecordsGlobales } = require('./historial');
const { publishDashboard } = require('./github');

async function main() {
  const urlArg = process.argv[2];

  if (!urlArg) {
    console.error('Uso: node src/index.js <url-de-warcraftlogs>');
    console.error('Ejemplo: node src/index.js https://www.warcraftlogs.com/reports/abc123def456');
    process.exit(1);
  }

  const parsed = parseReportUrl(urlArg);
  if (!parsed) {
    console.error('❌ URL de WarcraftLogs no válida. Formato esperado: warcraftlogs.com/reports/XXXXXXXXXXXXXXXX');
    process.exit(1);
  }

  console.log(`📜 Procesando report: ${parsed.code}`);

  const fight = await findGruulKill(parsed.code);
  if (!fight) {
    console.log('ℹ️  No se encontró kill de Gruul en este log. No se publicará nada.');
    process.exit(0);
  }

  console.log(`🐉 Kill de Gruul encontrado (fight ID: ${fight.id}, duración: ${Math.round((fight.endTime - fight.startTime) / 1000)}s)`);

  const [leaderboard, deathStats, allHitStats, interruptData, dispels, roster, bossStats] = await Promise.all([
    getFriendlyFireLeaderboard(parsed.code, fight),
    fetchDeathStats(parsed.code),
    fetchAllHitStats(parsed.code),
    fetchInterruptLeaderboard(parsed.code),
    fetchDispelLeaderboard(parsed.code),
    fetchRoster(parsed.code),
    fetchBossStats(parsed.code),
  ]);
  const { leaderboard: interrupts, shameInterrupts } = interruptData;
  const { biggestHits, playerHitStats } = allHitStats;

  if (leaderboard.length > 0) {
    console.log(`🏆 Portador de la Resaca: ${leaderboard[0].name} (${leaderboard[0].damage} de daño a aliados)`);
  } else {
    console.log('✨ Nadie hizo daño a aliados');
  }

  const entry            = { fecha: fight.reportDate, report: parsed.code, fightId: fight.id, leaderboard, deathStats, interrupts, dispels, roster, biggestHits, playerHitStats, bossStats: bossStats ?? null };
  const historialData    = getPodioGeneral(entry);
  const rankingVerguenza = getRankingVerguenza(entry);
  const sinResaca        = getSinResaca(entry);
  const recordsGlobales  = getRecordsGlobales(entry);
  const msgs = buildResacaMessage(leaderboard, parsed.fullUrl, parsed.code, fight.id, historialData, fight.reportDate, deathStats, biggestHits, rankingVerguenza, sinResaca, interrupts, shameInterrupts, dispels, recordsGlobales);

  for (const msg of msgs) {
    await postMessage(process.env.DISCORD_CHANNEL_ID, msg);
  }

  // Solo se guarda si Discord no ha fallado
  guardarEntrada(entry);
  console.log(`✅ ${msgs.length} mensaje(s) publicado(s) en Discord`);

  await publishDashboard();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
