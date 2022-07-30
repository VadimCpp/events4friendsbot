const assert = require('assert');
const Events4FriendsBotApp = require("../src/Events4FriendsBotApp");
const dberror = require("./mocks/dberror");
const db = require("./mocks/db");
const boterror = require("./mocks/boterror");
const bot = require("./mocks/bot");

describe('class Events4FriendsBotApp', function () {
  describe('function doUpdatePinnedMessage', function () {
    let community = { name: "events4friends" };
    let pinnedMessage = {};
    it('should cause error from db', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.doUpdatePinnedMessage(bot, community, pinnedMessage, dberror);
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
        await Events4FriendsBotApp.doUpdatePinnedMessage(boterror, community, pinnedMessage, db);
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
        await Events4FriendsBotApp.doUpdatePinnedMessage(bot, community, pinnedMessage, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  describe('function sendMessageToChatAndPin', function () {
    let community = { name: "events4friends" };
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

  describe('function doUpdateCommand', function () {
    it('should cause error from db', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.doUpdateCommand(bot, "100500", dberror);
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
        await Events4FriendsBotApp.doUpdateCommand(boterror, "100500", db);
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
        await Events4FriendsBotApp.doUpdateCommand(bot, "100500", db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  describe('function sendUpdateNotification', function () {
    it('should send create notification', async function () {
      const event = { create: true, id: 1, summary: "N/A" };
      const userName = "John Doe";
      let cbCount = 0;

      try {
        await Events4FriendsBotApp.sendUpdateNotification(bot, event, userName);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
    it('should send delete notification', async function () {
      const event = { delete: true, id: 1, summary: "N/A" };
      const userName = "John Doe";
      let cbCount = 0;

      try {
        await Events4FriendsBotApp.sendUpdateNotification(bot, event, userName);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
    it('should send edit notification', async function () {
      const event = { edit: true, id: 1, summary: "N/A" };
      const userName = "John Doe";
      let cbCount = 0;

      try {
        await Events4FriendsBotApp.sendUpdateNotification(bot, event, userName);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
    it('should cause exception', async function () {
      const event = { edit: true, id: 1, summary: "N/A" };
      const userName = "John Doe";
      let cbCount = 0;

      try {
        await Events4FriendsBotApp.sendUpdateNotification(boterror, event, userName);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 1);
    });
  });

  describe('function handleStartCommand', function () {
    it('should cause exception', async function () {
      const msg = { chat: { id: 1 } };
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.handleStartCommand(boterror, msg);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 1);
    });
    it('should not cause exception', async function () {
      const msg = { chat: { id: 1 }, from: {} };
      let cbCount = 0;

      try {
        await Events4FriendsBotApp.handleStartCommand(bot, msg);
      }
      catch (error) {
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  describe('function handleInfoCommand', function () {
    const msg = { chat: { id: 1 }};
    it('should cause error from db', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.handleInfoCommand(bot, msg, dberror);
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
        await Events4FriendsBotApp.handleInfoCommand(boterror, msg, db);
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
        await Events4FriendsBotApp.handleInfoCommand(bot, msg, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  describe('function handleDefault', function () {
    const msg = { chat: { id: 1 }, text: "/kld"};
    it('should cause error from db', async function () {
      let cbCount = 0;
      try {
        await Events4FriendsBotApp.handleDefault(bot, msg, dberror);
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
        await Events4FriendsBotApp.handleDefault(boterror, msg, db);
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
        await Events4FriendsBotApp.handleDefault(bot, msg, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
    });
  });

  // updatePinnedMessage - Этот метод вызывается при обновлении анонсов на сайте events4friends.ru
  // handleUpdateCommand - Функция обрабатывает команду пользователя '/update'
  // handleMessage - Main event handler
});
