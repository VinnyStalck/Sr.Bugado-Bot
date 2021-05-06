const Discord = require('discord.js');

module.exports = {
	category: 'Outros',
	description: 'Retorna uma mensagem com o ping do bot.',

	callback: ({
		message
	}) => {
		const ping = Date.now() - message.createdTimestamp;

		const embed = new Discord.MessageEmbed()
			.setDescription(`🏓 Pong! \`${ping}ms\``)
			.setColor('AQUA');
		message.channel.send(embed);
	}
}