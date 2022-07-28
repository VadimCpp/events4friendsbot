const assert = require('assert');
const moment = require('moment');
const { PINNED_MESSAGE_DATE_FORMAT } = require("../../src/constants");
const isToday = require("../../src/utils/isToday");

describe('function isToday', function () {
  it('should return false', function () {
    assert.equal(isToday("1950-07-28"), false);
  });
  it('should return true', function () {
    const today = moment().format(PINNED_MESSAGE_DATE_FORMAT);
    assert.equal(isToday(today), true);
  });
});
