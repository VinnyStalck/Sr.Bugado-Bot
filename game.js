const {
	Channel,
	GuildMember,
	Message,
	MessageEmbed
} = require('discord.js');
const {
	color
} = require('./commands.json');

module.exports = {
	secondPlayer,
	challenge
}

/**
 * Retorna um segundo jogador.
 * 
 * @param {Message} message 
 * @returns {GuildMember}
 */
async function secondPlayer(message) {
	let player;

	const playerEmbed = new MessageEmbed()
		.setTitle("❗ Mencione alguém para jogar com você:")
		.setFooter("Você pode se mencionar para jogar sozinho")
		.setColor(color.yellow);
	const playerMessage = await message.channel.send(playerEmbed);

	let hasError = false;
	let error = async () => {
		hasError = true;
		const playerErrEmbed = new MessageEmbed()
			.setTitle("🚫 Mencione alguém para jogar com você")
			.setFooter("Você pode mencionar no final do comando")
			.setColor(color.red);
		await playerMessage.edit({
			embed: playerErrEmbed
		});
	}

	const player2Filter = (m) =>
		message.author.id === m.author.id && message.channel.id === m.channel.id;
	await message.channel.awaitMessages(player2Filter, {
			max: 1,
			time: 1000 * 20,
			errors: ['time']
		})
		.then(async (collected) => {
			player = collected.first().mentions.members.first() || message.guild.members.cache.get(collected.first());
			if (!player) await error();
		})
		.catch(async () => await error());

	if (hasError == false) {
		await playerMessage.delete();
		return player;
	}
	return;
}

/**
 * Envia uma mensagem de desafio com um membro desafiando o outro.
 * Depois retorna verdadeiro se o desafio for aceito.
 *  
 * @param {Channel} channel O canal onde sera enviado o desafio
 * @param {GuildMember} challengerMember Membro que está desafiando
 * @param {GuildMember} challengedMember Membro que está sendo desafiado
 * @param {String} gameName O nome do jogo
 * @returns {Boolean} True se o desafio for aceito, se não, false;
 */
async function challenge(message, challengerMember, challengedMember, gameName) {
	// Envia mensagem de desafio
	const challengeEmbed = new MessageEmbed()
		.setTitle(`⚔️ Desafio ${gameName}`)
		.setDescription(`${challengerMember} te desafiou no ${gameName}, vai aceitar?`)
		.setColor(color.bot);
	const challengeMessage = await message.channel.send(`${challengedMember}, você foi desafiado!`, challengeEmbed);

	// Recebe resposta do jogador
	const challengeEmojis = ["✅", "❎"];
	challengeEmojis.forEach(async el => await challengeMessage.react(el));
	const challengeFilter = (reaction, user) => challengeEmojis.includes(reaction.emoji.name) && user.id === challengedMember.id;
	const challengeCollector = await challengeMessage.awaitReactions(challengeFilter, {
		max: 1,
		time: 1000 * 45 // segundos
	})
	const challengeResponse = challengeCollector.first();

	// Verifica se o desafio foi respondido a tempo
	if (challengeResponse === undefined) {
		challengeMessage.reactions.removeAll();
		const noResponseEmbed = new MessageEmbed()
			.setTitle("⁉️ Desafio Não Respondido")
			.setDescription(`${challengedMember} não respondeu ao desafio de ${challengerMember} a tempo.`)
			.setColor(color.red);
		await challengeMessage.edit(`${challengedMember}, você foi desafiado!`, {
			embed: noResponseEmbed
		});
		return false;
	}

	// Verifica se o desafio foi rejeitado
	if (challengeResponse.emoji.name === "❎") {
		challengeMessage.reactions.removeAll();
		const challengeDeniedEmbed = new MessageEmbed()
			.setTitle("🙅 Desafio Recusado")
			.setDescription(`${challengedMember} não aceitou o desafio de ${challengerMember}`)
			.setColor(color.red);
		await challengeMessage.edit(`${challengedMember}, você foi desafiado!`, {
			embed: challengeDeniedEmbed
		});
		return false;
	}

	// Deleta a mensagem de desafio
	await challengeMessage.delete();

	// Retorna que o desafio foi aceito
	return true;
}