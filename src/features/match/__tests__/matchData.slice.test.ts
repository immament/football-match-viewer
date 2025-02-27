import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTimeEvent } from "../fsApi/__tests__/matchEventTest.utils";
import { MatchData } from "../MatchData.model";
import { AppStoreState, useAppZuStore } from "/app/app.zu.store";

vi.mock("zustand");

describe("matchData slice", () => {
  let initialState: AppStoreState;
  beforeEach(() => {
    initialState = useAppZuStore.getState();
  });

  it("should matchFetchSuccess add a match to the state", () => {
    const payload = matchDataMock();
    initialState.matchData.matchFetchSuccess(payload);

    const updatedState = useAppZuStore.getState();

    expect(updatedState.matchData.status).toBe("succeeded");
    expect(updatedState.matchData.data).toBeTruthy();
    expect(updatedState.teams.teamsArray[0]).toMatchObject({
      id: 1,
      teamIdx: 0,
      name: "Home team",
      squadPlayers: [],
      goals: 0,
      colors: { shirt: "#FFFFFF", shorts: "", socks: "" },
    });
    expect(updatedState.teams.teamsArray[0].colors.text).not.toBe("#FFFFFF");
    expect(updatedState.teams.teamsArray[1]).toMatchObject({
      id: 2,
      teamIdx: 1,
      name: "Away team",
      squadPlayers: [],
      goals: 0,
      colors: { shirt: "#FF0000", shorts: "", socks: "" },
    });
    expect(updatedState.teams.teamsArray[1].colors.text).not.toBe("#FF0000");
  });

  describe("liveMatch visibleTime", () => {
    it("should visibleTime be equal to regular time", () => {
      const payload = matchDataMock();
      payload.status = "online";
      payload.currentTime = 11 * 60;

      initialState.matchData.matchFetchSuccess(payload);

      const updatedState = useAppZuStore.getState();
      expect(
        updatedState.mediaPlayer.totalDuration,
        "totalDuration 121 minutes"
      ).toBe(121 * 60);
      expect(updatedState.mediaPlayer.duration, "duration 91 minutes").toBe(
        91 * 60
      );
    });

    it("should visibleTime be equal to full time (after penelties)", () => {
      const payload = matchDataMock();
      payload.status = "online";
      payload.currentTime = 95 * 60;

      initialState.matchData.matchFetchSuccess(payload);

      const updatedState = useAppZuStore.getState();
      expect(
        updatedState.mediaPlayer.totalDuration,
        "totalDuration 121 minutes"
      ).toBe(121 * 60);
      expect(updatedState.mediaPlayer.duration, "duration 91 minutes").toBe(
        121 * 60
      );
    });
  });
});

function matchDataMock(): MatchData {
  return {
    teams: [
      {
        id: 1,
        teamIdx: 0,
        name: "Home team",
        squadPlayers: [],
        substPlayers: [],
        colors: { shirt: "FFFFFF", shorts: "", socks: "", text: "FFFFFF" },
      },
      {
        id: 2,
        teamIdx: 1,
        name: "Away team",
        squadPlayers: [],
        substPlayers: [],
        colors: { shirt: "FF0000", shorts: "", socks: "", text: "FF0000" },
      },
    ],
    eventsMap: {
      // [minuteToStep(91)]: {
      //   events: [{ time: 91, type: "extratime1" }],
      //   nextEventStep: minuteToStep(105.833),
      // },
      // [minuteToStep(105.833)]: {
      //   events: [{ time: 105.833, type: "extratime2" }],
      //   nextEventStep: minuteToStep(121.7),
      // },
      // [minuteToStep(121.7)]: {
      //   events: [{ time: 121.7, type: "penalties" }],
      //   nextEventStep: -1,
      // },
    },
    commentsMap: {},
    positions: {
      ball: {
        px: { length: 121 * 60 * 2, slice: () => [0] } as number[],
        pz: { length: 121 * 60 * 2, slice: () => [0] } as number[],
        pHeight: { length: 121 * 60 * 2, slice: () => [0] } as number[],
      },
      players: [],
      poses: [],
    },
    status: "offline",
    currentTime: 0,
    matchTimes: [
      createTimeEvent(45.2, "halftime"),
      createTimeEvent(91, "extratime1"),
      createTimeEvent(105.833, "extratime2"),
      createTimeEvent(121.7, "penalties"),
    ],
  };
}
