const assert = require('assert');
const Events4FriendsBotApp = require("../src/Events4FriendsBotApp");
const { PINNED_MESSAGE_DATE_FORMAT } = require("../src/constants");
const dberror = require("./mocks/dberror");
const db = require("./mocks/db");
const boterror = require("./mocks/boterror");
const bot = require("./mocks/bot");
const moment = require("moment");

describe('class Events4FriendsBotApp', function () {
  describe('function sendMessageToChatAndPin', function () {
    let community = {};
    it('should cause error from db', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.sendMessageToChatAndPin(bot, community, dberror);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 1);
    });
    it('should cause error from bot', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.sendMessageToChatAndPin(boterror, community, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 1);
    });
    it('should cause no errors', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.sendMessageToChatAndPin(bot, {}, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  describe('function isToday', function () {
    it('should return false', function () {
      assert.equal(Events4FriendsBotApp.isToday("1950-07-28"), false);
    });
    it('should return true', function () {
      const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
      assert.equal(Events4FriendsBotApp.isToday(today), true);
    });
  });

});
