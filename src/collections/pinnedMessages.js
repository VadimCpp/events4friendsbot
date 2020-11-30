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
      'Обратитесь, пожалуйста, в техническую поддержку: @frontendbasics'
    );
  });
}

/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @param {number | string} msgId - номер сообщения
 * @param {number | string} chatId - id чата
 * @param {string} date - дата в формате 'YYYY-MM-DD'
 * @param {Function} onSuccess - без параметров
 * @param {Function} onError - в параметрах текст ошибки для пользователя
 */
const dbWritePinnedMessage = (db, msgId, chatId, date, onSuccess, onError) => {
  db.collection("pinnedMessages").doc("test").set({
    communityId: chatId,
    chatName: "events4friends",
    pinnedMessageId: msgId,
    date,
  }, { merge: true })
  .then(onSuccess)
  .catch(function(error) {
    console.warn("Error write to pinnedMessages: ", error);
    onError(
      'Ошибка. Не удалось записать в базу сообщение. ' +
      'Пожалуйста, в техническую поддержку: @frontendbasics'
    );
  });
}

module.exports.dbReadPinnedMessages = dbReadPinnedMessages;
module.exports.dbWritePinnedMessage = dbWritePinnedMessage;
