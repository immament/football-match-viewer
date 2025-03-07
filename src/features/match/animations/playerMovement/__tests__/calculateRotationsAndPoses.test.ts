// __tests__/calculateRotationsAndPoses.test.ts

import { describe, expect, it } from "vitest";
import { PlayerId } from "../../../PlayerId";
import { RawPoseEvents } from "../../player/Pose.model";
import { BallPositionsConfig } from "../../positions.utils";
import { calculateRotationsAndPoses } from "../calculateRotationsAndPoses";

describe("calculateRotationsAndPoses", () => {
  const playerId = new PlayerId(0, 1);
  const positions = [0, 0, 1, 0, 0, 1, 0, 0, 1];
  const times: ReadonlyArray<number> = [0, 1, 2];
  const ballPositions: BallPositionsConfig = {
    px: [0, 0, 0],
    pz: [2, 2, 2],
    pHeight: [0, 0, 0],
  };
  const rawPoses: RawPoseEvents = ["p", undefined, undefined];

  it("should return an object with rotateValues and poses arrays", () => {
    const result = calculateRotationsAndPoses(
      positions,
      times,
      playerId,
      ballPositions,
      rawPoses
    );
    expect(result).toHaveProperty("rotateValues");
    expect(result).toHaveProperty("poses");
  });

  it("should throw an error if positions and times arrays have different lengths", () => {
    const invalidPositions = [1, 2, 3, 4, 5];
    expect(() =>
      calculateRotationsAndPoses(
        invalidPositions,
        times,
        playerId,
        ballPositions,
        rawPoses
      )
    ).toThrowError(
      `Wrong array sizes playerPositions.length !== times.length
        [${invalidPositions.length}!==${times.length * 3}]`
    );
  });

  it("should calculate rotateValues array correctly", () => {
    const result = calculateRotationsAndPoses(
      positions,
      times,
      playerId,
      ballPositions,
      rawPoses
    );
    expect(result.rotateValues).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it("should calculate poses array correctly", () => {
    const result = calculateRotationsAndPoses(
      positions,
      times,
      playerId,
      ballPositions,
      rawPoses
    );
    expect(result.poses).toMatchObject([
      { type: "pass", step: 0, rawPose: "p" },
      { type: "walkBack", step: 1, rawPose: undefined },
      { type: "walkBack", step: 2, rawPose: undefined },
    ]);
  });
});
