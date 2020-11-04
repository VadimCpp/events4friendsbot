/**
 * Функция читает из базы список услуг
 * @param {object} db - база данных firestore
 * @param {Function} onSuccess - в параметрах массив услуг
 * @param {Function} onError - в параметрах текст ошибки для пользователя
 */
const dbReadServices = (db, onSuccess, onError) => {
  db.collection("services").get()
  .then(function(querySnapshot) {
      const services = querySnapshot.docs.map(item => ({ ...item.data(), id: item.id }))

      onSuccess(services);
  })
  .catch(function(error) {
    console.warn("Error getting services, skip: ", error);
    onError(
      'Увы, произошла неизвестная ошибка. ' + 
      'Обратитесь пожалуйста в техническую поддержку: @frontendbasics'
    );
  });
}

module.exports = dbReadServices;
