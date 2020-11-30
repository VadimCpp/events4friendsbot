/**
 * Функция возвращает объект коллекции "Идентификаторы закрепленных сообщений":
 * https://github.com/VadimCpp/events4friends-firestore#%D0%B8%D0%B4%D0%B5%D0%BD%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%D0%BE%D1%80%D1%8B-%D0%B7%D0%B0%D0%BA%D1%80%D0%B5%D0%BF%D0%BB%D0%B5%D0%BD%D0%BD%D1%8B%D1%85-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9
 * 
 * @param {object} pinnedMessages - массив структур, содержащих информацию о закрепленном сообщении
 * @param {numbe} communityId - идентификатор сообщества для которого осуществляется поиск
 * @returns найденный объект или null
 * 
 * Пример:
 * [{"chatName":"events4friends","date":null,"pinnedMessageId":null,"communityId":1,"id":"test"}]
 */
const getPinnedMessage = (pinnedMessages, communityId) => {
  if (pinnedMessages && pinnedMessages.length) {
    for (let i = 0; i < pinnedMessages.length; i++) {
      const pinnedMessage = pinnedMessages[i];
      //
      // NOTE!
      // В тестовых целях возвращаем первую и единственную запись.
      //
      // if (pinnedMessage.communityId === communityId) {
        return pinnedMessage;
      // }
    }
  }

  return null;
}

module.exports = getPinnedMessage;
