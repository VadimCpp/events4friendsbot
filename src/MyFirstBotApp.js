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
                'Этот бот создан специально для нашего уютненького телеграм чата @events4friends, ' + 
                'в котором мы обсуждаем события, делимся классными фоточками и просто общаемся. ' +
                'Если Вам интересны технические детали, что делает этот бот и почему он появился, ' +
                'читайте [пост](https://frontend-basics.blogspot.com/2019/08/events4friendsbot.html).\n\n' +
                'Приглашаю Вас также посетить сайт [events4friend.ru](https://events4friends.ru/) ' + 
                'и ознакомиться с предстоящими событиями.';
        }

        bot.sendMessage(msg.chat.id, messageText, {                
            parse_mode: "Markdown",
            disable_web_page_preview: true,                        
        });
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
