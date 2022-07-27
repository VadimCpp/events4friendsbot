/**
 * Функция читает из базы список анонсов
 * @param {object} db - база данных firestore
 * @return {Promise}
 */
const dbReadEvents = (db) => {
  return db.collection("events").get()
    .then(function(querySnapshot) {
      return querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }));
    });
}

module.exports = dbReadEvents;
