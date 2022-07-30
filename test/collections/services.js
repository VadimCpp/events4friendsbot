const assert = require('assert');
const dbReadServices = require("../../src/collections/services");
const db = require("../mocks/db");
const dberror = require("../mocks/dberror");

describe('function dbReadServices()', function () {
  it('should get services', async function () {
    const services = await dbReadServices(db);
    assert.equal(services.length, 4);
  });
  it('should get error', async function () {
    let catchCount = 0;
    try {
      await dbReadServices(dberror);
    }
    catch (error) {
      assert.equal(error, "Some error");
      catchCount++;
    }
    assert.equal(catchCount, 1);
  });
});
