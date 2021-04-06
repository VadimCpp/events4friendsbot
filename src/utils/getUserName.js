/**
 * Функция формирует имя пользователя
 *
 * @param {Object} msg
 * @return {string}
 * @private
 */
const getUserName = (msg) => {
  let result = 'Без имени 👤';
  let fname = msg.from.first_name;
  let lname = msg.from.last_name;
  let uname = msg.from.username;

  if (fname) {
    result = fname + (lname ? ' ' + lname : '') ;    
  } else if (uname) {
    result = uname;
  }

  return result;
}

module.exports = getUserName;
