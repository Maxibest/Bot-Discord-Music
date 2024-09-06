const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Voir les commandes'),
  async execute(exec) {
    exec.reply(
      "```1. /play => Démarrer la musique \n" +
      "2. /stop => Mettre en pause la musique \n" +
      "3. /unpause => Redémarrer la musique mise en pause \n" +
      "d\'autre fonction seront ajouté par mon créateur'```"
    );
  }
};