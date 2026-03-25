'use strict';

const axios = require('axios');

const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token';
const API_URL   = 'https://www.warcraftlogs.com/api/v2/client';

let _tokenCache = null;

// ── OAuth2 ────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now() + 60_000) {
    return _tokenCache.token;
  }

  const res = await axios.post(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.WCL_CLIENT_ID,
        password: process.env.WCL_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  _tokenCache = {
    token:     res.data.access_token,
    expiresAt: Date.now() + res.data.expires_in * 1000,
  };
  return _tokenCache.token;
}

// ── GraphQL helper ────────────────────────────────────────────────────────────

async function gql(query, variables = {}) {
  const token = await getAccessToken();
  const res = await axios.post(
    API_URL,
    { query, variables },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  if (res.data.errors?.length) {
    throw new Error(`WCL API: ${res.data.errors[0].message}`);
  }
  return res.data.data;
}

// ── Parsear URL de WarcraftLogs ───────────────────────────────────────────────

function parseReportUrl(content) {
  const match = content.match(
    /https?:\/\/(?:[a-z]+\.)?warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)/
  );
  if (!match) return null;
  return { code: match[1], fullUrl: match[0] };
}

// ── Buscar kill de Gruul en el report ────────────────────────────────────────

async function findGruulKill(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData {
        report(code: $code) {
          startTime
          fights(killType: Kills) {
            id
            name
            kill
            startTime
            endTime
          }
        }
      }
    }`,
    { code: reportCode }
  );

  const report = data.reportData.report;
  const gruulKills = report.fights.filter(f => f.name.toLowerCase().includes('gruul'));
  if (gruulKills.length === 0) return null;

  const fight = gruulKills[gruulKills.length - 1];
  // Fecha real de la raid: startTime del report (Unix ms → YYYY-MM-DD)
  fight.reportDate = new Date(report.startTime).toISOString().slice(0, 10);
  return fight;
}

// ── Obtener mapa de actores (jugadores) ──────────────────────────────────────

async function fetchPlayerMap(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData {
        report(code: $code) {
          masterData {
            actors(type: "Player") {
              id
              name
            }
          }
        }
      }
    }`,
    { code: reportCode }
  );

  const map = new Map();
  for (const actor of data.reportData.report.masterData.actors) {
    map.set(actor.id, actor.name);
  }
  return map;
}

// ── Obtener eventos de daño recibido por jugadores (paginado) ─────────────────

async function fetchDamageTakenEvents(reportCode, fight) {
  const events = [];
  let cursor = fight.startTime;

  while (cursor !== null) {
    const data = await gql(
      `query($code: String!, $fightId: [Int]!, $start: Float!, $end: Float!) {
        reportData {
          report(code: $code) {
            events(
              dataType: DamageTaken,
              hostilityType: Friendlies,
              fightIDs: $fightId,
              startTime: $start,
              endTime: $end
            ) {
              data
              nextPageTimestamp
            }
          }
        }
      }`,
      { code: reportCode, fightId: [fight.id], start: cursor, end: fight.endTime }
    );

    const page = data.reportData.report.events;
    events.push(...page.data);
    cursor = page.nextPageTimestamp ?? null;
  }

  return events;
}

// ── Ranking de friendly fire: jugador → jugador ───────────────────────────────

async function getFriendlyFireLeaderboard(reportCode, fight) {
  const [playerMap, allEvents] = await Promise.all([
    fetchPlayerMap(reportCode),
    fetchDamageTakenEvents(reportCode, fight),
  ]);

  const playerIds = new Set(playerMap.keys());
  const totals    = new Map();

  for (const event of allEvents) {
    if (event.type !== 'damage') continue;

    const { sourceID, targetID, amount = 0 } = event;

    // Solo eventos donde TANTO la fuente COMO el objetivo son jugadores
    if (!playerIds.has(sourceID) || !playerIds.has(targetID)) continue;
    if (sourceID === targetID) continue; // ignorar self-damage

    totals.set(sourceID, (totals.get(sourceID) ?? 0) + amount);
  }

  console.log(`🔍 Jugadores con friendly fire: ${totals.size}`);

  return Array.from(totals.entries())
    .map(([id, damage]) => ({ name: playerMap.get(id) ?? `#${id}`, damage }))
    .sort((a, b) => b.damage - a.damage);
}

// ── Mapa de todos los actores (jugadores + NPCs) ──────────────────────────────

async function fetchActorMap(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData { report(code: $code) { masterData { actors { id name type } } } }
    }`,
    { code: reportCode }
  );
  const map = new Map();
  for (const actor of data.reportData.report.masterData.actors ?? []) {
    map.set(actor.id, { name: actor.name, type: actor.type });
  }
  return map;
}

// ── Mapa de habilidades (gameID → nombre) ─────────────────────────────────────

async function fetchAbilityMap(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData { report(code: $code) { masterData { abilities { gameID name } } } }
    }`,
    { code: reportCode }
  );
  const map = new Map();
  for (const ab of data.reportData.report.masterData.abilities ?? []) {
    map.set(ab.gameID, ab.name);
  }
  return map;
}

// ── Golpes más gordos, curas, y stats por jugador en toda la raid ─────────────

async function fetchAllHitStats(reportCode) {
  const [actorMap, abilityMap, meta] = await Promise.all([
    fetchActorMap(reportCode),
    fetchAbilityMap(reportCode),
    gql(`query($code: String!) { reportData { report(code: $code) { endTime } } }`, { code: reportCode }),
  ]);
  const reportEnd = meta.reportData.report.endTime;
  const playerIds = new Set([...actorMap.entries()].filter(([, a]) => a.type === 'Player').map(([id]) => id));

  // Generic paginated scanner: tracks per-player max and global max
  async function scanForMax(dataType, hostilityType, playerField, otherField) {
    const maxByPlayer = new Map(); // playerName -> { amount, other, ability }
    let cursor = 0;
    while (cursor !== null) {
      const data = await gql(
        `query($code: String!, $start: Float!, $end: Float!) {
          reportData { report(code: $code) {
            events(dataType: ${dataType}, hostilityType: ${hostilityType}, startTime: $start, endTime: $end) {
              data nextPageTimestamp
            }
          }}
        }`,
        { code: reportCode, start: cursor, end: reportEnd }
      );
      const page = data.reportData.report.events;
      for (const ev of page.data) {
        if (!(ev.amount > 0)) continue;
        const playerId = ev[playerField];
        if (!playerIds.has(playerId)) continue;
        const playerName = actorMap.get(playerId)?.name;
        if (!playerName) continue;
        const curr = maxByPlayer.get(playerName);
        if (!curr || ev.amount > curr.amount) {
          maxByPlayer.set(playerName, {
            amount:  ev.amount,
            other:   actorMap.get(ev[otherField])?.name ?? '?',
            ability: abilityMap.get(ev.abilityGameID) ?? '?',
          });
        }
      }
      cursor = page.nextPageTimestamp ?? null;
    }
    return maxByPlayer;
  }

  // Run all three scans in parallel
  const [dealtMap, healMap, receivedMap] = await Promise.all([
    scanForMax('DamageDone', 'Friendlies', 'sourceID', 'targetID'),
    scanForMax('Healing',    'Friendlies', 'sourceID', 'targetID'),
    scanForMax('DamageTaken','Friendlies', 'targetID', 'sourceID'),
  ]);

  // Find global maximums across all players
  function globalMax(map) {
    let best = null;
    for (const [name, { amount, other, ability }] of map) {
      if (!best || amount > best.amount) best = { name, amount, other, ability };
    }
    return best;
  }

  const bestDealt    = globalMax(dealtMap);
  const bestHeal     = globalMax(healMap);
  const bestReceived = globalMax(receivedMap);

  // Build per-player stats
  const allNames = new Set([...dealtMap.keys(), ...healMap.keys(), ...receivedMap.keys()]);
  const playerHitStats = {};
  for (const name of allNames) {
    const d = dealtMap.get(name);
    const h = healMap.get(name);
    const r = receivedMap.get(name);
    playerHitStats[name] = {
      biggestHit:      d ? { amount: d.amount, target: d.other, ability: d.ability } : null,
      biggestHeal:     h ? { amount: h.amount, target: h.other, ability: h.ability } : null,
      biggestReceived: r ? { amount: r.amount, source: r.other, ability: r.ability } : null,
    };
  }

  console.log(`💥 Golpe recibido max: ${bestReceived?.amount} | Golpe dado max: ${bestDealt?.amount} | Cura max: ${bestHeal?.amount}`);

  return {
    biggestHits: {
      biggestReceived: bestReceived ? {
        victima: bestReceived.name,
        agresor: bestReceived.other,
        amount:  bestReceived.amount,
        ability: bestReceived.ability,
      } : null,
      biggestDealt: bestDealt ? {
        heroe:    bestDealt.name,
        objetivo: bestDealt.other,
        amount:   bestDealt.amount,
        ability:  bestDealt.ability,
      } : null,
      biggestHeal: bestHeal ? {
        healer:  bestHeal.name,
        target:  bestHeal.other,
        amount:  bestHeal.amount,
        ability: bestHeal.ability,
      } : null,
    },
    playerHitStats,
  };
}

// ── Estadísticas de muertes de toda la raid ───────────────────────────────────

async function fetchDeathStats(reportCode) {
  const [playerMap, meta] = await Promise.all([
    fetchPlayerMap(reportCode),
    gql(`query($code: String!) {
      reportData { report(code: $code) { endTime fights { id startTime endTime } } }
    }`, { code: reportCode }),
  ]);

  const { endTime: reportEnd, fights } = meta.reportData.report;
  const fightMap = new Map(fights.map(f => [f.id, f]));
  const playerNames = new Set(playerMap.values());

  const tableResult = await gql(`
    query($code: String!, $end: Float!) {
      reportData { report(code: $code) { table(dataType: Deaths, startTime: 0, endTime: $end) } }
    }
  `, { code: reportCode, end: reportEnd });

  const entries = (tableResult.reportData.report.table?.data?.entries ?? [])
    .filter(e => playerNames.has(e.name));

  const deathCounts = new Map();
  const timeDeadMs  = new Map();
  let firstDeath    = null;

  for (const entry of entries) {
    deathCounts.set(entry.name, (deathCounts.get(entry.name) ?? 0) + 1);

    const fight = fightMap.get(entry.fight);
    if (fight) {
      const ms = Math.max(0, fight.endTime - entry.timestamp);
      timeDeadMs.set(entry.name, (timeDeadMs.get(entry.name) ?? 0) + ms);
    }

    if (!firstDeath || entry.timestamp < firstDeath.timestamp) {
      firstDeath = { name: entry.name, timestamp: entry.timestamp };
    }
  }

  const deaths = Array.from(deathCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const timeDead = Array.from(timeDeadMs.entries())
    .map(([name, ms]) => ({ name, ms }))
    .sort((a, b) => b.ms - a.ms);

  console.log(`💀 Muertes totales: ${entries.length} (${deathCounts.size} jugadores)`);

  return { deaths, timeDead, firstToDie: firstDeath ? { name: firstDeath.name } : null };
}

// ── Ranking de interrupts de toda la raid ────────────────────────────────────

// Clases con interrupt nativo en TBC Classic (independientemente de spec)
const INTERRUPT_CLASSES = new Set(['Warrior', 'Rogue', 'Mage', 'Shaman']);

async function fetchInterruptLeaderboard(reportCode) {
  // Fetch fights, actores (con clase), tabla de interrupts y playerDetails en un solo query
  const data = await gql(
    `query($code: String!) {
      reportData { report(code: $code) {
        fights { id encounterID friendlyPlayers }
        masterData { actors(type: "Player") { id name subType } }
        table(dataType: Interrupts, startTime: 0, endTime: 99999999999)
        playerDetails(startTime: 0, endTime: 99999999999)
      }}
    }`,
    { code: reportCode }
  );

  const report = data.reportData.report;

  // Healers del report (para excluir Resto Shamans del shame list)
  const pd = typeof report.playerDetails === 'string'
    ? JSON.parse(report.playerDetails)
    : report.playerDetails;
  const healerNames = new Set((pd?.data?.playerDetails?.healers ?? []).map(h => h.name));

  // IDs de jugadores que participaron en al menos un boss fight (encounterID != 0)
  const raidParticipantIds = new Set();
  for (const fight of report.fights) {
    if (fight.encounterID !== 0 && fight.friendlyPlayers) {
      for (const id of fight.friendlyPlayers) raidParticipantIds.add(id);
    }
  }

  // Mapa id -> { name, cls } solo para participantes reales
  const idToActor = new Map();
  for (const actor of report.masterData.actors) {
    if (raidParticipantIds.has(actor.id)) {
      idToActor.set(actor.id, { name: actor.name, cls: actor.subType ?? '' });
    }
  }

  // Agregar interrupts por jugador
  const tableData = report.table?.data;
  const totals    = new Map(); // name -> { total, cls, abilities }

  for (const abilityGroup of (tableData?.entries ?? [])) {
    for (const spell of (abilityGroup.entries ?? [])) {
      for (const player of (spell.details ?? [])) {
        if (!totals.has(player.name)) {
          totals.set(player.name, { total: 0, cls: player.type, abilities: new Map() });
        }
        const p = totals.get(player.name);
        p.total += player.total;
        for (const ab of (player.abilities ?? [])) {
          p.abilities.set(ab.name, (p.abilities.get(ab.name) ?? 0) + ab.total);
        }
      }
    }
  }

  const leaderboard = Array.from(totals.entries())
    .map(([name, d]) => {
      const topAbility = [...d.abilities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
      return { name, class: d.cls, total: d.total, topAbility };
    })
    .sort((a, b) => b.total - a.total);

  // Jugadores de la raid con clase de interrupt nativo y sus conteos (0 si no aparecen)
  const interruptCounts = new Map(leaderboard.map(p => [p.name, p.total]));
  const capableWithCounts = [];
  for (const { name, cls } of idToActor.values()) {
    if (!INTERRUPT_CLASSES.has(cls)) continue;
    if (cls === 'Shaman' && healerNames.has(name)) continue; // Excluir Resto Shamans
    capableWithCounts.push({ name, total: interruptCounts.get(name) ?? 0 });
  }

  // Mínimo de interrupts entre los capaces → lista de los que empataron en el mínimo
  let shameInterrupts = [];
  if (capableWithCounts.length > 0) {
    const minCount = Math.min(...capableWithCounts.map(p => p.total));
    shameInterrupts = capableWithCounts
      .filter(p => p.total === minCount)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  console.log(`⚡ Jugadores raid: ${idToActor.size} | Con interrupts: ${leaderboard.length} | Vergüenza (min): ${shameInterrupts.length} jugadores`);

  return { leaderboard, shameInterrupts };
}

// ── Ranking de dispels de toda la raid ───────────────────────────────────────

async function fetchDispelLeaderboard(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData { report(code: $code) {
        table(dataType: Dispels, startTime: 0, endTime: 99999999999)
      }}
    }`,
    { code: reportCode }
  );

  const tableData = data.reportData.report.table?.data;
  const totals    = new Map();

  for (const abilityGroup of (tableData?.entries ?? [])) {
    for (const spell of (abilityGroup.entries ?? [])) {
      for (const player of (spell.details ?? [])) {
        totals.set(player.name, (totals.get(player.name) ?? 0) + player.total);
      }
    }
  }

  return Array.from(totals.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

// ── Roster de jugadores que participaron en al menos un boss fight ────────────

async function fetchRoster(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData { report(code: $code) {
        fights { id encounterID friendlyPlayers }
        masterData { actors(type: "Player") { id name } }
      }}
    }`,
    { code: reportCode }
  );

  const report = data.reportData.report;
  const raidParticipantIds = new Set();
  for (const fight of report.fights) {
    if (fight.encounterID !== 0 && fight.friendlyPlayers) {
      for (const id of fight.friendlyPlayers) raidParticipantIds.add(id);
    }
  }

  const idToName = new Map(report.masterData.actors.map(a => [a.id, a.name]));
  return [...raidParticipantIds].map(id => idToName.get(id)).filter(Boolean).sort();
}

// ── Stats de boss fights: kills, wipes y efectividad ─────────────────────────

async function fetchBossStats(reportCode) {
  const data = await gql(
    `query($code: String!) {
      reportData {
        report(code: $code) {
          fights(killType: All) {
            id
            name
            encounterID
            kill
          }
        }
      }
    }`,
    { code: reportCode }
  );

  const bossFights = (data.reportData.report.fights ?? []).filter(f => f.encounterID !== 0);

  const byBoss = new Map();
  for (const f of bossFights) {
    const entry = byBoss.get(f.name) ?? { kills: 0, wipes: 0 };
    if (f.kill) entry.kills++;
    else entry.wipes++;
    byBoss.set(f.name, entry);
  }

  let totalKills = 0, totalWipes = 0;
  const bosses = [];
  for (const [name, { kills, wipes }] of byBoss) {
    const tries = kills + wipes;
    bosses.push({ name, kills, wipes, tries, effectiveness: tries > 0 ? Math.round(kills / tries * 100) : 0 });
    totalKills += kills;
    totalWipes += wipes;
  }

  const totalTries = totalKills + totalWipes;
  const effectiveness = totalTries > 0 ? Math.round(totalKills / totalTries * 100) : 0;

  console.log(`🏹 Boss stats — Kills: ${totalKills}, Wipes: ${totalWipes}, Efectividad: ${effectiveness}%`);

  return { totalKills, totalWipes, totalTries, effectiveness, bosses };
}

module.exports = { parseReportUrl, findGruulKill, getFriendlyFireLeaderboard, fetchDeathStats, fetchAllHitStats, fetchInterruptLeaderboard, fetchDispelLeaderboard, fetchRoster, fetchBossStats };
