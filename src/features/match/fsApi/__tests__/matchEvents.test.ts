import { describe, expect, it } from "vitest";
import { minuteToStep } from "../../animations/positions.utils";
import { MatchEvent } from "../../MatchData.model";
import { createEventsMap } from "../footstar.mapper";
import { createTimeEventObj } from "./matchEventTest.utils";

describe.skip("create match events map", () => {
  const rawEvents: MatchEvent[] = [
    {
      time: 0,
      timeInSeconds: 0,
      type: "gstart",
    },
    {
      time: 1,
      timeInSeconds: 1 * 60,
      type: "subst",
      playerInId: "130093",
      playerOutId: "1391",
      teamIdx: 0,
    },
    {
      time: 45.19,
      timeInSeconds: 45.19 * 60,
      type: "yellow",
      teamId: 24,
      playerId: 130100,
    },
    {
      time: 47.99,
      timeInSeconds: 47.99 * 60,
      type: "goal",
      teamId: 24,
      teamIdx: 0,
      playerId: 12,
      homeGoals: 1,
      awayGoals: 0,
    },
    createTimeEventObj({ time: 45.62341, type: "halftime" }),
    createTimeEventObj({ time: 90.235, type: "extratime1" }),
    createTimeEventObj({ time: 105.833, type: "extratime2" }),
    createTimeEventObj({ time: 121.7, type: "penalties" }),
  ];

  describe("map with one event", () => {
    it.each(rawEvents)("should create map with $type event", (ev) => {
      const result = createEventsMap([ev]);

      const expected = { [minuteToStep(ev.time)]: { events: [{ ...ev }] } };

      expect(result).toEqual(expected);
    });
  });

  it("should create map with 2 elements", () => {
    const events: MatchEvent[] = [
      createTimeEventObj({ time: 45.62341, type: "halftime" }),
      createTimeEventObj({ time: 90.235, type: "extratime1" }),
    ];
    const result = createEventsMap(events);

    const expected = {
      [minuteToStep(45.62341)]: { events: [{ ...events[0] }] },
      [minuteToStep(90.235)]: { events: [{ ...events[1] }] },
    };

    expect(result).toEqual(expected);
  });

  it("should create map with 2 elements at the same time", () => {
    const events: MatchEvent[] = [
      {
        time: 45.1,
        timeInSeconds: 45.1 * 60,
        type: "yellow",
        teamId: 1,
        playerId: 2,
      },
      { time: 45.101, timeInSeconds: 45.101 * 60, type: "halftime" },
    ];
    const result = createEventsMap(events);

    const expected = {
      [minuteToStep(45.101)]: { events: [...events.map((ev) => ({ ...ev }))] },
    };

    expect(result).toEqual(expected);
  });

  it("should create map with 2 elements at the same time sorted by time", () => {
    const events: MatchEvent[] = [
      createTimeEventObj({ time: 45.101, type: "halftime" }),
      {
        time: 45.1,
        timeInSeconds: 45.1 * 60,
        type: "yellow",
        teamId: 1,
        playerId: 2,
      },
    ];
    const result = createEventsMap(events);

    const expectedEvents = [events[1], events[0]];

    expect(result[minuteToStep(45.101)].events).toEqual(expectedEvents);
  });
});
