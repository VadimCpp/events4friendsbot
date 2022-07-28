const moment = require("moment");
const { PINNED_MESSAGE_DATE_FORMAT } = require("../../src/constants");
const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);

const db = {
  collection: (name) => {
    return {
      get: () => {
        const querySnapshot = {
          docs: [
            {
              data: () => (name === "pinnedMessages" ? {
                pinnedMessageId: 1,
                communityId: 1,
                date: today
              } : {}),
              id: "1",
            },
            {
              data: () => (name === "pinnedMessages" ? {
                pinnedMessageId: 1,
                date: "1950-12-01"
              } : {}),
              id: "2",
            },
            {
              data: () => [],
              id: "3",
            }
          ]
        };
        return new Promise((resolve) => { resolve(querySnapshot); });
      },
      doc: () => {
        return {
          set: () => {
            return new Promise((resolve) => { resolve("Okay"); });
          }
        }
      }
    }
  }
};

module.exports = db;
