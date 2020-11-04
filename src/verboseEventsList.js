const moment = require('moment');
require('moment/locale/ru');

const verboseDateTime = require('./verboseDateTime.js');

const FIREBASE_DATE_FORMAT_WITH_UTC = 'YYYY-MM-DDThh:mm:ssZZZZ';
const UPCOMING_EVENTS_URL = 'https://events4friends.ru/#/events';
const MAX_DISPLAYED_COUNT = 5;

//
// Функция принимает список мероприятий из базы и возвращает
// форматированный вывод для отображения пользователю.
//
// Пример:
//
//
// Предстоящие мероприятия:
//
// 📅 5 ноября, четверг 🕗 17:30 (Мск) － «Программирование - 69 👩‍💻»🕸 Онлайн ( Подробнее... )
//
// 📅 5 ноября, четверг 🕗 19:00 (Клд) － «Лекция о порядке»📍 Калининград, ул. Грекова, 2А ( Подробнее... )
//
// 📅 7 ноября, суббота 🕗 10:00 (Клд) － «На кладбище в Краснолесье»📍 Гусев, музей на Московской ( Подробнее... )
//
// 📅 8 ноября, воскресенье 🕗 08:00 (Клд) － «Воскресная служба в Родниках»📍 Церковный переулок, 1, посёлок Родники, Калининград ( Подробнее... )
//
// 📅 8 ноября, воскресенье 🕗 15:00 (Клд) － «Воскресная велопрогулка - 31 🚴»📍 Калининград, Резиденция королей ( Подробнее... )
//
// и еще 3 предстоящих мероприятий...
//
//
const verboseEventsList = (events) => {
  const now = new Date(); 
  let message = '';

  events = events.filter(event => {
    return event.start && event.timezone
      ? moment(`${event.start}${event.timezone}`, FIREBASE_DATE_FORMAT_WITH_UTC).toDate() > now
      : false;
  });

  events.sort((a, b) => {
    if (a.start > b.start) {
      return 1;
    } else if (a.start < b.start) {
      return -1;
    }
    return 0;
  });
  
  let moreUpcomingEvents = 0;

  if (events.length > 0) {
    message += 'Предстоящие мероприятия:\n\n';

    for(let i = 0; i < events.length; i++) {
      if (i < MAX_DISPLAYED_COUNT) {
        const event = events[i];

        message += `${verboseDateTime(event)} － «${event.summary}»`;
        if (event.isOnline) {
            message += '🕸 Онлайн ';
        } else {
            message += `📍 ${event.location} `;
        }
        const url = `https://events4friends.ru/#/event/${event.id}`
        message += `( [Подробнее...](${url}) )`
        message += '\n\n'
      } else {
        moreUpcomingEvents++;
      }
    }

    if (moreUpcomingEvents === 1) {
      message += `и еще [${moreUpcomingEvents} предстоящее мероприятие](${UPCOMING_EVENTS_URL})...`
      message += '\n\n'
    } else if (moreUpcomingEvents > 1) {
      message += `и еще [${moreUpcomingEvents} предстоящих мероприятий](${UPCOMING_EVENTS_URL})...`
      message += '\n\n'
    }
  } else {
    message += 'Предстоящих мероприятий нет\n\n';
  }

  return message;
}

module.exports = verboseEventsList;
