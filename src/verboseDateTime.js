const moment = require('moment');
require('moment/locale/ru');

const FIREBASE_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';

//
// Функция преобразовует начало мероприятия event.start в читаемый формат даты
//
const getStartDate = (event) => {
  let startDate = 'Не указано';

  if (event && event.start) {
    startDate = moment(event.start, FIREBASE_DATE_FORMAT).format('D MMMM, dddd');
  }

  return startDate;
}

//
// Функция преобразовует начало мероприятия event.start в читаемый формат времени
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

//
// Функция verboseDateTime возвращает время начала мероприятия в удобочитаемом формате.
// Примеры работы функции:
//   📅 5 ноября, четверг 🕗 17:30 (Мск)
//   📅 7 ноября, суббота 🕗 10:00 (Клд) 
//   📅 8 ноября, воскресенье 🕗 15:00 (Клд)
//
const verboseDateTime = (event) => {
  const startDate = getStartDate(event);
  const startTime = getStartTime(event);
  const timezone = getTimezone(event);

  return `📅 ${startDate} 🕗 ${startTime}${timezone}`;
}

module.exports = verboseDateTime;
