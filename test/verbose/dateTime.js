const assert = require('assert');
const verboseDateTime = require("../../src/verbose/dateTime");

describe('function verboseDateTime()', function () {
  it('should return "Не указано"', function () {
    const event = null;
    assert.equal(verboseDateTime(event), "Не указано");
  });
  it('should return "Не указано"', function () {
    const event = { start: "2022-07-27T12:30:00", timezone: null};
    assert.equal(verboseDateTime(event), "Не указано");
  });
  it('should return "27 июля 12:30 (Клд)"', function () {
    const event = { start: "2022-07-27T12:30:00", timezone: "+0200"};
    assert.equal(verboseDateTime(event), "27 июля 12:30 (Клд)");
  });
  it('should return "25 июля 11:00 (Мск)"', function () {
    const event = { start: "2022-07-25T11:00:00", timezone: "+0300"};
    assert.equal(verboseDateTime(event), "25 июля 11:00 (Мск)");
  });
});
