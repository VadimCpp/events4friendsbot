const boterror = {
  sendMessage: () => {
    throw "Some error";
  },
  pinChatMessage: () => {
    throw "Some error";
  },
  editMessageText: () => {
    throw "Some error";
  },
  unpinChatMessage: () => {
    throw "Some error";
  },
};

module.exports = boterror;
