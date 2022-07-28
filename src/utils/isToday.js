const moment = require("moment");
const { PINNED_MESSAGE_DATE_FORMAT } = require("../constants");

/**
 * Функция возвращает true, если date - сегодня
 *
 * NOTE!
 * Для удобства администрирования текущая дата хранится в базе в формате YYYY-MM-DD:
 * Сравнение даты происходит путем сравнения строк (например "2020-11-09")
 *
 * @param {string} date
 * @public
 */
const isToday = (date) => {
  const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
  return today.localeCompare(date) === 0;
}

module.exports = isToday;
