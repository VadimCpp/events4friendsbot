const assert = require('assert');
const upcomingEvents = require("../../src/verbose/upcomingEvents");

describe('function verboseDateTime()', function () {
  let community;
  let events;
  beforeEach(() => {
    community = { name: "events4friends", id: "1" };
    events = [
      { id: 1, communityId: 1, start: "2050-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: true, location: "Kaliningrad", summary: "Far happy future" },
      { id: 2, communityId: 1, start: "1950-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: true, location: "Kaliningrad", summary: "An old past events" }
    ];
  });
  it('should return "Предстоящих мероприятий нет"', function () {
    assert.equal(upcomingEvents(null, null), "Предстоящих мероприятий нет");
    assert.equal(upcomingEvents(community, null), "Предстоящих мероприятий нет");
    assert.equal(upcomingEvents(null, events), "Предстоящих мероприятий нет");
  });
  it('should return "Предстоящих мероприятий events4friends нет"', function () {
    const community = { name: "events4friends" };
    const events = [];
    assert.equal(upcomingEvents(community, events), "Предстоящих мероприятий events4friends нет");
  });
  it('should filter one event', function () {
    assert.equal(upcomingEvents(community, events).startsWith("Предстоящие мероприятия events4friends"), true);
    assert.equal(upcomingEvents(community, events).includes("Far happy future"), true);
    assert.equal(upcomingEvents(community, events).includes("30 июля 12:00"), true);
  });
  it('should display offline event', function () {
    events = [ ...events,
      { id: 3, communityId: 1, start: "2050-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event" },
    ];
    assert.equal(upcomingEvents(community, events).startsWith("Предстоящие мероприятия events4friends"), true);
    assert.equal(upcomingEvents(community, events).includes("An offline event"), true);
    assert.equal(upcomingEvents(community, events).includes("30 июля 12:00"), true);
    assert.equal(upcomingEvents(community, events).includes("Kaliningrad"), true);
  });
  it('should sort a lit and display events', function () {
    events = [ ...events,
      { id: 3, communityId: 1, start: "2040-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 2" },
      { id: 4, communityId: 1, start: "2060-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 3" },
    ];
    assert.equal(upcomingEvents(community, events).startsWith("Предстоящие мероприятия events4friends"), true);
    assert.equal(upcomingEvents(community, events).includes("An offline event 2"), true);
    assert.equal(upcomingEvents(community, events).includes("30 июля 12:00"), true);
  });
  it('should display upcoming disclaimer', function () {
    events = [ ...events,
      { id: 3, communityId: 1, start: "2053-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 3" },
      { id: 4, communityId: 1, start: "2054-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 4" },
      { id: 5, communityId: 1, start: "2055-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 5" },
      { id: 6, communityId: 1, start: "2056-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 6" },
      { id: 7, communityId: 1, start: "2057-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 7" },
    ];
    assert.equal(upcomingEvents(community, events).includes("1 предстоящее мероприятие"), true);
  });
  it('should display upcoming disclaimer', function () {
    events = [ ...events,
      { id: 3, communityId: 1, start: "2053-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 3" },
      { id: 4, communityId: 1, start: "2054-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 4" },
      { id: 5, communityId: 1, start: "2055-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 5" },
      { id: 6, communityId: 1, start: "2056-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 6" },
      { id: 7, communityId: 1, start: "2057-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 7" },
      { id: 8, communityId: 1, start: "2058-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 8" },
    ];
    assert.equal(upcomingEvents(community, events).includes("2 предстоящих мероприятий"), true);
  });
  it('should filter broken events', function () {
    events = [ ...events,
      { id: 3, start: "2053-07-30T12:00:00", timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 3" },
      { id: 4, communityId: 1, timezone: "+0200", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 4" },
      { id: 5, communityId: 1, start: "2055-07-30T12:00:00", slug: "kgd",
        isOnline: false, location: "Kaliningrad", summary: "An offline event 5" }
    ];
    assert.equal(upcomingEvents(community, events).startsWith("Предстоящие мероприятия events4friends"), true);
  });
});
