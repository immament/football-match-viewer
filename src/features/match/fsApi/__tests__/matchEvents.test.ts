import { describe, expect, it } from "vitest";
import { minuteToStep } from "../../animations/positions.utils";
import { GameEvent } from "../../MatchData.model";
import { createEventsMap } from "../footstar.mapper";

describe.skip("create match events map", () => {
  const rawEvents: GameEvent[] = [
    { time: 0, type: "gstart" },
    { time: 1, type: "subst", playerInId: 130093, playerOutId: 1391 },
    { time: 45.19, type: "yellow", teamId: 24, playerId: 130100 },
    { time: 47.99, type: "goal", teamId: 24, playerId: 12 },
    { time: 45.62341, type: "halftime" },
    { time: 90.235, type: "extratime1" },
    { time: 105.833, type: "extratime2" },
    { time: 121.7, type: "penalties" },
  ];

  describe("map with one event", () => {
    it.each(rawEvents)("should create map with $type event", (ev) => {
      const result = createEventsMap([ev]);

      const expected = { [minuteToStep(ev.time)]: { events: [{ ...ev }] } };

      expect(result).toEqual(expected);
    });
  });

  it("should create map with 2 elements", () => {
    const events: GameEvent[] = [
      { time: 45.62341, type: "halftime" },
      { time: 90.235, type: "extratime1" },
    ];
    const result = createEventsMap(events);

    const expected = {
      [minuteToStep(45.62341)]: { events: [{ ...events[0] }] },
      [minuteToStep(90.235)]: { events: [{ ...events[1] }] },
    };

    expect(result).toEqual(expected);
  });

  it("should create map with 2 elements at the same time", () => {
    const events: GameEvent[] = [
      { time: 45.1, type: "yellow", teamId: 1, playerId: 2 },
      { time: 45.101, type: "halftime" },
    ];
    const result = createEventsMap(events);

    const expected = {
      [minuteToStep(45.101)]: { events: [...events.map((ev) => ({ ...ev }))] },
    };

    expect(result).toEqual(expected);
  });

  it("should create map with 2 elements at the same time sorted by time", () => {
    const events: GameEvent[] = [
      { time: 45.101, type: "halftime" },
      { time: 45.1, type: "yellow", teamId: 1, playerId: 2 },
    ];
    const result = createEventsMap(events);

    const expectedEvents = [events[1], events[0]];

    expect(result[minuteToStep(45.101)].events).toEqual(expectedEvents);
  });
});
