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

module.exports.getStartDate = getStartDate;
module.exports.getStartTime = getStartTime;
module.exports.getTimezone = getTimezone;
