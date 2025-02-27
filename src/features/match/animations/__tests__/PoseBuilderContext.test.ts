import { beforeEach, describe, expect, test } from "vitest";
import { RawPoseEvents } from "../player/Pose.model";
import { PoseBuilderContext } from "../player/PoseBuilderContext";
import { BallPositionsConfig } from "../positions.utils";

describe("PoseBuilderContext", () => {
  let playerPositions: number[];
  let ballPositions: BallPositionsConfig;
  let times: ReadonlyArray<number>;
  let rawPoses: RawPoseEvents;
  let context: PoseBuilderContext;

  beforeEach(() => {
    playerPositions = [0, 0, 0, 1, 0, 1];
    ballPositions = { px: [1, 4], pz: [3, 5], pHeight: [2, 6] };
    times = [0, 1];
    rawPoses = ["l", "p"];
  });

  beforeEach(() => {
    context = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
  });

  test("should initialize with default values", () => {
    expect(context.getPosesResult()).length(times.length);
    expect(context.getDirectionsResult()).length(times.length * 4);
  });

  describe("change step index", () => {
    test.each([0, 5, 7, 8])(
      "should set step index to %1 and change prev & next",
      (index) => {
        context.stepIdx = index;
        expect(context.stepIdx).toBe(index);
        expect(context.prev.stepIdx).toBe(index - 1);
        expect(context.next.stepIdx).toBe(index + 1);
      }
    );
  });

  test("should get poses result", () => {
    context.stepIdx = 1;
    const posesResult = context.getPosesResult();

    expect(posesResult.length).toBe(times.length);
  });

  test("should get directions result", () => {
    context.stepIdx = 1;
    const directionsResult = context.getDirectionsResult();
    expect(directionsResult.length).toBe(times.length * 4);
    // expect(rotationResult).toBe(times);
  });
});
