/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @return {Promise}
 */
const dbReadServices = (db) => {
  return db.collection("services").get()
    .then(function(querySnapshot) {
      return querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))
    });
}

module.exports = dbReadServices;
