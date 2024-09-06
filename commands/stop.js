// pause.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Mettre en pause la musique'),
  async execute(interaction) {
    const memberVoiceChannel = interaction.member.voice.channel;
    const connection = getVoiceConnection(interaction.guildId);

    if (!memberVoiceChannel) {
      return interaction.reply('Tu dois être dans un canal vocal pour jouer de la musique, mon nooby !');
    }

    if (!connection || !connection.state.subscription || !connection.state.subscription.player) {
      return interaction.reply('Oula, désolé mais aucune musique ne joue actuellement.');
    }

    try {
      const player = connection.state.subscription.player;

      if (player.state.status === AudioPlayerStatus.Playing) {

        player.pause();

        await interaction.reply('La musique a été mise en pause, mon fraté !');

        setTimeout(async () => {
          await interaction.deleteReply();
        }, 50000);
      } else {
        await interaction.reply('Oula, désolé mais aucune musique ne joue actuellement.');

        setTimeout(async () => {
          await interaction.deleteReply();
        }, 50000);
      }

    } catch (error) {
      console.error('Une erreur est survenue lors de la pause de la musique :', error);
      interaction.reply('Une erreur est survenue lors de la pause de la musique x.x');
    }
  }
};
