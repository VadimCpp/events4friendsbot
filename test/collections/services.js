const assert = require('assert');
const dbReadServices = require("../../src/collections/services");
const db = require("./mock/db");
const dberror = require("./mock/dberror");

describe('function dbReadServices()', function () {
  it('should get services', async function () {
    const services = await dbReadServices(db);
    assert.equal(services.length, 3);
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
