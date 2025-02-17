// match.slice.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppStoreState, useAppZuStore } from "/app/app.zu.store";
import { FOLLOW_BALL_IDX } from "/app/Camera.slice";

vi.mock("zustand");

describe("matchSlice", () => {
  let initialState: AppStoreState;
  beforeEach(() => {
    initialState = useAppZuStore.getState();
  });

  it("should return the initial state", () => {
    expect(initialState.camera).toMatchObject({
      followedObjectId: FOLLOW_BALL_IDX,
      viewFromObject: false,
    });
  });

  it("should change followed object", () => {
    const newObjectId = 10;

    initialState.camera.changeFollowedObjectId(newObjectId);

    expect(useAppZuStore.getState().camera.followedObjectId).toBe(10);
  });
  it("should change view from object", () => {
    initialState.camera.changeViewFromObject(true);

    expect(useAppZuStore.getState().camera.viewFromObject).toBe(true);

    useAppZuStore.getState().camera.changeViewFromObject(false);

    expect(useAppZuStore.getState().camera.viewFromObject).toBe(false);
  });
});
