module.exports.config = {
  name: "fight",
  version: "1.2.1",
  role: 0,
  author: "dipto",
  description: "Challenge a user to a duel",
  guide: { en: "{p} [Mention]" },
  category: "game",
  coolDowns: 5,
};

const attacks = ["kick", "punch", "slap", "headbutt", "forfeit"];
const MAX_HP = 100;
const TIME_LIMIT = 60000;

function getRandomDamage() {
  return Math.floor(Math.random() * 30) + 1;
}

function switchTurn(game) {
  game.currentPlayer =
    game.currentPlayer === game.player1 ? game.player2 : game.player1;
  game.opponent =
    game.currentPlayer === game.player1 ? game.player2 : game.player1;
}

function announceWinner(api, event, winner, loser, messageID) {
  api.sendMessage(
    `🎉 ${winner.name} wins the duel against ${loser.name}!`,
    event.threadID,
    () => {
      global.GoatBot.onReply.delete(messageID);
    },event.messageID
  );
}

module.exports.onReply = async ({ api, event, Reply }) => {
  const { game } = Reply;
if (event.senderID !== game.currentPlayer.id && event.senderID !== game.opponent.id) return;
  
  if (event.senderID !== game.currentPlayer.id) {
    return api.sendMessage(`It's ${game.currentPlayer.name}'s turn!`, event.threadID);
  }

  const attack = event.body?.toLowerCase() || "";
  if (!attacks.includes(attack)) {
    return api.sendMessage(
      "Invalid attack. Please choose: kick, punch, slap, headbutt, or forfeit.",
      event.threadID
    );
  }

  const damage = getRandomDamage();
  game.opponent.hp -= damage;

  if (game.opponent.hp <= 0) {
    game.opponent.hp = 0;
  }

  api.sendMessage(
    `🥊 ${game.currentPlayer.name} attacks ${game.opponent.name} with ${attack} and deals ${damage} damage.\n\n` +
      `${game.opponent.name} now has ${game.opponent.hp} HP left.`,
    event.threadID,
    (error, info) => {
      if (game.opponent.hp <= 0) {
        return announceWinner(api, event, game.currentPlayer, game.opponent, Reply.messageID);
      }

      switchTurn(game);

      api.sendMessage(
        `It's ${
          game.currentPlayer.name
        }'s turn now.\nAvailable attacks: ${attacks.join(", ")}`,
        event.threadID
      );

      clearTimeout(game.timeout);
      game.timeout = setTimeout(() => {
        announceWinner(api, event, game.opponent, game.currentPlayer, Reply.messageID);
      }, TIME_LIMIT);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        game,
      });
    }
  );
};

module.exports.onStart = async function ({ api, event, usersData }) {
  if (!Object.keys(event.mentions)[0]) {
    return api.sendMessage("Please mention exactly one user to challenge.", event.threadID);
  }

  const challenger = {
    id: event.senderID,
    name: await usersData.getName(event.senderID),
    hp: MAX_HP,
  };
  const opponentID = Object.keys(event.mentions)[0];
  const opponent = {
    id: opponentID,
    name: await usersData.getName(opponentID),
    hp: MAX_HP,
  };

  const isChallengerFirst = Math.random() > 0.5;
  const firstPlayer = isChallengerFirst ? challenger : opponent;
  const secondPlayer = isChallengerFirst ? opponent : challenger;

  const message =
    `${challenger.name} has challenged ${opponent.name} to a duel!\n\n` +
    `${challenger.name} has ${challenger.hp} HP, and ${opponent.name} has ${opponent.hp} HP.\n\n` +
    `Available attacks: ${attacks.join(", ")}`;

  api.sendMessage(
    message,
    event.threadID,
    (error, info) => {
      const game = {
        player1: challenger,
        player2: opponent,
        currentPlayer: firstPlayer,
        opponent: secondPlayer,
        timeout: null,
      };

      api.sendMessage(
        `It's ${
          game.currentPlayer.name
        }'s turn.\nAvailable attacks: ${attacks.join(", ")}`,
        event.threadID
      );

      game.timeout = setTimeout(() => {
        announceWinner(api, event, game.opponent, game.currentPlayer, info.messageID);
      }, TIME_LIMIT);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: challenger.id,
        game,
      });
    }
  );
    }
