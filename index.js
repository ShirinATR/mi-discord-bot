require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// CONFIGURACIÓN
// =========================

const CANAL_BIENVENIDA = "1410064532478365928";

// =========================
// BOT LISTO
// =========================

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// =========================
// BIENVENIDAS
// =========================

client.on('guildMemberAdd', async member => {
  const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA);

  if (!canal) return;

  const embed = new EmbedBuilder()
    .setTitle('👋 ¡Bienvenido!')
    .setDescription(
      `¡Bienvenido/a ${member} a **${member.guild.name}**!\n\n` +
      `Esperamos que disfrutes de la comunidad.`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setColor(0x8e44ff)
    .setFooter({
      text: `${member.guild.name}`
    })
    .setTimestamp();

  canal.send({ embeds: [embed] });
});

// =========================
// SORTEOS
// =========================

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);

  // !sorteo 1m Nitro
  if (args[0].toLowerCase() === '!sorteo') {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ No tienes permisos para hacer sorteos.');
    }

    const tiempo = args[1];
    const premio = args.slice(2).join(' ');

    if (!tiempo || !premio) {
      return message.reply(
        '❌ Usa:\n`!sorteo <tiempo> <premio>`\n\n' +
        'Ejemplo: `!sorteo 1m Discord Nitro`'
      );
    }

    const duracion = convertirTiempo(tiempo);

    if (!duracion) {
      return message.reply(
        '❌ Tiempo inválido.\nUsa `s`, `m`, `h` o `d`.\n\n' +
        'Ejemplo: `10m`, `2h`, `1d`'
      );
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 SORTEO')
      .setDescription(
        `🎁 **Premio:** ${premio}\n\n` +
        `👥 Reacciona con 🎉 para participar.\n\n` +
        `⏰ Termina <t:${Math.floor((Date.now() + duracion) / 1000)}:R>`
      )
      .setColor(0x8e44ff)
      .setFooter({
        text: `Sorteo creado por ${message.author.username}`
      });

    const sorteo = await message.channel.send({
      embeds: [embed]
    });

    await sorteo.react('🎉');

    setTimeout(async () => {
      const mensajeActualizado =
        await message.channel.messages.fetch(sorteo.id);

      const reaccion = mensajeActualizado.reactions.cache.get('🎉');

      if (!reaccion) {
        return message.channel.send('❌ No hubo participantes.');
      }

      const usuarios = await reaccion.users.fetch();

      const participantes = usuarios.filter(
        usuario => !usuario.bot
      );

      if (participantes.size === 0) {
        return message.channel.send(
          '❌ No hubo participantes en el sorteo.'
        );
      }

      const ganador =
        participantes.random();

      const ganadorEmbed = new EmbedBuilder()
        .setTitle('🏆 ¡SORTEO TERMINADO!')
        .setDescription(
          `🎁 **Premio:** ${premio}\n\n` +
          `🏆 **Ganador:** ${ganador}\n\n` +
          `¡Felicitaciones! 🎉`
        )
        .setColor(0x8e44ff)
        .setTimestamp();

      message.channel.send({
        embeds: [ganadorEmbed]
      });

    }, duracion);
  }
});

// =========================
// CONVERTIR TIEMPO
// =========================

function convertirTiempo(tiempo) {
  const numero = parseInt(tiempo);

  if (isNaN(numero)) return null;

  const unidad = tiempo.slice(-1).toLowerCase();

  switch (unidad) {
    case 's':
      return numero * 1000;

    case 'm':
      return numero * 60 * 1000;

    case 'h':
      return numero * 60 * 60 * 1000;

    case 'd':
      return numero * 24 * 60 * 60 * 1000;

    default:
      return null;
  }
}

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);
