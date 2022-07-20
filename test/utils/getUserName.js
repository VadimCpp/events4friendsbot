const assert = require('assert');
const getUserName = require("../../src/utils/getUserName");

describe('function getUserName()', function () {
  it('should return "Vadym Kaninskyi"', function () {
    const msg = {"from": {"first_name": "Vadym", "last_name": "Kaninskyi", "username": "vadimcpp"}};
    assert.equal(getUserName(msg), "Vadym Kaninskyi");
  });
  it('should return "Vadym"', function () {
    const msg = {"from": {"first_name": "Vadym", "last_name": "", "username": "vadimcpp"}};
    assert.equal(getUserName(msg), "Vadym");
  });
  it('should return "vadimcpp"', function () {
    const msg = {"from": {"first_name": "", "last_name": "", "username": "vadimcpp"}};
    assert.equal(getUserName(msg), "vadimcpp");
  });
  it('should return "Без имени 👤"', function () {
    const msg = {"from": {"first_name": "", "last_name": "", "username": ""}};
    assert.equal(getUserName(msg), "Без имени 👤");
  });
});
