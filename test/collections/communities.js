const assert = require('assert');
const dbReadCommunities = require("../../src/collections/communities");
const db = require("../mocks/db");
const dberror = require("../mocks/dberror");

describe('function dbReadCommunities()', function () {
  it('should get events', async function () {
    const events = await dbReadCommunities(db);
    assert.equal(events.length, 3);
  });
  it('should get error', async function () {
    let catchCount = 0;
    try {
      await dbReadCommunities(dberror);
    }
    catch (error) {
      assert.equal(error, "Some error");
      catchCount++;
    }
    assert.equal(catchCount, 1);
  });
});
