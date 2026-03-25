'use strict';

require('dotenv').config();

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const TOKEN_URL      = 'https://www.warcraftlogs.com/oauth/token';
const API_URL        = 'https://www.warcraftlogs.com/api/v2/client';
const HISTORIAL_PATH = path.join(__dirname, 'historial.json');

const REPORTS = [
  'ym8xQ37zcfHYqhZj',
  'jvdkF6hgVqCr9JzN',
  '8M16ZYh2gJVFxt7q',
  'w6Zka8hxYbt34NRj',
  'kyvqD9aAbF6PLYhV',
];

let _tokenCache = null;

async function getAccessToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now() + 60_000) return _tokenCache.token;
  const res = await axios.post(TOKEN_URL, 'grant_type=client_credentials', {
    auth: { username: process.env.WCL_CLIENT_ID, password: process.env.WCL_CLIENT_SECRET },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  _tokenCache = { token: res.data.access_token, expiresAt: Date.now() + res.data.expires_in * 1000 };
  return _tokenCache.token;
}

async function gql(query, variables = {}) {
  const token = await getAccessToken();
  const res = await axios.post(API_URL, { query, variables }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (res.data.errors?.length) throw new Error(`WCL API: ${res.data.errors[0].message}`);
  return res.data.data;
}

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

async function main() {
  const historial = JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf8'));

  for (const reportCode of REPORTS) {
    const entry = historial.find(e => e.report === reportCode);
    if (!entry) {
      console.warn(`⚠️  Report ${reportCode} no encontrado en historial`);
      continue;
    }
    if (entry.roster) {
      console.log(`⏭️  ${reportCode} ya tiene roster (${entry.roster.length} jugadores), saltando`);
      continue;
    }

    process.stdout.write(`📡 Fetching roster de ${reportCode}... `);
    const roster = await fetchRoster(reportCode);
    entry.roster = roster;
    console.log(`${roster.length} jugadores`);
  }

  fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(historial, null, 2), 'utf8');
  console.log('💾 historial.json actualizado');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
