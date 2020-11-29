/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @param {Function} onSuccess - в параметрах массив мероприятий
 * @param {Function} onError - в параметрах текст ошибки для пользователя
 */
const dbReadEvents = (db, onSuccess, onError) => {
  db.collection("events").get()
  .then(function(querySnapshot) {
    const events = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

    onSuccess(events);
  })
  .catch(function(error) {
    console.warn("Error getting events, skip: ", error);
    onError(
      'Увы, произошла неизвестная ошибка. ' + 
      'Пожалуйста, обратитесь в техническую поддержку: @frontendbasics'
    );
  });
}

module.exports = dbReadEvents;
