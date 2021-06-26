const {
	MessageEmbed
} = require('discord.js');
const {
	color
} = require('../../commands.json');
const game = require('../../game.js');

module.exports = {
	name: 'conecte4',
	aliases: ['c4', 'connect4', 'conectequatro', 'connectfour'],
	category: 'Jogos',
	description: 'Jogue Conecte 4 com alguém.',
	expectedArgs: '<@Segundo_Jogador>',

	callback: async ({
		message,
		args,
		channel
	}) => {
		const gameName = "Conecte Quatro";

		// Define os jogadores
		let player1 = message.member;
		let player2 = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

		// Se não houver jogador dois
		if (!player2) {
			player2 = await game.secondPlayer(message);
			// Se o segundo jogador ainda não estiver sido marcado
			if (!player2) return;
		}

		// Verifica se o segundo jogador é um bot
		if (player2.user.bot) return channel.send(`${player1}, não é possível jogar contra um bot.`);

		// Verifica se os dois jogadores são usuários diferentes
		if (player1 !== player2) {
			// Cria um desafio
			if (await game.challenge(message, player1, player2, gameName) === false) return;
		}

		// Cria um tabuleiro vazio
		const esp = "▫️"; // esp: Empty Space
		const board = [
			[esp, esp, esp, esp, esp, esp, esp],
			[esp, esp, esp, esp, esp, esp, esp],
			[esp, esp, esp, esp, esp, esp, esp],
			[esp, esp, esp, esp, esp, esp, esp],
			[esp, esp, esp, esp, esp, esp, esp],
			[esp, esp, esp, esp, esp, esp, esp]
		];

		const colEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

		// Junta o tabuleiro em uma string
		const renderBoard = (board) => {
			let tempString = `${colEmojis.join("")}\n`;

			for (const boardSection of board) {
				tempString += `${boardSection.join("")}\n`;
			}

			return tempString;
		}
		const gameData = [{
				member: player1,
				emoji: "🔴",
				color: color.red
			},
			{
				member: player2,
				emoji: "🟡",
				color: color.yellow
			}];
		let player = 0;

		// Mostra tabuleiro vazio
		const initialState = renderBoard(board);
		const initialEmbed = new MessageEmbed()
			.setTitle(`${gameData[player].emoji} Vez de: ${gameData[player].member.displayName}`)
			.setDescription(initialState)
			.setColor(gameData[player].color);
		const gameMessage = await channel.send(`${gameData[player].member}`, initialEmbed);

		// Coloca as reações na mensagem
		colEmojis.forEach(async el => await gameMessage.react(el));
		const gameFilter = (reaction, user) => colEmojis.includes(reaction.emoji.name) && (user.id === player2.id || user.id === player1.id);
		const gameCollector = gameMessage.createReactionCollector(gameFilter);

		// Verifica uma combinação
		const checkFour = (a, b, c, d) => (a !== esp) && (a === b) && (b === c) && (c === d);
		// Verifica combinação horizontal
		const checkHorizontal = () => {
			for (let row = 0; row < 6; row++) {
				for (let col = 0; col < 4; col++) {
					if (checkFour(board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3])) return true;
				}
			}
		}
		// Verifica combinação vertical
		const checkVertical = () => {
			for (let col = 0; col < 7; col++) {
				for (let row = 0; row < 3; row++) {
					if (checkFour(board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col])) return true;
				}
			}
		}
		// Verifica combinação diagonal superior-esquerdo à inferior-direito
		const checkDiagonal = () => {
			for (let col = 0; col < 4; col++) {
				for (let row = 0; row < 3; row++) {
					if (checkFour(board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3])) return true;
				}
			}
		}
		// Verifica combinação diagonal inferior-esquerdo à superior-direito
		const checkAntidiagonal = () => {
			for (let col = 0; col < 4; col++) {
				for (let row = 5; row > 2; row--) {
					if (checkFour(board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3])) return true;
				}
			}
		}

		/**
		 * Verifica se todos os campos do tabuleiro estão cheios.
		 * @returns true se os campos estiverem preenchidos
		 */
		const checkTie = () => {
			let count = 0;
			for (const el of board) {
				for (const string of el) {
					if (string !== esp) count++;
				}
			}
			if (count === 42) return true;
		}
		// Checks if a player won the game
		const checkWin = [checkHorizontal, checkVertical, checkDiagonal, checkAntidiagonal];

		// Quando for coletada uma reação
		gameCollector.on("collect", (reaction, user) => {
			// Verifica se a reação do do jogador da vez
			if (user.id === gameData[player].member.id) {
				let passTurn = true;

				const openSpaces = []
				const insertPiece = (col) => {
					passTurn = true;
					for (let row = 5; row > -1; row--) {
						if (board[row][col] === esp) openSpaces.push({
							i: row,
							j: col
						});
					}

					if (openSpaces.length === 0) {
						passTurn = false;
						return channel.send(`${gameData[player].member}, essa coluna já está cheia.`);
					} else {
						// Verifica se a coluna vai ser preenchida após inserção
						reaction.users.remove(user.id);
						if (openSpaces.length === 1) reaction.remove();

						board[openSpaces[0].i][openSpaces[0].j] = gameData[player].emoji;
					}
				}

				switch (reaction.emoji.name) {
					case "1️⃣":
						insertPiece(0);
						break;
					case "2️⃣":
						insertPiece(1);
						break;
					case "3️⃣":
						insertPiece(2);
						break;
					case "4️⃣":
						insertPiece(3);
						break;
					case "5️⃣":
						insertPiece(4);
						break;
					case "6️⃣":
						insertPiece(5);
						break;
					case "7️⃣":
						insertPiece(6);
						break;
					default:
						break;
				}

				// Verifica vitória
				for (const func of checkWin) {
					const data = func();
					if (data) {
						gameCollector.stop();
						gameMessage.reactions.removeAll();

						const winEmbed = new MessageEmbed()
							.setTitle(`${gameData[player].emoji} ${gameData[player].member.displayName} conectou quatro!`)
							.setDescription(renderBoard(board))
							.setColor(gameData[player].color);
						return gameMessage.edit(`Parabéns ${gameData[player].member}, você venceu!`, {
							embed: winEmbed
						});
					}
				}

				// Verifica Empate
				if (checkTie()) {
					gameCollector.stop();
					gameMessage.reactions.removeAll();

					const tieEmbed = new MessageEmbed()
						.setTitle("Jogo Empatado")
						.setDescription(renderBoard(board))
						.setColor(color.bot);
					return gameMessage.edit(`O jogo empatou! ${gameData[0].member} ${gameData[1].member}`, {
						embed: tieEmbed
					});
				}

				if (passTurn === true) {
					// Muda de jogador, sempre vai ser 0 ou 1
					player = (player + 1) % 2;

					// Atualiza o tabuleiro
					const updEmbed = new MessageEmbed()
						.setTitle(`${gameData[player].emoji} Vez de: ${gameData[player].member.displayName}`)
						.setDescription(renderBoard(board))
						.setColor(gameData[player].color);
					gameMessage.edit(`${gameData[player].member}`, {
						embed: updEmbed
					});
				}
			}
		});
	}
}