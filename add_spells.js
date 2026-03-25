'use strict';

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

const { fetchAllHitStats } = require('./src/warcraftlogs');

const HISTORIAL_PATH = path.join(__dirname, 'historial.json');
const HISTORIAL_JS   = path.join(__dirname, 'historial.js');

async function main() {
  const historial = JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf8'));

  let updated = 0;

  for (const entry of historial) {
    // Skip if ability data already present on all three records
    const bh = entry.biggestHits;
    if (
      bh &&
      (!bh.biggestDealt    || bh.biggestDealt.ability) &&
      (!bh.biggestHeal     || bh.biggestHeal.ability) &&
      (!bh.biggestReceived || bh.biggestReceived.ability)
    ) {
      console.log(`⏭️  ${entry.report} ya tiene ability data, saltando`);
      continue;
    }

    process.stdout.write(`📡 Fetching spell data de ${entry.report} (${entry.fecha})... `);
    try {
      const { biggestHits, playerHitStats } = await fetchAllHitStats(entry.report);
      entry.biggestHits    = biggestHits;
      entry.playerHitStats = playerHitStats;
      updated++;
      console.log(`✅`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  if (updated > 0) {
    fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(historial, null, 2), 'utf8');
    fs.writeFileSync(HISTORIAL_JS,   `window.__HISTORIAL__ = ${JSON.stringify(historial)};\n`, 'utf8');
    console.log(`\n💾 historial.json + historial.js actualizados (${updated} raids)`);
  } else {
    console.log('\nℹ️  Nada que actualizar.');
  }
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
