// match.slice.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  changeFollowedObjectId,
  changePlaybackSpeed,
  changeViewFromObject,
  fetchMatchById,
  FOLLOW_BALL_IDX,
  getInitialState,
  gotoPercent,
  matchSlice,
  MatchSliceState,
  updateStep,
} from "../match.slice";
import { MatchData } from "../MatchData.model";

describe("matchSlice", () => {
  let initialState: MatchSliceState;
  beforeEach(() => {
    initialState = getInitialState();
  });
  describe("Media player", () => {
    it("should return the initial state", () => {
      expect(initialState.status).toBe("idle");
      expect(initialState.mediaPlayer.startTime).toBe(0);
      expect(initialState.mediaPlayer.duration).toBe(0);
      expect(initialState.mediaPlayer.playbackSpeed).toBe(2);
      expect(initialState.mediaPlayer.paused).toBe(true);
    });

    it("should go to percent time", () => {
      initialState.mediaPlayer.duration = 120;
      const percentTime = 10;

      const updatedState = matchSlice.reducer(
        initialState,
        gotoPercent(percentTime)
      );
      expect(updatedState.mediaPlayer.startTime).toBe(12);
    });

    it("should go to end if percent time is greater than 100", () => {
      initialState.mediaPlayer.duration = 50;
      const percentTime = 120;

      const updatedState = matchSlice.reducer(
        initialState,
        gotoPercent(percentTime)
      );
      expect(updatedState.mediaPlayer.startTime).toBe(50);
    });

    it("should go to begining if percent time is lower than 0", () => {
      initialState.mediaPlayer.duration = 50;
      const percentTime = -10;

      const updatedState = matchSlice.reducer(
        initialState,
        gotoPercent(percentTime)
      );
      expect(updatedState.mediaPlayer.startTime).toBe(0);
    });

    it("should change playback speed", () => {
      const newPlaybackSpeed = 10;
      const updatedState = matchSlice.reducer(
        initialState,
        changePlaybackSpeed(newPlaybackSpeed)
      );

      expect(updatedState.mediaPlayer.playbackSpeed).toBe(newPlaybackSpeed);
    });
  });

  describe("camera", () => {
    it("should return the initial state", () => {
      expect(initialState.camera).toMatchObject({
        followedObjectId: FOLLOW_BALL_IDX,
        viewFromObject: false,
      });
    });

    it("should change followed object", () => {
      const newObjectId = 10;
      const updatedState = matchSlice.reducer(
        initialState,
        changeFollowedObjectId(newObjectId)
      );

      expect(updatedState.camera.followedObjectId).toBe(10);
    });
    it("should change view from object", () => {
      let updatedState = matchSlice.reducer(
        initialState,
        changeViewFromObject(true)
      );

      expect(updatedState.camera.viewFromObject).toBe(true);
      updatedState = matchSlice.reducer(
        updatedState,
        changeViewFromObject(false)
      );

      expect(updatedState.camera.viewFromObject).toBe(false);
    });
  });

  describe("fetchMatchById", () => {
    it("should add a match to the state", () => {
      const payload: MatchData = {
        homeTeam: {
          id: 1,
          teamIdx: 0,
          name: "Home team",
          squadPlayers: [],
          colors: { shirt: "FFFFFF", shorts: "", socks: "", text: "FFFFFF" },
        },
        awayTeam: {
          id: 2,
          teamIdx: 1,
          name: "Away team",
          squadPlayers: [],
          colors: { shirt: "FF0000", shorts: "", socks: "", text: "FF0000" },
        },
        eventsMap: {},
        positions: {
          ball: { px: [], pz: [], pHeight: [] },
          players: [],
          poses: [],
        },
      };
      const updatedState = matchSlice.reducer(initialState, {
        type: fetchMatchById.fulfilled.type,
        payload,
      });

      expect(updatedState.status).toBe("succeeded");
      expect(updatedState.matchData).toBeTruthy();
      expect(updatedState.teams.homeTeam).toMatchObject({
        id: 1,
        teamIdx: 0,
        name: "Home team",
        squadPlayers: [],
        goals: 0,
        colors: { shirt: "#FFFFFF", shorts: "", socks: "" },
      });
      expect(updatedState.teams.homeTeam.colors.text).not.toBe("#FFFFFF");
      expect(updatedState.teams.awayTeam).toMatchObject({
        id: 2,
        teamIdx: 1,
        name: "Away team",
        squadPlayers: [],
        goals: 0,
        colors: { shirt: "#FF0000", shorts: "", socks: "" },
      });
      expect(updatedState.teams.awayTeam.colors.text).not.toBe("#FF0000");
    });
  });

  it("should update the step", () => {
    const newStep = 10;
    const updatedState = matchSlice.reducer(initialState, updateStep(newStep));

    expect(updatedState.matchState.step).toBe(newStep);
  });
});
