const assert = require('assert');
const moveNextWeek = require("../../src/utils/moveNextWeek");

describe('function moveNextWeek', function () {
  it('should return null', function () {
    assert.equal(moveNextWeek(undefined), null);
    assert.equal(moveNextWeek(""), null);
  });
  it('should return next week', function () {
    assert.equal(moveNextWeek("2019-09-14T11:00:00"), "2019-09-21T11:00:00");
    assert.equal(moveNextWeek("2022-08-01T13:00:00"), "2022-08-08T13:00:00");
    assert.equal(moveNextWeek("2022-07-31T16:30:00"), "2022-08-07T16:30:00");
  });
});
