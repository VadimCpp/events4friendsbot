const assert = require('assert');
const moment = require('moment');
const { PINNED_MESSAGE_DATE_FORMAT } = require("../../src/constants");
const moveNextWeek = require("../../src/utils/moveNextWeek");

describe('function moveNextWeek', function () {
  it('should return null', function () {
    assert.equal(moveNextWeek(undefined), null);
    assert.equal(moveNextWeek(""), null);
  });
  it('should return next week', function () {
    assert.equal(moveNextWeek("2019-09-14T11:00:00"), "2019-09-21T11:00:00");
    assert.equal(moveNextWeek("2022-08-01T12:00:00"), "2022-08-08T12:00:00");
    assert.equal(moveNextWeek("2022-07-31T06:30:00"), "2022-08-07T06:30:00");
  });
});
