/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @param {Function} onSuccess - в параметрах массив закрепленных сообщений
 * @param {Function} onError - в параметрах текст ошибки для пользователя
 */
const dbReadPinnedMessages = (db, onSuccess, onError) => {
  db.collection("pinnedMessages").get()
  .then(function(querySnapshot) {
    const pinnedMessages = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

    onSuccess(pinnedMessages);
  })
  .catch(function(error) {
    console.warn("Error getting pinnedMessages, skip: ", error);
    onError(
      'Увы, произошла неизвестная ошибка. ' + 
      'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
    );
  });
}

module.exports = dbReadPinnedMessages;
