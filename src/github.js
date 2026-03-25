'use strict';

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const API = 'https://api.github.com';

async function getFileSha(token, repo, filePath) {
  try {
    const res = await axios.get(`${API}/repos/${repo}/contents/${filePath}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    return res.data.sha;
  } catch (e) {
    if (e.response?.status === 404) return null; // archivo nuevo
    throw e;
  }
}

async function uploadFile(token, repo, filePath, localPath) {
  const content = fs.readFileSync(localPath);
  const encoded = content.toString('base64');
  const sha     = await getFileSha(token, repo, filePath);

  await axios.put(
    `${API}/repos/${repo}/contents/${filePath}`,
    {
      message: `actualizar ${filePath}`,
      content: encoded,
      ...(sha ? { sha } : {}),
    },
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  );
}

async function publishDashboard() {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !repo) {
    console.log('ℹ️  GITHUB_TOKEN o GITHUB_REPO no configurados, omitiendo publicación.');
    return;
  }

  const root = path.join(__dirname, '..');

  await uploadFile(token, repo, 'historial.js',   path.join(root, 'historial.js'));
  await uploadFile(token, repo, 'dashboard.html', path.join(root, 'dashboard.html'));

  console.log(`✅ Dashboard publicado en https://${repo.split('/')[0]}.github.io/${repo.split('/')[1]}/dashboard.html`);
}

// Sube todos los archivos de código fuente al repositorio
async function publishSource() {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !repo) {
    console.log('ℹ️  GITHUB_TOKEN o GITHUB_REPO no configurados, omitiendo publicación de fuentes.');
    return;
  }

  const root = path.join(__dirname, '..');

  const files = [
    ['src/index.js',         path.join(root, 'src', 'index.js')],
    ['src/warcraftlogs.js',  path.join(root, 'src', 'warcraftlogs.js')],
    ['src/historial.js',     path.join(root, 'src', 'historial.js')],
    ['src/messages.js',      path.join(root, 'src', 'messages.js')],
    ['src/discord.js',       path.join(root, 'src', 'discord.js')],
    ['src/github.js',        path.join(root, 'src', 'github.js')],
    ['simulate_dm.js',       path.join(root, 'simulate_dm.js')],
    ['add_rosters.js',       path.join(root, 'add_rosters.js')],
    ['add_spells.js',        path.join(root, 'add_spells.js')],
    ['add_boss_stats.js',    path.join(root, 'add_boss_stats.js')],
    ['dashboard.html',       path.join(root, 'dashboard.html')],
    ['historial.js',         path.join(root, 'historial.js')],
  ];

  for (const [repoPath, localPath] of files) {
    if (!fs.existsSync(localPath)) continue;
    await uploadFile(token, repo, repoPath, localPath);
    console.log(`  📤 ${repoPath}`);
  }

  console.log(`✅ Fuentes publicadas en https://github.com/${repo}`);
}

module.exports = { publishDashboard, publishSource };
