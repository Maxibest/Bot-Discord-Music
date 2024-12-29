require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Partials } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const montoken = process.env.token;
const clientId = process.env.CLIENT_ID;

const client = new Client({ intents: 3276799, partials: [Partials.Channel] });
const rest = new REST({ version: '10' }).setToken(montoken);

// Chargement des commandes
const commands = [];
const commandMap = new Map();

fs.readdirSync('./commands')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      commandMap.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] La commande ${file} manque de "data" ou "execute".`);
    }
  });

client.on("ready", async () => {
  console.log("Bot prêt !");
  try {
    console.log("Enregistrement des commandes slash...");
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Commandes slash enregistrées !");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des commandes :", error);
  }
});

const commandes = [require("./commands/play")];

commandes.forEach((command) => commandMap.set(command.data.name, command));

client.on("interactionCreate", async (execute) => {
  if (!execute.isCommand()) return;

  const command = commandMap.get(execute.commandName);
  if (!command) return;

  try {
    await command.execute(execute);
  } catch (error) {
    console.error(error);
    await execute.editReply({ content: "une erreur s' est produite" });
  }
});

client.on("messageCreate", async (message) => {
  const greetings = ["salut", "bonjour", "coucou"];
  if (greetings.includes(message.content.toLowerCase())) {
    try {
      await message.react("👋");
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(montoken);
