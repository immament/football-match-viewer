// match.slice.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppStoreState, useAppZuStore } from "/app/app.zu.store";

vi.mock("zustand");

describe("matchSlice", () => {
  let initialState: AppStoreState;
  beforeEach(() => {
    initialState = useAppZuStore.getState();
  });

  it("should update the step", () => {
    const newTimeInSeconds = 10;
    initialState.matchTimer.updateStep(newTimeInSeconds);
    const updatedState = useAppZuStore.getState();
    expect(updatedState.matchTimer.step).toBe(20);
  });
});
