const Bot = require('node-telegram-bot-api');
const Events4FriendsBotApp = require('./src/Events4FriendsBotApp.js');

const token = process.env.BOT_ACCESS_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

let events4FriendsBot = new Events4FriendsBotApp();
let bot;

if (isProduction) {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
  bot.deleteWebHook();
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.updatePinnedMessage = (event, userName) => events4FriendsBot.updatePinnedMessage(bot, event, userName)
bot.on('message', (msg) => {
  events4FriendsBot.handleMessage(msg, bot);
});

module.exports = bot;
