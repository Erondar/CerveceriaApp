'use strict';

/**
 * add_boss_stats.js — Backfill bossStats (kills, wipes, efectividad) en historial.json
 *
 * Uso: node add_boss_stats.js
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const { fetchBossStats } = require('./src/warcraftlogs');

const HISTORIAL_PATH = path.join(__dirname, 'historial.json');
const HISTORIAL_JS   = path.join(__dirname, 'historial.js');

async function main() {
  const historial = JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf8'));

  let updated = 0;
  for (const entry of historial) {
    if (entry.bossStats) {
      console.log(`⏭️  ${entry.fecha} (${entry.report}) — ya tiene bossStats, omitiendo`);
      continue;
    }
    console.log(`🔍 Fetching boss stats para ${entry.fecha} (${entry.report})...`);
    try {
      entry.bossStats = await fetchBossStats(entry.report);
      updated++;
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  if (updated === 0) {
    console.log('ℹ️  Nada que actualizar.');
    return;
  }

  fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(historial, null, 2), 'utf8');
  fs.writeFileSync(HISTORIAL_JS, `window.__HISTORIAL__ = ${JSON.stringify(historial)};\n`, 'utf8');
  console.log(`✅ ${updated} entradas actualizadas con bossStats.`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
