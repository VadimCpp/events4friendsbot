const moment = require("moment");
const { FIREBASE_DATE_FORMAT } = require('../constants');

/**
 * Переносить на следующую неделю все еженедельные мероприятия
 *
 * @param {string} aDate в формате "2019-09-14T11:00:00", ISO-8601
 * @return {string|null}
 * @public
 */
const moveNextWeek = (aDate) => {
  let result = null;
  if (aDate) {
    const nextWeek = moment(aDate, FIREBASE_DATE_FORMAT).add(1, 'week');
    result = nextWeek.format(FIREBASE_DATE_FORMAT);
  }
  return result;
}

module.exports = moveNextWeek;
