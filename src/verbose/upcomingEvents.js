const moment = require('moment');
require('moment/locale/ru');

const verboseDateTime = require('./dateTime.js');

const FIREBASE_DATE_FORMAT_WITH_UTC = 'YYYY-MM-DDThh:mm:ssZZZZ';
const MAX_DISPLAYED_COUNT = 5;

//
// Функция принимает список мероприятий из базы для конеретного сообщества и возвращает
// форматированный вывод для отображения пользователю.
//
// Пример:
//
// Предстоящие мероприятия Трава education:
//
// English speaking club
// 28 авг 13:00(Мск)
// Онлайн
// Подробнее...
//
// Дискуссионный клуб
// 30 авг 19:00(Мск)
// Кафе «Африка», набережная реки Фонтанки, 130
// Подробнее...
//
//
const upcomingEvents = (community, events) => {
  const now = new Date();
  let message = '';

  events = events.filter(event => {
    // У старых событий нет поля communityId, поэтому оставляем 1 по умолчанию
    const anCommunityId = event.communityId || '1';
    return anCommunityId === community.id && event.start && event.timezone
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
    message += `Предстоящие мероприятия ${community.name}:\n\n`;

    for(let i = 0; i < events.length; i++) {
      if (i < MAX_DISPLAYED_COUNT) {
        const event = events[i];

        const url = `https://events4friends.ru/#/${community.slug}/event/${event.id}`;
        message += `[${event.summary}](${url})\n`
        message += `${verboseDateTime(event)} @ `;
        if (event.isOnline) {
            message += 'Онлайн ';
        } else {
            message += `${event.location} `;
        }

        message += '\n\n';
      } else {
        moreUpcomingEvents++;
      }
    }

    const upcomingEventsUrl = `https://events4friends.ru/#/${community.slug}/events`;
    if (moreUpcomingEvents === 1) {
      message += `и еще [${moreUpcomingEvents} предстоящее мероприятие](${upcomingEventsUrl})...`
      message += '\n\n'
    } else if (moreUpcomingEvents > 1) {
      message += `и еще [${moreUpcomingEvents} предстоящих мероприятий](${upcomingEventsUrl})...`
      message += '\n\n'
    }
  } else {
    message += `Предстоящих мероприятий ${community.name} нет 🤷‍\n\n`;
  }

  return message;
}

module.exports = upcomingEvents;
