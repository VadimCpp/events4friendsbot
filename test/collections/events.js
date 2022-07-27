const assert = require('assert');
const dbReadEvents = require("../../src/collections/events");
const db = require("../mocks/db");
const dberror = require("../mocks/dberror");

describe('function dbReadEvents()', function () {
  it('should get events', async function () {
    const events = await dbReadEvents(db);
    assert.equal(events.length, 3);
  });
  it('should get error', async function () {
    let catchCount = 0;
    try {
      await dbReadEvents(dberror);
    }
    catch (error) {
      assert.equal(error, "Some error");
      catchCount++;
    }
    assert.equal(catchCount, 1);
  });
});
