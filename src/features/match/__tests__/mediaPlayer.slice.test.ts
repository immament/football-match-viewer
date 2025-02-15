import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppStoreState, useAppZuStore } from "/app/app.zu.store";

vi.mock("zustand");

describe("mediaPlayer slice", () => {
  let initialState: AppStoreState;
  beforeEach(() => {
    initialState = useAppZuStore.getState();
  });

  it("should return the initial state", () => {
    expect(initialState.matchData.status).toBe("idle");
    expect(initialState.mediaPlayer.startTime).toBe(0);
    expect(initialState.mediaPlayer.duration).toBe(0);
    expect(initialState.mediaPlayer.playbackSpeed).toBe(2);
    expect(initialState.mediaPlayer.paused).toBe(true);
  });

  it("should go to percent time", () => {
    initialState.mediaPlayer.duration = 120;
    const percentTime = 10;

    initialState.mediaPlayer.gotoPercent(percentTime);

    expect(useAppZuStore.getState().mediaPlayer.startTime).toBe(12);
  });

  it("should go to end if percent time is greater than 100", () => {
    initialState.mediaPlayer.duration = 50;
    const percentTime = 120;

    initialState.mediaPlayer.gotoPercent(percentTime);

    expect(useAppZuStore.getState().mediaPlayer.startTime).toBe(50);
  });

  it("should go to begining if percent time is lower than 0", () => {
    initialState.mediaPlayer.duration = 50;
    const percentTime = -10;

    initialState.mediaPlayer.gotoPercent(percentTime);

    expect(useAppZuStore.getState().mediaPlayer.startTime).toBe(0);
  });

  it("should change playback speed", () => {
    const newPlaybackSpeed = 10;

    initialState.mediaPlayer.changePlaybackSpeed(newPlaybackSpeed);

    expect(useAppZuStore.getState().mediaPlayer.playbackSpeed).toBe(
      newPlaybackSpeed
    );
  });
});
