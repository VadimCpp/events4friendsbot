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
                'Этот бот создан для телеграм чата @events4friends. ' + 
                'Бот следит за изменениями на сайте [events4friend.ru](https://events4friends.ru/) ' + 
                'и обновляет информацию в закрепленном сообщении чата.\n\n' +
                'Введите команду /info, чтобы посмотреть содержимое закрепа.';
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
