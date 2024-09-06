// pause.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Mettre en relecture la musique'),
  async execute(interaction) {
    const memberVoiceChannel = interaction.member.voice.channel;
    const connection = getVoiceConnection(interaction.guildId);
    const PlayerSubscriptionPlaying = connection.state.subscription.player
    const PlayerSubscription = connection.state.subscription

    if (!memberVoiceChannel) {
      return interaction.reply('Tu dois être dans un canal vocal pour jouer de la musique, mon nooby !');
    }

    if (!connection || !PlayerSubscription || !PlayerSubscriptionPlaying) {
      return interaction.reply('Oula, désolé mais aucune musique ne joue actuellement.');
    }

    try {
      if (PlayerSubscriptionPlaying.state.status === AudioPlayerStatus.Paused) {

        PlayerSubscriptionPlaying.unpause();

        await interaction.reply('La musique a été mise en relecture, mon fraté !');

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
