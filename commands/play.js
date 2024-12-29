const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, generateDependencyReport } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');; 
const { EmbedBuilder } = require('discord.js');

console.log(generateDependencyReport());

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Sélectionne ta musique, mon petit noob')
    .addStringOption(option =>
      option
        .setName('musique')
        .setDescription('Le lien YouTube de ta musique')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const musiqueOption = interaction.options.getString('musique');
    const voiceChannelMember = interaction.member.voice.channel;

    if (!voiceChannelMember) {
      return await interaction.editReply("Tu n'es pas dans un channel vocal.");
    }

    if (!ytdl.validateURL(musiqueOption)) {
      return await interaction.editReply('Le lien fourni n\'est pas une URL YouTube valide.');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannelMember.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      let stream;

      try {
        stream = await ytdl(musiqueOption, {
          filter: "audioonly",
          quality: 'highestaudio',
          highWaterMark: 1 << 25,
        });
      } catch (error) {
        console.error("Erreur lors de la création du stream :", error);
        return await interaction.editReply('Impossible de lire la vidéo.');
      }

      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
      player.play(resource);
      connection.subscribe(player);

    player.on('idle', () => {
      connection.destroy();
    });

      const songInfo = await ytdl.getInfo(musiqueOption);
      const song = {
        title: songInfo.videoDetails.title || 'Titre non disponible',
        url: songInfo.videoDetails.video_url || 'URL non disponible',
        thumbnail: songInfo.videoDetails.thumbnails?.[4]?.url || songInfo.videoDetails.thumbnails?.[0]?.url || 'Aucune miniature',
        author: songInfo.videoDetails.author?.name || 'Auteur inconnu',
        viewCount: songInfo.videoDetails.viewCount || 'Non spécifié',
        duration: songInfo.videoDetails.lengthSeconds || 0,
        agelimited: songInfo.videoDetails.age_restricted || false,
      };

      console.log("Données récupérées : ", song);

      const embed = new EmbedBuilder()
        .setColor('#008000')
        .setTitle('Musique ajoutée à la file d\'attente !')
        .setDescription(`**${song.title}** par **${song.author}**`)
        .setURL(song.url)
        .setImage(song.thumbnail);

      return await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error("Erreur inattendue :", error);
      return await interaction.followUp({ content: "Une erreur est survenue. Je ne peux pas jouer cette musique." });
    }
  },
};
