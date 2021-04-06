const admin = require('firebase-admin');
const fetch = require("node-fetch");
const moment = require('moment');
require('moment/locale/ru');

const verboseEventsList = require('./verbose/eventsList.js');
const dbReadEvents = require('./collections/events.js');
const dbPinnedMessages = require('./collections/pinnedMessages.js');
const getPinnedMessage = require('./utils/getPinnedMessage');
const e = require('express');

const FIREBASE_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';
const PINNED_MESSAGE_DATE_FORMAT = 'YYYY-MM-DD';
const FRONTEND_BASICS_CHAT_ID = '-1001496443397'; // https://t.me/frontendBasics
const EVENTS4FRIENDS_CHAT_ID = '-1001396932806'; // https://t.me/events4friends
const DEFAULT_COMMUNITY_ID = 1;

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
   * Получение информации о мероприятиях
   */
  _getInfo = () => {
    return new Promise((resolve) => {
      const db = this._firebaseApp.firestore();
      dbReadEvents(db).then((events) => { 
        const message = verboseEventsList(events);
        resolve(message);
      }).catch(error => {
        console.log(error);
        resolve('Увы, произошла неизвестная ошибка. Пожалуйста, обратитесь в техническую поддержку: @frontendbasics');
      });  
    });
  }

  /**
   * У личных чатов положительные ID
   *
   * @param {Object} msg
   * @return {boolean}
   * @private
   */
  _isPrivateMsg(msg) {
    return msg.chat.id > 0;
  }

  /**
   * Отправить и закрепить сообщение в чат
   *
   * @param {Object} bot
   * @param {function} aCallback
   * @private
   */
  _sendMessageToChatAndPin(bot, aCallback) {
    this._getInfo().then((aMessage) => {
      bot.sendMessage(this._chatId, aMessage, {                
        parse_mode: "Markdown",
        disable_web_page_preview: true,                        
      })
      .then((data) => {
        console.log('Message has sent');
        if (data && data.message_id) {
          bot.pinChatMessage(this._chatId, data.message_id, {
            disable_notification: true
          })
          .then(() => {
            console.log('Message has pinned, save pinned message ID:', data.message_id);
            aCallback(data.message_id)
          })
          .catch((error) => {
            console.log('Error pinning message:', error);
          });
        }
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
    });
  }

  /**
   * Обновить закрепленное сообщение.
   *
   * @param {Object} bot
   * @param {number} chatId
   * @param {number} pinnedMessageId
   * @param {function} aCallback
   * @private
   */
  _updatePinnedMessage(bot, chatId, pinnedMessageId, aCallback) {
    this._getInfo().then((aMessage) => {
      bot.editMessageText(aMessage, {                
        chat_id: chatId,
        message_id: pinnedMessageId,
        text: aMessage,
        parse_mode: "Markdown",
        disable_web_page_preview: true, 
      })
      .then(() => {
        console.log('Message has edited');
        aCallback();
      })
      .catch((error) => {
        console.log('Failed editing message:', error);
      });
    })
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
      'Здравствуйте, ' + this._getName(msg) + ".\n\n" +
      'Этот бот создан для телеграм чата @events4friends. ' + 
      'Бот следит за изменениями на сайте [events4friend.ru](https://events4friends.ru/) ' + 
      'и обновляет информацию в закрепленном сообщении чата.\n\n' +
      'Введите команду /info, чтобы посмотреть инормацию об услугах и мероприятиях.';
    bot.sendMessage(msg.chat.id, messageText, {                
      parse_mode: "Markdown",
      disable_web_page_preview: true,                        
    });
  }

  /**
   * Функция обрабатывает команду пользователя '/info'
   * 
   * @param {Object} bot
   * @param {Object} msg
   * @public
   */
  handleInfoCommand(bot, msg) {
    this._getInfo().then(aMessage => {
      bot.sendMessage(msg.chat.id, aMessage, {                
        parse_mode: "Markdown",
        disable_web_page_preview: true,                        
      });                 
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
    const that = this;
    const db = this._firebaseApp.firestore();
    dbPinnedMessages.dbReadPinnedMessages(db,
      function (pinnedMessages) {
        const pinnedMessage = getPinnedMessage(pinnedMessages, DEFAULT_COMMUNITY_ID);

        if (pinnedMessage) {
          //
          // NOTE!
          // Для удобства администрирования текущая дата хранится в базе в формате YYYY-MM-DD:
          // https://github.com/VadimCpp/events4friends-firestore#%D0%B8%D0%B4%D0%B5%D0%BD%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%D0%BE%D1%80%D1%8B-%D0%B7%D0%B0%D0%BA%D1%80%D0%B5%D0%BF%D0%BB%D0%B5%D0%BD%D0%BD%D1%8B%D1%85-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9
          //
          // Сравнение даты происходит путем сравнения строк (например "2020-11-09")
          //
          const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);

          if (today === pinnedMessages.date) { // Текущая дата совпадает с датой закрепленного сообщения в базе данных
            
            if (pinnedMessage.chatId && pinnedMessage.pinnedMessageId) { // Информация о закрепленном сообщении найдена

              that._updatePinnedMessage(bot, pinnedMessage.chatId, pinnedMessage.pinnedMessageId, () => {});

            } else if (pinnedMessage.chatId && !pinnedMessage.pinnedMessageId) { // Информация о закрепленном сообщении не найдена
              that._sendMessageToChatAndPin(bot, function (messageId) {
                dbPinnedMessages.dbWritePinnedMessage(db, messageId, that._chatId, today, () => {}, () => {});
              });

            } else { // Ошибка данных в firebase
              bot.sendMessage(
                msg.chat.id,
                'Не могу найти чат, к которому относится закрепленное сообщение. ' + 
                'Обратитесь, пожалуйста, в техническую поддержку: @frontendbasics'
              );
            }

          } else { // Текущая дата не совпадает с датой закрепленного сообщения в базе данных.

            if (pinnedMessage.chatId) { // Информация о чате сообщества найдена
              that._sendMessageToChatAndPin(bot, function (messageId) {
                dbPinnedMessages.dbWritePinnedMessage(db, messageId, that._chatId, today, () => {}, () => {});
              });

            } else { // Ошибка данных в firebase
              bot.sendMessage(
                msg.chat.id,
                'Невозможно найти чат, к которому относится закрепленное сообщение. ' + 
                'Обратитесь, пожалуйста, в техническую поддержку: @frontendbasics'
              );
            }

          }

        } else {
          bot.sendMessage(
            msg.chat.id,
            'Произошла ошибка при получении информации о закрепленном сообщении. ' + 
            'Обратитесь, пожалуйста, в техническую поддержку: @frontendbasics'
          );
        }
      },
      function (errorMessage) {
        bot.sendMessage(
          msg.chat.id,
          errorMessage
        );
      },
    );
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
    const messageText =
      'Уважаемый(ая) ' + this._getName(msg) + ".\n\n" +
      'Введите команду /info, чтобы посмотреть инормацию об услугах и мероприятиях.';
    bot.sendMessage(msg.chat.id, messageText, {                
      parse_mode: "Markdown",
      disable_web_page_preview: true,                        
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

    if (this._isPrivateMsg(msg)) {
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

  /**
   * @param {Object} msg
   * @return {string}
   * @private
   */
  _getName(msg) {
    let result = 'Без имени 👤';
    let fname = msg.from.first_name;
    let lname = msg.from.last_name;
    let uname = msg.from.username;

    if (fname) {
      result = fname + (lname ? ' ' + lname : '') ;    
    } else if (uname) {
      result = uname;
    }

    return result;
  }
}

module.exports = Events4FriendsBotApp;
