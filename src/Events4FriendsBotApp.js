const admin = require('firebase-admin');
const moment = require('moment');
require('moment/locale/ru');

const verboseDateTime = require('./verbose/dateTime.js');
const upcomingEvents = require('./verbose/upcomingEvents.js');
const dbReadEvents = require('./collections/events.js');
const dbReadCommunities = require('./collections/communities.js');
const dbPinnedMessages = require('./collections/pinnedMessages.js');
const getPinnedMessage = require('./utils/getPinnedMessage');
const getUserName = require('./utils/getUserName');
const isToday = require('./utils/isToday');
const {
  PINNED_MESSAGE_DATE_FORMAT,
  LOG_CHAT_ID
} = require("./constants");

class Events4FriendsBotApp {
  /**
   * Конструктор
   */
  constructor() {
    console.log('');
    console.log('[Events4FriendsBotApp]: Create Application...');

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

    /**
     * @type {Object}
     * @private
     */
    this._firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
      databaseURL: process.env.DATABASE_URL
    }, 'events4friends-bot');

    console.log(' 2️⃣  [Events4FriendsBotApp]: Connected as ' + this._firebaseApp.name);
  }

  /**
   * Функция обновляет закрепленное сообщение.
   *
   * @param {Object} bot
   * @param {Object} community
   * @param {Object} pinnedMessage
   * @param {Object} db
   * @public
   */
  static async doUpdatePinnedMessage(bot, community, pinnedMessage, db) {
    console.log(`Update pinned message for ${community.name}`);

    const events = await dbReadEvents(db);
    const aMessage = upcomingEvents(community, events);
    await bot.editMessageText(aMessage, {
      chat_id: community.chatId,
      message_id: pinnedMessage.pinnedMessageId,
      text: aMessage,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  /**
   * Функция отправляет и закрепляет сообщение в чат
   *
   * @param {Object} bot
   * @param {Object} community
   * @param {Object} db
   * @return {Promise}
   * @public
   */
  static async sendMessageToChatAndPin(bot, community, db) {
    console.log(`Send an pin new message for ${community.name}`);

    const events = await dbReadEvents(db);
    const aMessage = upcomingEvents(community, events);
    const data = await bot.sendMessage(community.chatId, aMessage, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    })
    const success = await bot.pinChatMessage(community.chatId, data.message_id, {
      disable_notification: true
    });
    if (success) {
      const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
      return dbPinnedMessages.dbWritePinnedMessage(db, data.message_id, community, today)
    }
  }

  /**
   * Функция обрабатывает команду пользователя '/update'
   *
   * @param {Object} bot
   * @param {string} chatId
   * @param {Object} db
   * @public
   */
  static async doUpdateCommand(bot, chatId, db) {
    const pinnedMessages = await dbPinnedMessages.dbReadPinnedMessages(db);
    const communities = await dbReadCommunities(db);
    for (let i = 0; i < communities.length; i++) {
      const community = communities[i];
      const pinnedMessage = getPinnedMessage(pinnedMessages, community.id);
      if (pinnedMessage && pinnedMessage.pinnedMessageId && isToday(pinnedMessage.date)) {
        await Events4FriendsBotApp.doUpdatePinnedMessage(bot, community, pinnedMessage, db);
      } else {
        await Events4FriendsBotApp.sendMessageToChatAndPin(bot, community, db);
      }
    }
  }

  /**
   * Этот метод отправляет рабочее уведомление в чат
   *
   * @param {Object} bot
   * @param {Object} event данные о мероприятии
   * @param {string} userName имя администратора сайта
   * @public
   */
  static async sendUpdateNotification(bot, event, userName) {
    let type = '';
    if (event.create) {
      type = ' создал(а)';
    } else if (event.delete) {
      type = ' удалил(а)';
    } else if (event.edit) {
      type = ' изменил(а)';
    }

    let link = '';
    if (event.id && !event.delete) {
      link = `\n[Подробнее...](https://events4friends.ru/#/event/${event.id})`;
    }

    return await bot.sendMessage(
      LOG_CHAT_ID,
      `🎫 ${userName}${type}:\n${verboseDateTime(event)}\n${event.summary}${link}`,
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      },
    );
  }

  /**
   * Функция обрабатывает команду пользователя '/start'
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  static async handleStartCommand(bot, msg) {
    const messageText =
      'Здравствуйте, ' + getUserName(msg) + ".\n\n" +
      'Это бот-помощник. Он следит за изменениями на сайте [events4friends.ru](https://events4friends.ru/) ' +
      'и обновляет информацию о предстоящих мероприятиях в закрепленном сообщении чата. ' +
      'По вопросам работы бота пишите программисту [Вадиму Канинскому](https://vadimcpp.ru/?utm_source=telegram)\n\n' +
      'Посмотреть предстоящие мероприятия ➡️ /info';
    return await bot.sendMessage(msg.chat.id, messageText, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  /**
   * Функция обрабатывает команду пользователя '/info'
   * Печатает расписание для всех сообществ
   *
   * @param {Object} bot
   * @param {Object} msg
   * @param {Object} db
   * @public
   */
  static async handleInfoCommand(bot, msg, db) {
    const communities = await dbReadCommunities(db);
    let aMessage = 'Анонсы какого сообщества Вам интересны?\n\n';
    communities.map((community) => aMessage += `${community.name} ➡️ /${community.slug}\n`);
    return await bot.sendMessage(msg.chat.id, aMessage);
  }

  /**
   * Текст пользователю по умолчанию
   *
   * @param {Object} bot
   * @param {Object} msg
   * @param {Object} db
   * @public
   */
  static async handleDefault(bot, msg, db) {
    const communities = await dbReadCommunities(db);
    const community = communities.find((community) => `/${community.slug}` === msg.text);
    let message = 'Извините, не понял 🙁\nПопробуйте команду /info';
    if (community) {
      const events = await dbReadEvents(db);
      message = upcomingEvents(community, events);
    }

    return await bot.sendMessage(
      msg.chat.id,
      message,
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }
    );
  }

  /**
   * Функция обрабатывает команду пользователя '/update'
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleUpdateCommand = (bot, msg) => {
    const db = this._firebaseApp.firestore();
    Events4FriendsBotApp.doUpdateCommand(bot, msg.chat.id, db).then();
  }

  /**
   * Этот метод вызывается при обновлении анонсов на сайте events4friends.ru
   *
   * @param {Object} bot
   * @param {Object} event данные о мероприятии
   * @param {string} userName имя администратора сайта
   * @public
   */
  updatePinnedMessage(bot, event, userName) {
    const db = this._firebaseApp.firestore();
    Events4FriendsBotApp.sendUpdateNotification(bot, event, userName).then();
    Events4FriendsBotApp.doUpdateCommand(bot, LOG_CHAT_ID, db).then();
  }

  /**
   * Main event handler
   *
   * @param {Object} msg
   * @param {Object} bot
   * @public
   */
  handleMessage(msg, bot) {
    console.log('');
    console.log(JSON.stringify(msg));

    const messageText = msg.text;
    const isPrivateMsg = msg.chat.id > 0;
    const db = this._firebaseApp.firestore();

    if (isPrivateMsg) {
      if (messageText === '/start') {
        Events4FriendsBotApp.handleStartCommand(bot, msg).then();
      } else if (messageText === '/info') {
        Events4FriendsBotApp.handleInfoCommand(bot, msg, db).then();
      } else if (messageText === '/update') {
        this.handleUpdateCommand(bot, msg);
      } else {
        Events4FriendsBotApp.handleDefault(bot, msg, db).then();
      }
    }
  }
}

module.exports = Events4FriendsBotApp;
