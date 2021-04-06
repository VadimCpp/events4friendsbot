/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @return {Promise}
 */
const dbReadEvents = (db) => {
  return new Promise((resolve, reject) => {
    db.collection("events").get()
    .then(function(querySnapshot) {
      const events = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))
      resolve(events);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

module.exports = dbReadEvents;
