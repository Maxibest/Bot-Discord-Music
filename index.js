require('dotenv').config();
const fs = require('fs')
const { Client, Collection } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const montoken = process.env.token;
const commands = [];

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commandHandler = new Collection();

const client = new Client({ intents: 3276799 });

client.on('ready', () => {
  console.log('Je suis ready 🎶')
});

//Commandes Handlers "variables"
const rest = new REST({ version: '9' }).setToken(montoken);

const mesCommands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of mesCommands) {
  const commandName = file.split(".")[0]
  const command = require(`./commands/${commandName}`)
  commandHandler.set(commandName, command)
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${command} is missing a required "data" or "execute" property.`);
  }
}

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();


const commandes = [
  require('./commands/playing'),
  require('./commands/stop'),
  require('./commands/unpause'),
  require('./commands/help')
]

const commandMap = new Map();
commandes.forEach(command => commandMap.set(command.data.name, command));

client.on('interactionCreate', async (execute) => {
  if (!execute.isCommand()) return;

  const command = commandMap.get(execute.commandName)
  if (!command) return

  try {
    await command.execute(execute);
  } catch (error) {
    console.error(error)
    await execute.reply({ content: 'une erreur s\' est produite' });
  }
})

client.login(process.env.token);