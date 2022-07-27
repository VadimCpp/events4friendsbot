const moment = require('moment');
require('moment/locale/ru');

const FIREBASE_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';

/**
 * Функция преобразует начало мероприятия event.start в читаемый формат даты
 * @param event
 * @returns {string|null}
 *
 * Примеры работы функции:
 *    5 нояб.
 *    7 нояб.
 *    8 нояб.
 */
const getStartDate = (event) => {
  let startDate = null;

  if (event && event.start) {
    startDate = moment(event.start, FIREBASE_DATE_FORMAT).format('D MMM');
  }

  return startDate;
}

/**
 * Функция преобразует начало мероприятия event.start в читаемый формат времени
 * @param event
 * @returns {string|null}
 *
 * Примеры работы функции:
 *    17:30
 *    10:00
 *    15:00
 */
const getStartTime = (event) => {
  let startDate = null;

  if (event && event.start) {
      startDate = moment(event.start, FIREBASE_DATE_FORMAT).format('HH:mm');
  }

  return startDate;
}

/**
 * Функция преобразует часовой пояс event.timezone в удобный формат для человека
 * @param event
 * @returns {string|null}
 *
 * Примеры работы функции:
 *    17:30
 *    10:00
 *    15:00
 */
const getTimezone = (event) => {
  let timezone = null;

  if (event && event.timezone === '+0200') {
      timezone = '(Клд)';
  }
  if (event && event.timezone === '+0300') {
      timezone = '(Мск)';
  }

  return timezone;
}

/**
 * Функция verboseDateTime возвращает время начала мероприятия в удобочитаемом формате.
 * Примеры работы функции:
 *   5 июля 17:30 (Мск)
 *   7 июля 10:00 (Клд)
 *   8 июля 15:00 (Клд)
 *
 * @param {Object} event
 * @returns {string}
 */
const verboseDateTime = (event) => {
  const startDate = getStartDate(event);
  const startTime = getStartTime(event);
  const timezone = getTimezone(event);

  if (!startDate || !startTime || !timezone) {
    return 'Не указано';
  }

  return `${startDate} ${startTime} ${timezone}`;
}

module.exports = verboseDateTime;
