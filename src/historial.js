'use strict';

const fs   = require('fs');
const path = require('path');

const HISTORIAL_PATH = path.join(__dirname, '..', 'historial.json');
const HISTORIAL_JS   = path.join(__dirname, '..', 'historial.js');

function cargarHistorial() {
  if (!fs.existsSync(HISTORIAL_PATH)) return [];
  return JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf8'));
}

function guardarEntrada({ fecha, report, fightId, leaderboard, deathStats, interrupts, dispels, roster, biggestHits, playerHitStats, bossStats }) {
  const historial = cargarHistorial();

  const yaExiste = historial.some(e => e.report === report && e.fightId === fightId);
  if (yaExiste) {
    console.log('ℹ️  Este kill ya está en el historial, no se duplica.');
    return;
  }

  historial.push({ fecha, report, fightId, leaderboard, deathStats, interrupts: interrupts ?? [], dispels: dispels ?? [], roster: roster ?? [], biggestHits: biggestHits ?? null, playerHitStats: playerHitStats ?? {}, bossStats: bossStats ?? null });
  fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(historial, null, 2), 'utf8');
  fs.writeFileSync(HISTORIAL_JS, `window.__HISTORIAL__ = ${JSON.stringify(historial)};\n`, 'utf8');
  console.log(`💾 Kill guardado en historial (total: ${historial.length})`);
}

function getPodioGeneral(extraEntry = null) {
  let historial = cargarHistorial();
  if (extraEntry) historial = [...historial, extraEntry];

  const ffTotales       = new Map();
  const deathTotales    = new Map();
  const timeDeadTotales = new Map();
  const portadorCount   = new Map();

  for (const raid of historial) {
    // Friendly fire
    for (const e of raid.leaderboard) {
      ffTotales.set(e.name, (ffTotales.get(e.name) ?? 0) + e.damage);
    }
    // Muertes
    for (const e of (raid.deathStats?.deaths ?? [])) {
      deathTotales.set(e.name, (deathTotales.get(e.name) ?? 0) + e.count);
    }
    // Tiempo muerto
    for (const e of (raid.deathStats?.timeDead ?? [])) {
      timeDeadTotales.set(e.name, (timeDeadTotales.get(e.name) ?? 0) + e.ms);
    }
    // Portador (ganador de FF)
    if (raid.leaderboard.length > 0) {
      const w = raid.leaderboard[0].name;
      portadorCount.set(w, (portadorCount.get(w) ?? 0) + 1);
    }
  }

  // Racha activa del portador más reciente
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

  const ffPodio = Array.from(ffTotales.entries())
    .map(([name, damage]) => ({ name, damage }))
    .sort((a, b) => b.damage - a.damage);

  const deathsPodio = Array.from(deathTotales.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const timeDeadPodio = Array.from(timeDeadTotales.entries())
    .map(([name, ms]) => ({ name, ms }))
    .sort((a, b) => b.ms - a.ms);

  const totalDaño = ffPodio.reduce((sum, e) => sum + e.damage, 0);

  const interruptTotales = new Map();
  for (const raid of historial) {
    for (const e of (raid.interrupts ?? [])) {
      interruptTotales.set(e.name, (interruptTotales.get(e.name) ?? 0) + e.total);
    }
  }
  const interruptPodio = Array.from(interruptTotales.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const dispelTotales = new Map();
  for (const raid of historial) {
    for (const e of (raid.dispels ?? [])) {
      dispelTotales.set(e.name, (dispelTotales.get(e.name) ?? 0) + e.total);
    }
  }
  const dispelPodio = Array.from(dispelTotales.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const firstToDieCount = new Map();
  for (const raid of historial) {
    const name = raid.deathStats?.firstToDie?.name;
    if (name) firstToDieCount.set(name, (firstToDieCount.get(name) ?? 0) + 1);
  }

  return { ffPodio, deathsPodio, timeDeadPodio, portadorCount, rachaActiva, numRaids: historial.length, totalDaño, interruptPodio, dispelPodio, firstToDieCount };
}

// Calcula el score de vergüenza por jugador sobre un array de raids.
// Si la raid tiene roster, lo usa como conjunto de participantes real.
// Si no, infiere los participantes de las listas (comportamiento anterior).
function calcScores(historial) {
  const scores = new Map(); // name -> { total, count }

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
      const avg = (
        percentile(raid.leaderboard, name) +
        percentile(raid.deathStats?.deaths   ?? [], name) +
        percentile(raid.deathStats?.timeDead ?? [], name)
      ) / 3;
      const curr = scores.get(name) ?? { total: 0, count: 0 };
      scores.set(name, { total: curr.total + avg, count: curr.count + 1 });
    }
  }

  return scores;
}

function getRankingVerguenza(extraEntry = null) {
  let historial = cargarHistorial();
  if (extraEntry) historial = [...historial, extraEntry];
  if (historial.length === 0) return null;

  const scores   = calcScores(historial);
  const minRaids = Math.max(1, Math.ceil(historial.length * 0.3));
  const ranking  = Array.from(scores.entries())
    .filter(([, v]) => v.count >= minRaids)
    .map(([name, { total, count }]) => ({ name, score: total / count, raidCount: count }))
    .sort((a, b) => b.score - a.score);

  return ranking.length > 0 ? { top: ranking.slice(0, 5), numRaids: historial.length } : null;
}

function getSinResaca(extraEntry = null) {
  let historial = cargarHistorial();
  if (extraEntry) historial = [...historial, extraEntry];
  if (historial.length < 2) return null;

  const scores   = calcScores(historial);
  const minRaids = Math.max(1, Math.ceil(historial.length * 0.3));
  const winner   = Array.from(scores.entries())
    .filter(([, v]) => v.count >= minRaids)
    .map(([name, { total, count }]) => ({ name, shameScore: total / count, raidCount: count }))
    .sort((a, b) => a.shameScore - b.shameScore)[0] ?? null;

  return winner;
}

function getRecordsGlobales(extraEntry = null) {
  let historial = cargarHistorial();
  if (extraEntry) historial = [...historial, extraEntry];

  let biggestHit      = null; // { heroe, objetivo, amount, fecha }
  let biggestHeal     = null; // { healer, target, amount, fecha }
  let biggestReceived = null; // { victima, agresor, amount, fecha }

  for (const raid of historial) {
    const bh = raid.biggestHits;
    if (!bh) continue;

    if (bh.biggestDealt?.amount > 0) {
      if (!biggestHit || bh.biggestDealt.amount > biggestHit.amount) {
        biggestHit = { ...bh.biggestDealt, fecha: raid.fecha };
      }
    }
    if (bh.biggestHeal?.amount > 0) {
      if (!biggestHeal || bh.biggestHeal.amount > biggestHeal.amount) {
        biggestHeal = { ...bh.biggestHeal, fecha: raid.fecha };
      }
    }
    if (bh.biggestReceived?.amount > 0) {
      if (!biggestReceived || bh.biggestReceived.amount > biggestReceived.amount) {
        biggestReceived = { ...bh.biggestReceived, fecha: raid.fecha };
      }
    }
  }

  return { biggestHit, biggestHeal, biggestReceived };
}

module.exports = { guardarEntrada, getPodioGeneral, getRankingVerguenza, getSinResaca, getRecordsGlobales };
