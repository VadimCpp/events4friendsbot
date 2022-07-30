const assert = require('assert');
const { dbReadPinnedMessages, dbWritePinnedMessage } = require("../../src/collections/pinnedMessages");
const db = require("../mocks/db");
const dberror = require("../mocks/dberror");

describe('function dbReadPinnedMessages()', function () {
  it('should get events', async function () {
    const events = await dbReadPinnedMessages(db);
    assert.equal(events.length, 4);
  });
  it('should get error', async function () {
    let catchCount = 0;
    try {
      await dbReadPinnedMessages(dberror);
    }
    catch (error) {
      assert.equal(error, "Some error");
      catchCount++;
    }
    assert.equal(catchCount, 1);
  });
});

describe('function dbWritePinnedMessage()', function () {
  it('should set events', async function () {
    const community = { slug: "events4friends", id: 1, name: "events4friends" };
    let errorOccured = false;
    try {
      await dbWritePinnedMessage(db, 1, community, "2022-07-27");
    }
    catch (error) {
      console.log('error', error);
      errorOccured = true;
    }
    assert.equal(errorOccured, false);
  });
  it('should get error', async function () {
    const community = { slug: "events4friends", id: 1, name: "events4friends" };
    let errorOccured = false;
    try {
      await dbWritePinnedMessage(dberror, 1, community, "2022-07-27");
    }
    catch (error) {
      errorOccured = true;
    }
    assert.equal(errorOccured, true);
  });
});
