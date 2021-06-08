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

	console.log('O bot está pronto!');
});

let token;
if (!config.is_test) token = process.env.BOT_TOKEN
else token = process.env.TEST_BOT_TOKEN
client.login(token);