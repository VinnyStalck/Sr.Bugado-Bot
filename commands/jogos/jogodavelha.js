const {
	MessageEmbed
} = require('discord.js');
const {
	color
} = require('../../commands.json')
const game = require('../../game.js');

module.exports = {
	name: "jogodavelha",
	aliases: ['velha', 'jdv'],
	category: 'Jogos',
	description: 'Jogue o jogo da Velha com alguém.',
	callback: async ({
		message,
		args,
		channel
	}) => {
		const gameName = "Jogo da Velha";

		// Define quem são jogadores
		let player1 = message.member;
		let player2 = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

		// Se um segundo jogador não foi marcado
		if (!player2) {
			player2 = await game.secondPlayer(message);
			// Se o segundo jogador ainda não estiver sido marcado
			if (!player2) return;
		}

		// Se os dois jogadores são usuários diferentes
		if (player1 !== player2) {
			// Cria um desafio
			if (await game.challenge(message, player1, player2, gameName) === false) return;
		}


		// Cria um tabuleiro vazio
		const esp = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
		const board = [
			["1️⃣", "2️⃣", "3️⃣"],
			["4️⃣", "5️⃣", "6️⃣"],
			["7️⃣", "8️⃣", "9️⃣"]
		];

		/**
		 * Transforma o tabuleiro em uma string
		 * @param {*} board Tabuleiro
		 * @returns Uma string com o tabuleiro
		 */
		const renderBoard = (board) => {
			let tempString = ``;
			for (const boardSection of board) {
				tempString += `${boardSection.join("")}\n`
			}

			return tempString;
		}

		// Define os jogadores
		const gameData = [{
				member: player1,
				emoji: "❌",
				color: color.yellow
			},
			{
				member: player2,
				emoji: "⭕",
				color: color.purple
			}
		];
		let player = 0;

		// Mostra tabuleiro vazio
		const initialState = renderBoard(board);
		const initialEmbed = new MessageEmbed()
			.setTitle(`${gameData[player].emoji} Vez de: ${gameData[player].member.displayName}`)
			.setDescription(initialState)
			.setColor(gameData[player].color);
		const gameMessage = await channel.send(`${gameData[player].member}`, initialEmbed);

		// Recebe Reações
		//const gameReactions = rowEmojis.concat(colEmojis)
		const gameReactions = esp;
		gameReactions.forEach(async el => await gameMessage.react(el));
		const gameFilter = (reaction, user) => gameReactions.includes(reaction.emoji.name) && (user.id === player2.id || user.id === player1.id);
		const gameCollector = gameMessage.createReactionCollector(gameFilter);

		// Verifica uma combinação
		const checkCombination = (a, b, c) => (!esp.includes(a)) && (a === b) && (b === c);

		// Verifica combinação horizontal
		const checkHorizontal = () => {
			for (let row = 0; row < board.length; row++) {
				if (checkCombination(board[row][0], board[row][1], board[row][2])) return true;
			}
		}
		// Verifica combinação vertical
		const checkVertical = () => {
			for (let col = 0; col < board[0].length; col++) {
				if (checkCombination(board[0][col], board[1][col], board[2][col])) return true;
			}
		}
		// Verifica combinação diagonal superior-esquerdo à inferior-direito
		const checkDiagonal = () => {
			if (checkCombination(board[0][0], board[1][1], board[2][2])) return true;
		}
		// Verifica combinação diagonal inferior-esquerdo à superior-direito
		const checkAntidiagonal = () => {
			if (checkCombination(board[0][2], board[1][1], board[2][0])) return true;
		}

		/**
		 * Verifica se todos os campos do tabuleiro estão cheios.
		 * @returns true se os campos estiverem preenchidos
		 */
		const checkTie = () => {
			let count = 0;
			for (const el of board) {
				for (const string of el) {
					if (!esp.includes(string)) count++;
				}
			}

			if (count === board.length * board[0].length) return true;
		}

		// Quando for coletada uma reação
		gameCollector.on("collect", (reaction, user) => {
			// Verifica se a reação é do jogador da vez
			if (user.id === gameData[player].member.id) {
				let passTurn = true;
				const insertPiece = (row, col) => {
					// Verifica se o campo está vazio
					if (esp.includes(board[row][col])) {
						passTurn = true;
						return board[row][col] = gameData[player].emoji;
					} else {
						passTurn = false;
						return channel.send(`${gameData[player].member}, essa caixa já está preenchida.`);
					}
				}

				switch (reaction.emoji.name) {
					case "1️⃣":
						insertPiece(0, 0);
						break;
					case "2️⃣":
						insertPiece(0, 1);
						break;
					case "3️⃣":
						insertPiece(0, 2);
						break;
					case "4️⃣":
						insertPiece(1, 0);
						break;
					case "5️⃣":
						insertPiece(1, 1);
						break;
					case "6️⃣":
						insertPiece(1, 2);
						break;
					case "7️⃣":
						insertPiece(2, 0);
						break;
					case "8️⃣":
						insertPiece(2, 1);
						break;
					case "9️⃣":
						insertPiece(2, 2);
						break;
					default:
						break;
				}

				// Verifica Vitória
				if (checkHorizontal() || checkVertical() || checkDiagonal() || checkAntidiagonal()) {
					gameCollector.stop();
					gameMessage.reactions.removeAll();

					const winEmbed = new MessageEmbed()
						.setTitle(`${gameData[player].emoji} ${gameData[player].member.displayName} combinou três!`)
						.setDescription(renderBoard(board))
						.setColor(gameData[player].color);
					return gameMessage.edit(`Parabéns ${gameData[player].member}, você venceu!`, {
						embed: winEmbed
					});
				}

				// Verifica Empate
				if (checkTie()) {
					gameCollector.stop();
					gameMessage.reactions.removeAll();

					const tieEmbed = new MessageEmbed()
						.setTitle("Deu velha!")
						.setDescription(renderBoard(board))
						.setColor(color.bot);
					return gameMessage.edit(`O jogo empatou! ${gameData[0].member} ${gameData[1].member}`, {
						embed: tieEmbed
					});
				}

				// Verifica se é a vez do prox jogador
				if (passTurn === true) {
					// Muda jogador, sempre vai ser 0 ou 1
					player = (player + 1) % 2;

					const updatedEmbed = new MessageEmbed()
						.setTitle(`${gameData[player].emoji} Vez de: ${gameData[player].member.displayName}`)
						.setDescription(renderBoard(board))
						.setColor(gameData[player].color);
					gameMessage.edit(`${gameData[player].member}`, {
						embed: updatedEmbed
					});
				}
			} else reaction.users.remove(user.id);
		})
	}
}