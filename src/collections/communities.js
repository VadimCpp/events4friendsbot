/**
 * Функция читает из базы список сообществ
 * @param {object} db - база данных firestore
 * @return {Promise}
 */
const dbReadCommunities = (db) => {
  return db.collection("communities").get()
    .then(function(querySnapshot) {
      return querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }));
    })
}

module.exports = dbReadCommunities;
