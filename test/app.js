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
    it('should cause no errors, but no success', async function () {
      let cbCount = 0;
      bot.pinChatMessage = () => false;
      try {
        await Events4FriendsBotApp.sendMessageToChatAndPin(bot, {}, db);
      }
      catch (error) {
        assert.equal(error, "Some error");
        cbCount++;
      }
      assert.equal(cbCount, 0);
      bot.pinChatMessage = () => true;
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
    it('should send unknown notification', async function () {
      const event = { id: 1, summary: "N/A" };
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
    it('should cause no errors, but no community', async function () {
      const msg = { chat: { id: 1 }, text: "/unknown"};
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

  describe('function handleUpdateCommand', function () {
    let backup;
    let cbCount;
    const stub = () => {
      cbCount++;
      return new Promise((resolve) => resolve());
    };

    before(() => {
      cbCount = 0;
      backup = Events4FriendsBotApp.doUpdateCommand;
      Events4FriendsBotApp.doUpdateCommand = stub;
    });
    it('should call doUpdateCommand', async function () {
      Events4FriendsBotApp.handleUpdateCommand({}, { chat: { id: 0 }}, {});
      assert.equal(cbCount, 1);
    });
    after(() => {
      cbCount = 0;
      Events4FriendsBotApp.doUpdateCommand = stub;
    });
  });

  describe('function updatePinnedMessage', function () {
    let backup;
    let cbCount;
    const stub = () => {
      cbCount++;
      return new Promise((resolve) => resolve());
    };

    beforeEach(() => {
      cbCount = 0;
      backup = [ Events4FriendsBotApp.doUpdateCommand, Events4FriendsBotApp.sendUpdateNotification ];
      Events4FriendsBotApp.doUpdateCommand = stub;
      Events4FriendsBotApp.sendUpdateNotification = stub;
    });
    it('should call doUpdateCommand and sendUpdateNotification', async function () {
      Events4FriendsBotApp.updatePinnedMessage();
      assert.equal(cbCount, 2);
    });
    afterEach(() => {
      cbCount = 0;
      [ Events4FriendsBotApp.doUpdateCommand, Events4FriendsBotApp.sendUpdateNotification ] = backup;
    });
  });

  describe('function handleMessage', function () {
    let backup;
    let cbCount;
    const stub = () => {
      cbCount++;
      return new Promise((resolve) => resolve());
    };

    beforeEach(() => {
      cbCount = 0;
      backup = [
        Events4FriendsBotApp.handleStartCommand,
        Events4FriendsBotApp.handleInfoCommand,
        Events4FriendsBotApp.handleUpdateCommand,
        Events4FriendsBotApp.handleDefault,
      ];
      Events4FriendsBotApp.handleStartCommand = stub;
      Events4FriendsBotApp.handleInfoCommand = stub;
      Events4FriendsBotApp.handleUpdateCommand = stub;
      Events4FriendsBotApp.handleDefault = stub;
    });
    it('should call handleStartCommand', async function () {
      Events4FriendsBotApp.handleMessage({ text: '/start', chat: { id: 1}});
      assert.equal(cbCount, 1);
    });
    it('should call handleInfoCommand', async function () {
      Events4FriendsBotApp.handleMessage({ text: '/info', chat: { id: 1}});
      assert.equal(cbCount, 1);
    });
    it('should call handleInfoCommand', async function () {
      Events4FriendsBotApp.handleMessage({ text: '/update', chat: { id: 1}});
      assert.equal(cbCount, 1);
    });
    it('should call handleDefault', async function () {
      Events4FriendsBotApp.handleMessage({ text: 'miau', chat: { id: 1}});
      assert.equal(cbCount, 1);
    });
    it('should not call any methods', async function () {
      Events4FriendsBotApp.handleMessage({ text: 'miau', chat: { id: -100500}});
      assert.equal(cbCount, 0);
    });
    afterEach(() => {
      cbCount = 0;
      [
        Events4FriendsBotApp.handleStartCommand,
        Events4FriendsBotApp.handleInfoCommand,
        Events4FriendsBotApp.handleUpdateCommand,
        Events4FriendsBotApp.handleDefault,
      ] = backup;
    });
  });
});
