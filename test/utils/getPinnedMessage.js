const assert = require('assert');
const getPinnedMessage = require("../../src/utils/getPinnedMessage");

describe('function getPinnedMessage()', function () {
  let pm1, pm2, pinnedMessages;
  before(() => {
    pm1 = { "chatName": "events4friends", "communityId": "1" }
    pm2 = { "chatName": "travaeducation", "communityId": "2" }
    pinnedMessages = [ pm1, pm2 ];
  });
  it('should return an object', function () {
    assert.equal(getPinnedMessage(pinnedMessages, "1"), pm1);
    assert.equal(getPinnedMessage(pinnedMessages, 1), pm1);
    assert.equal(getPinnedMessage(pinnedMessages, "2"), pm2);
    assert.equal(getPinnedMessage(pinnedMessages, 2), pm2);
  });
  it('should return null', function () {
    assert.equal(getPinnedMessage(pinnedMessages, "100500"), null);
    assert.equal(getPinnedMessage(pinnedMessages, 100500), null);
    assert.equal(getPinnedMessage(null, "1"), null);
    assert.equal(getPinnedMessage([], "1"), null);
  });
});
