const Discord = require('discord.js');
const WOKCommands = require('wokcommands');
require('dotenv').config();

const client = new Discord.Client({
	partials: ['MESSAGE', 'REACTION']
});

client.once('ready', () => {
	new WOKCommands(client, {
			commandsDir: 'commands',
			featuresDir: 'features',
			defaultLanguage: 'portuguese',
		})
		.setDefaultPrefix('>')
		.setColor('AQUA')
		.setMongoPath(process.env.MONGO_URI);

	console.log('O bot está pronto!');
});

client.login(process.env.BOT_TOKEN);