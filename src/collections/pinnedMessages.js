/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @return {Promise}
 */
const dbReadPinnedMessages = (db) => {
  return db.collection("pinnedMessages").get()
  .then(function(querySnapshot) {
    const pinnedMessages = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))
    return pinnedMessages;
  })
  .catch(function(error) {
    console.warn("Error getting pinnedMessages, skip: ", error);
    throw 'Увы, произошла неизвестная ошибка. Обратитесь, пожалуйста, в техническую поддержку: @frontendbasics';
  });
}

/**
 * Функция обновляет в базы список услуг
 *
 * @param {object} db - база данных firestore
 * @param {number} msgId - номер сообщения
 * @param {object} community - сообщество
 * @param {string} date - дата в формате 'YYYY-MM-DD'
 */
const dbWritePinnedMessage = (db, msgId, community, date) => {
  return db.collection("pinnedMessages").doc(community.slug).set({
    communityId: community.id,
    chatName: community.name,
    pinnedMessageId: msgId,
    date,
  }, { merge: true });
}

module.exports.dbReadPinnedMessages = dbReadPinnedMessages;
module.exports.dbWritePinnedMessage = dbWritePinnedMessage;
