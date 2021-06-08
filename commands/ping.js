const Discord = require('discord.js');
const {color} = require('../commands.json')

module.exports = {
	category: 'Outros',
	description: 'Retorna uma mensagem com o ping do bot.',

	callback: ({
		message
	}) => {
		// Recebe o ping
		const ping = Date.now() - message.createdTimestamp;

		// Seleciona uma cor
		let msgColor;
		if (ping < 100) msgColor = color.green
		else if (ping < 200) msgColor = color.yellow
		else if (ping < 300) msgColor = color.orange
		else msgColor = color.red

		// Envia uma cor
		const embed = new Discord.MessageEmbed()
			.setColor(msgColor)
			.setDescription(`🏓 Pong! \`${ping} ms\``);
		message.channel.send(embed);
	}
}