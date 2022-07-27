const dberror = {
  collection: () => {
    return {
      get: () => {
        throw "Some error";
      },
      doc: () => {
        return {
          set: () => {
            throw "Some error";
          }
        }
      }
    }
  }
};

module.exports = dberror;
