const moment = require('moment');
require('moment/locale/ru');

const FIREBASE_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';

//
// Функция преобразовует начало мероприятия event.start в читаемый формат даты
// Примеры работы функции:
//   5 нояб.
//   7 нояб.
//   8 нояб.
//
const getStartDate = (event) => {
  let startDate = 'Не указано';

  if (event && event.start) {
    startDate = moment(event.start, FIREBASE_DATE_FORMAT).format('D MMM');
  }

  return startDate;
}

//
// Функция преобразовует начало мероприятия event.start в читаемый формат времени
// Примеры работы функции:
//   17:30
//   10:00
//   15:00
//
const getStartTime = (event) => {
  let startDate = 'Не указано';

  if (event && event.start) {
      startDate = moment(event.start, FIREBASE_DATE_FORMAT).format('HH:mm');
  }

  return startDate;
}

//
// Функция преобразовует часовой пояс event.timezone в удобный формат для человека
// Примеры работы функции:
//   (Мск)
//   (Клд)
//
const getTimezone = (event) => {
  let timezone = '';

  if (event && event.timezone === '+0200') {
      timezone += ' (Клд)';
  }
  if (event && event.timezone === '+0300') {
      timezone += ' (Мск)';
  }

  return timezone;
}

/**
 * Функция verboseDateTime возвращает время начала мероприятия в удобочитаемом формате.
 * Примеры работы функции:
 *   5 ноя 17:30(Мск)
 *   7 ноя 10:00(Клд)
 *   8 ноя 15:00(Клд)
 *
 * @param {Object} event
 * @returns {string}
 */
const verboseDateTime = (event) => {
  const startDate = getStartDate(event);
  const startTime = getStartTime(event);
  const timezone = getTimezone(event);

  return `${startDate} ${startTime}${timezone}`;
}

module.exports = verboseDateTime;
