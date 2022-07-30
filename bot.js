const Bot = require('node-telegram-bot-api');
const Events4FriendsBotApp = require('./src/Events4FriendsBotApp.js');
const admin = require("firebase-admin");

const token = process.env.BOT_ACCESS_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Here is telegram bot is created
 */
let bot;
if (isProduction) {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
  bot.deleteWebHook();
}

/**
 * Here is firebase lib is created
 */
const firebaseServiceAccount = {
  "type": "service_account",
  "project_id": "events4friends",
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": decodeURI(process.env.PRIVATE_KEY),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
}
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: process.env.DATABASE_URL
}, 'events4friends-bot');
const db = firebaseApp.firestore();

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.updatePinnedMessage = (event, userName) => Events4FriendsBotApp.updatePinnedMessage(bot, event, userName, db)
bot.on('message', (msg) => {
  Events4FriendsBotApp.handleMessage(msg, bot, db);
});

module.exports = bot;
