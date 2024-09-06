const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, getVoiceConnection } = require('@discordjs/voice');
const ydl = require('ytdl-core'); console.log(ydl);
const { generateDependencyReport } = require('@discordjs/voice'); console.log(generateDependencyReport());

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Sélectionne ta musique, mon petit noob')
    .addStringOption(option =>
      option.setName('musique')
        .setDescription('Le lien YouTube de ta musique ')
        .setRequired(true)),
  async execute(interaction) {

    try {
      const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
      const musiqueOption = interaction.options.getString('musique');

      const url = await ydl.getInfo(musiqueOption).catch(() => null);
      if (!url) {
        return interaction.reply('Désolé, mais ta vidéo n\'existe pas...');
      }

      if (!urlRegex.test(musiqueOption)) {
        return interaction.reply(`C'est un lien valide '**youtube**' qu'il me faut pour l'instant. Attends ma prochaine mise à jour, tu ne seras pas déçu mon fraté !`);
      }

      const memberVoiceChannel = interaction.member.voice.channel;
      if (!memberVoiceChannel) {
        return interaction.reply('Tu dois être dans un canal vocal pour jouer de la musique mon nooby !');
      }

      const connection = joinVoiceChannel({
        channelId: memberVoiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();

      const stream = ydl(musiqueOption, {
        filter: "audioonly",
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });

      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
      player.play(resource);

      connection.subscribe(player);

      await interaction.reply('OK ! je te fais écouter ça');

      setTimeout(async () => {
        await interaction.deleteReply();
      }, 50000);
    } catch (error) {
      console.error('Une erreur est survenue lors de la lecture de la musique :', error);
      interaction.reply('Une erreur est survenue lors de la lecture de la musique x.x');
    }
  }
};








