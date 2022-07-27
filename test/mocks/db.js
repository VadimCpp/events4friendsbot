const db = {
  collection: () => {
    return {
      get: () => {
        const querySnapshot = {
          docs: [
            {
              data: () => [],
              id: "1",
            },
            {
              data: () => [],
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
