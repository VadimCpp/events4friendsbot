const admin = require('firebase-admin');
const fetch = require("node-fetch");
const moment = require('moment');
require('moment/locale/ru');

const verboseDateTime = require('./verbose/dateTime.js');
const upcomingEvents = require('./verbose/upcomingEvents.js');
const dbReadEvents = require('./collections/events.js');
const dbReadCommunities = require('./collections/communities.js');
const dbPinnedMessages = require('./collections/pinnedMessages.js');
const getPinnedMessage = require('./utils/getPinnedMessage');
const getUserName = require('./utils/getUserName');

const FIREBASE_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';
const PINNED_MESSAGE_DATE_FORMAT = 'YYYY-MM-DD';
const LOG_CHAT_ID = '-1001191278325';
const FRONTEND_BASICS_CHAT_ID = '-1001496443397'; // https://t.me/frontendBasics
const EVENTS4FRIENDS_CHAT_ID = '-1001396932806'; // https://t.me/events4friends

class Events4FriendsBotApp {
  /**
   * Конструктор
   */
  constructor() {
    console.log('');
    console.log('[Events4FriendsBotApp]: Create Application...');

    this._chatId = process.env.NODE_ENV === 'development' ? FRONTEND_BASICS_CHAT_ID : EVENTS4FRIENDS_CHAT_ID;

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

    this._adminId = '148045459'; // @vadimcpp

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
   * Функция отправляет и закрепляет сообщение в чат
   *
   * @param {Object} bot
   * @param {Object} community
   * @private
   */
  _sendMessageToChatAndPin(bot, community) {
    console.log(`Send an pin new message for ${community.name}`);

    const db = this._firebaseApp.firestore();

    dbReadEvents(db)
      .then((events) => upcomingEvents(community, events))
      .then((aMessage) => bot.sendMessage(community.chatId, aMessage, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }))
      .then((data) => {
        return bot.pinChatMessage(community.chatId, data.message_id, {
          disable_notification: true
        }).then((success) => ({ success, data }));
      })
      .then(({ success, data }) => {
        if (success) {
          const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
          return dbPinnedMessages.dbWritePinnedMessage(db, data.message_id, community, today)
        }
      })
      .catch((error) => {
        console.log('Error pinning message:', error);
      });
  }

  /**
   * Функция возвращает true, если date - сегодня
   *
   * NOTE!
   * Для удобства администрирования текущая дата хранится в базе в формате YYYY-MM-DD:
   * Сравнение даты происходит путем сравнения строк (например "2020-11-09")
   *
   * @param {string} date
   * @private
   */
  _isToday = (date) => {
    const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
    return today.localeCompare(date) === 0;
  }

  /**
   * Функция обрабатывает команду пользователя '/update'
   *
   * @param {Object} bot
   * @param {string} chatId
   * @public
   */
  _handleUpdateCommand = (bot, chatId) => {
    const that = this;
    const db = this._firebaseApp.firestore();
    dbPinnedMessages
      .dbReadPinnedMessages(db).then((pinnedMessages) => {
        return dbReadCommunities(db).then((communities) => ({communities, pinnedMessages}))
      })
      .then(({communities, pinnedMessages}) => {
        communities.map((community) => {
          const pinnedMessage = getPinnedMessage(pinnedMessages, community.id);
          if (pinnedMessage && pinnedMessage.pinnedMessageId && this._isToday(pinnedMessage.date)) {
            that._updatePinnedMessage(bot, community, pinnedMessage);
          } else {
            that._sendMessageToChatAndPin(bot, community);
          }
        });
      })
      .catch((error) => bot.sendMessage(chatId, error));
  }

  /**
   * Этот метод вызывается при обновлении анонсов на сайте events4friends.ru
   *
   * @param {Object} bot
   * @param {Object} event данные о мероприятии
   * @param {string} userName имя администратора сайта
   */
  updatePinnedMessage(bot, event, userName) {
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

    bot.sendMessage(
      LOG_CHAT_ID,
      `🎫 ${userName}${type}:\n${verboseDateTime(event)}\n${event.summary}${link}`,
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      },
    );

    this._handleUpdateCommand(bot, LOG_CHAT_ID);
  }

  /**
   * Функция обновляет закрепленное сообщение.
   *
   * @param {Object} bot
   * @param {Object} community
   * @param {Object} pinnedMessage
   * @private
   */
  _updatePinnedMessage(bot, community, pinnedMessage) {
    console.log(`Update pinned message for ${community.name}`);

    const db = this._firebaseApp.firestore();

    dbReadEvents(db)
      .then((events) => upcomingEvents(community, events))
      .then((aMessage) => bot.editMessageText(aMessage, {
        chat_id: community.chatId,
        message_id: pinnedMessage.pinnedMessageId,
        text: aMessage,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }))
      .then(() => {
        console.log('Update pinned message - done');
      })
      .catch((error) => {
        console.log('Fail to update pinned message:', error);
      });
  }

  /**
   * Функция обрабатывает команду пользователя '/start'
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleStartCommand(bot, msg) {
    const messageText =
      'Здравствуйте, ' + getUserName(msg) + ".\n\n" +
      'Это бот-помощник. Он следит за изменениями на сайте [events4friend.ru](https://events4friends.ru/) ' +
      'и обновляет информацию о предстоящих мероприятиях в закрепленном сообщении чата. ' +
      'По вопросам работы бота пишите программисту [Вадиму Канинскому](https://vadimcpp.ru/?utm_source=telegram)\n\n' +
      'Посмотреть предстоящие мероприятия ➡️ /info';
    bot.sendMessage(msg.chat.id, messageText, {
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
   * @public
   */
  handleInfoCommand(bot, msg) {
    const db = this._firebaseApp.firestore();
    dbReadCommunities(db).then((communities) =>
      dbReadEvents(db).then((events) => ({communities, events}))
    ).then(({communities, events}) => {
      console.log(`Got ${communities.length} communities and ${events.length} events`);
      let aMessage = 'Анонсы какого сообщества Вам интересны?\n\n';
      communities.map((community) =>
          aMessage += `${community.name} ➡️ /${community.slug}\n`
      );
      bot.sendMessage(
        msg.chat.id,
        aMessage
        // upcomingEvents(community, events),
        // {
        //   parse_mode: "Markdown",
        //   disable_web_page_preview: true,
        // }
      )
    }).catch(error => {
      console.log(error);
    });
  }

  /**
   * Функция обрабатывает команду пользователя '/update'
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleUpdateCommand = (bot, msg) => {
    this._handleUpdateCommand(bot, msg.chat.id);
  }

  /**
   * Команда отправляет на мобильные устройства PUSH уведомление
   *
   * NOTE!
   * Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
   */
  _sendPushNotification = async (expoPushToken, summary) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Вы установили напоминание',
      body: `Сегодня состоится «${summary}»`,
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  /**
   * /remind command handler
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleRemindCommand = (bot, msg) => {
    const that = this;

    if (msg.chat.id == this._adminId) {
      const db = this._firebaseApp.firestore();

      //
      // NOTE!
      // Получаем напоминания reminders из базы данных
      //
      db.collection("reminders").get()
      .then(function(querySnapshot) {
        let reminders = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

        //
        // NOTE!
        // Получаем напоминания events из базы данных
        //
        db.collection("events").get()
        .then(function(eventsSnapshot) {
          let events = eventsSnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

          //
          // NOTE!
          // Фильтруем события: оставляем только те, которые будут сегодня.
          //
          events = events.filter(event => moment(event.start, FIREBASE_DATE_FORMAT).isSame(new Date(), 'day'));

          //
          // NOTE!
          // Фильтруем напоминания: оставляем только напоминания для отфильтрованых событий.
          //
          reminders = reminders.filter(reminder => {
            const reminderEventId = reminder.eventId;
            for(let i = 0; i < events.length; i++) {
              const event = events[i];
              if (reminderEventId == event.id) {
                return true;
              }
            }
            return false;
          })

          //
          // NOTE!
          // Изменяем напоминания: добавляем данные о событии
          //
          reminders = reminders.map(reminder => {
            const reminderEventId = reminder.eventId;
            for(let i = 0; i < events.length; i++) {
              const event = events[i];
              if (reminderEventId == event.id) {
                return {
                  summary: event.summary,
                  ...reminder,
                }
              }
            }
            return reminder;
          })
          console.log('filtered and updated reminders:', reminders);

          //
          // NOTE!
          // Отправляем PUSH уведомления
          //
          for(let i = 0; i < reminders.length; i++) {
            that._sendPushNotification(reminders[i].expoPushToken, reminders[i].summary);
          }

          bot.sendMessage(
            msg.chat.id,
            'Отправлены push-уведомления на все устройства для событий сегодня. Проверяйте!'
          );
        })
        .catch(function(error) {
          console.warn("Error getting events, skip: ", error);
          aCallback(
            'Увы, произошла неизвестная ошибка. ' +
            'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
          );
        });
      })
      .catch(function(error) {
        console.warn("Error getting reminders, skip: ", error);
        aCallback(
          'Увы, произошла неизвестная ошибка. ' +
          'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
        );
      });
    } else {
      bot.sendMessage(
        msg.chat.id,
        "К сожалению, у Вас нет прав выполнить эту команду. Попробуйте /info"
      );
    }
  }

  /**
   * Отправка тестового PUSH уведомления
   *
   * NOTE!
   * Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
   */
  _sendTestPushNotification = async (expoPushToken) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Дорогие котики 🐈',
      body: 'Вы прекрасны 😻!!!',
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  /**
   * /testpush command handler
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleTestpushCommand = (bot, msg) => {
    const that = this;

    if (msg.chat.id == this._adminId) {
      const db = this._firebaseApp.firestore();

      //
      // NOTE!
      // Получаем напоминания reminders из базы данных
      //
      db.collection("reminders").get()
      .then(function(querySnapshot) {
        let reminders = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

        //
        // NOTE!
        // Получаем напоминания events из базы данных
        //
        db.collection("events").get()
        .then(function(eventsSnapshot) {
          let events = eventsSnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

          //
          // NOTE!
          // Фильтруем события: оставляем только те, которые будут сегодня.
          //
          events = events.filter(event => moment(event.start, FIREBASE_DATE_FORMAT).isSame(new Date(), 'day'));

          //
          // NOTE!
          // Фильтруем напоминания: оставляем только напоминания для отфильтрованых событий.
          //
          reminders = reminders.filter(reminder => {
            const reminderEventId = reminder.eventId;
            for(let i = 0; i < events.length; i++) {
              const event = events[i];
              if (reminderEventId == event.id) {
                return true;
              }
            }
            return false;
          })
          console.log('filtered reminders:', reminders);

          //
          // NOTE!
          // Отправляем PUSH уведомления
          //
          for(let i = 0; i < reminders.length; i++) {
            that._sendTestPushNotification(reminders[i].expoPushToken);
          }

          bot.sendMessage(
            msg.chat.id,
            'Отправлены тестовые push-уведомления на все устройства для событий сегодня. Проверяйте!'
          );
        })
        .catch(function(error) {
          console.warn("Error getting events, skip: ", error);
          aCallback(
            'Увы, произошла неизвестная ошибка. ' +
            'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
          );
        });
      })
      .catch(function(error) {
        console.warn("Error getting reminders, skip: ", error);
        aCallback(
          'Увы, произошла неизвестная ошибка. ' +
          'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
        );
      });
    } else {
      bot.sendMessage(
        msg.chat.id,
        "К сожалению, у Вас нет прав выполнить эту команду. Попробуйте /info"
      );
    }
  }

  /**
   * Текст пользователю по умолчанию
   *
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleDefault(bot, msg) {
    const db = this._firebaseApp.firestore();

    dbReadCommunities(db).then((communities) => {
      const aCommunity = communities.find((community) => `/${community.slug}` === msg.text);
      if (aCommunity) {
        return dbReadEvents(db).then((events) => ({community: aCommunity, events}));
      }
      return { community: null };
    }).then(({community, events}) => {
      const aMessage = community ?
        upcomingEvents(community, events) :
        'Извините, не понял 🙁\nПопробуйте команду /info';

      return bot.sendMessage(
        msg.chat.id,
        aMessage,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }
      )
    }).catch(error => {
      console.log(error);
    });
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

    if (isPrivateMsg) {
      if (messageText === '/start') {
        this.handleStartCommand(bot, msg);
      } else if (messageText === '/info') {
        this.handleInfoCommand(bot, msg);
      } else if (messageText === '/update') {
        this.handleUpdateCommand(bot, msg);
      } else if (messageText === '/remind') {
        this.handleRemindCommand(bot, msg);
      } else if (messageText === '/testpush') {
        this.handleTestpushCommand(bot, msg);
      } else {
        this.handleDefault(bot, msg);
      }
    }
  }
}

module.exports = Events4FriendsBotApp;
