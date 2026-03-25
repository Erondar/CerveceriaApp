'use strict';

const axios = require('axios');

const DISCORD_API = 'https://discord.com/api/v10';

async function checkChannel(channelId) {
  try {
    const res = await axios.get(
      `${DISCORD_API}/channels/${channelId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );
    console.log(`✅ Canal accesible: #${res.data.name} (guild: ${res.data.guild_id})`);
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) throw new Error(`Discord 401: Token inválido. Revisa DISCORD_TOKEN en el .env`);
    if (status === 403) throw new Error(`Discord 403: El bot no puede VER el canal ${channelId}. Asegúrate de que el rol tiene permiso "View Channel".`);
    if (status === 404) throw new Error(`Discord 404: Canal ${channelId} no encontrado. Revisa DISCORD_CHANNEL_ID en el .env`);
    throw err;
  }
}

async function postMessage(channelId, content) {
  await checkChannel(channelId);

  try {
    await axios.post(
      `${DISCORD_API}/channels/${channelId}/messages`,
      { content },
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    const status = err.response?.status;
    const body   = JSON.stringify(err.response?.data ?? {});

    if (status === 401) throw new Error(`Discord 401: Token inválido. Revisa DISCORD_TOKEN en el .env`);
    if (status === 403) throw new Error(
      `Discord 403: El bot no tiene permiso para escribir en el canal ${channelId}.\n` +
      `  → ¿Has invitado el bot al servidor? Ve a Discord Developer Portal → OAuth2 → URL Generator,\n` +
      `    marca scope "bot" + permiso "Send Messages" y usa la URL para invitarlo.\n` +
      `  → Respuesta de Discord: ${body}`
    );
    if (status === 404) throw new Error(`Discord 404: Canal ${channelId} no encontrado. Revisa DISCORD_CHANNEL_ID en el .env`);

    throw new Error(`Discord ${status}: ${body}`);
  }
}

module.exports = { postMessage };
