const Discord = require('discord.js');
const WOKCommands = require('wokcommands');
const {category, color} = require('./commands.json');
const config = require('./config.json');
require('dotenv').config();

const client = new Discord.Client({
	partials: ['MESSAGE', 'REACTION']
});

client.once('ready', () => {
	new WOKCommands(client, config.wok_setup)
		.setDefaultPrefix(config.default_prefix)
		.setColor(color.bot)
		.setCategorySettings(category)
		.setMongoPath(process.env.MONGO_URI);

	log("Bot's client is ready.");
});

let token;
if (process.env.IS_TEST === "FALSE") token = process.env.BOT_TOKEN
else token = process.env.TEST_BOT_TOKEN
client.login(token);

const log = (string) => console.log(config.log + string);
