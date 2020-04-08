const admin = require('firebase-admin');
const moment = require('moment');
const firebaseServiceAccount = require('./config/firebase-adminsdk.json');
require('moment/locale/ru');

class MyFirstBotApp {

    /**
     * @public
     */
    constructor() {
        console.log('');
        console.log('[MyFirstBotApp]: Create Application...');

        /**
         * @type {string}
         * @private
         */
        this._myWebsite = 'vadimcpp.ru';

        
        /**
         * @type {Object}
         * @private
         */
        this._firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(firebaseServiceAccount),
            databaseURL: process.env.DATABASE_URL
        }, 'events4friends-bot');

        console.log(' 2️⃣  [MyFirstBotApp]: Connected as ' + this._firebaseApp.name);        
    }

    /**
     * @private
     */
    _getStartDate = (event) => {
        let startDate = 'Не указано';

        if (event.start && event.start) {
            startDate = moment(event.start).format('D MMMM, dddd');
        }

        return startDate;
    }

    /**
     * @private
     */
    _getStartTime = (event) => {
        let startDate = 'Не указано';

        if (event.start && event.start) {
            startDate = moment(event.start).format('HH:mm');
        }

        return startDate;
    }

    /**
     * @private
     */
    _formatEvents = (events) => {
        let message = '';

        if (events.length > 0) {
            message += 'Предстоящие мероприятия:\n\n';

            for(let i = 0; i < events.length; i++) {
                const event = events[i];
                const startDate = this._getStartDate(event);
                const startTime = this._getStartTime(event);

                message += `📅 ${startDate} 🕗 ${startTime} － «${event.summary}»`;
                if (event.isOnline) {
                    message += '🕸 Всемирная паутина ';
                } else {
                    message += `📍 ${event.location} `;
                }
                const url = `https://events4friends.ru/#/event/${event.id}`
                message += `( [Подробнее...](${url}) )`
                message += '\n\n'
            }
        } else {
            message += 'Предстоящих мероприятий нет\n\n';
        }

        return message;
    }

    /**
     * @private
     */
    _getInfo = (aCallback) => {
        const that = this;
        const db = this._firebaseApp.firestore();
        db.collection("services").get()
        .then(function(querySnapshot) {
            const services = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))
            
            db.collection("events").get()
            .then(function(querySnapshot) {
                const events = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))
                
                let message = '';
                
                message += that._formatEvents(events);

                // if (services.length > 0) {
                //     message += `Услуги: ${services.length}`;
                // } else {
                //     message += 'Услуг  нет'
                // }
                message += `Услуги:\n[https://events4friends.ru/#/services](https://events4friends.ru/#/services)`;
                
                aCallback(message)
            })
            .catch(function(error) {
                console.warn("Error getting services, skip: ", error);
                aCallback(
                    'Увы, произошла неизвестная ошибка. ' + 
                    'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
                );
            });
        })
        .catch(function(error) {
            console.warn("Error getting services, skip: ", error);
            aCallback(
                'Увы, произошла неизвестная ошибка. ' + 
                'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
            );
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

        //
        // TODO: view logs on your server
        //
        console.log('');
        console.log(JSON.stringify(msg));

        /**
         * @type {string}
         */
        let messageText = msg.text;

        if (messageText === '/start') {
            messageText =
                'Здравствуйте, ' + this._getName(msg) + ".\n\n" +
                'Этот бот создан для телеграм чата @events4friends. ' + 
                'Бот следит за изменениями на сайте [events4friend.ru](https://events4friends.ru/) ' + 
                'и обновляет информацию в закрепленном сообщении чата.\n\n' +
                'Введите команду /info, чтобы посмотреть инормацию об услугах и мероприятиях.';
            bot.sendMessage(msg.chat.id, messageText, {                
                parse_mode: "Markdown",
                disable_web_page_preview: true,                        
            });                
    
        } else if (messageText === '/info') {
            this._getInfo((aMessage) => {
                bot.sendMessage(msg.chat.id, aMessage, {                
                    parse_mode: "Markdown",
                    disable_web_page_preview: true,                        
                });                 
            })
        } else {
            messageText =
                'Уважаемый(ая) ' + this._getName(msg) + ".\n\n" +
                'Введите команду /info, чтобы посмотреть инормацию об услугах и мероприятиях.';
            bot.sendMessage(msg.chat.id, messageText, {                
                parse_mode: "Markdown",
                disable_web_page_preview: true,                        
            });                
        }
    }

    /**
     * @param {Object} msg
     * @return {string}
     * @private
     */
    _getName(msg) {
        /**
         * @type {string}
         */
        let result = 'Без имени 👤';

        /**
         * @type {string}
         */
        let fname = msg.from.first_name;

        /**
         * @type {string}
         */
        let lname = msg.from.last_name;

        /**
         * @type {string}
         */
        let uname = msg.from.username;

        if (fname) {
            result = fname + ( lname ? ' ' + lname : '') ;    
        } else if (uname) {
            result = uname;
        }

        return result;
    }
}

module.exports = MyFirstBotApp;
