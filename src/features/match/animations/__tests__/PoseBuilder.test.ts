import { beforeEach, describe, expect, test } from "vitest";
import { PlayerDirectionBuilder } from "../PlayerDirectionBuilder";
import { PoseTypes, RawPoseEvents, RawPoseTypes } from "../Pose.model";
import { PoseBuilder } from "../PoseBuilder";
import { PoseBuilderContext } from "../PoseBuilderContext";
import { BallPositionsConfig } from "../positions.utils";

describe("PoseBuilder", () => {
  const times: number[] = [0, 1, 2];
  let playerPositions: Float32Array;
  let ballPositions: BallPositionsConfig;
  let rawPoses: RawPoseEvents;

  beforeEach(() => {
    playerPositions = new Float32Array([0, 0, 0, 1, 0, 1, 2, 0, 2]);
    ballPositions = { px: [0, 3, 9], pz: [0, 3, 9], pHeight: [0, 0, 0] };
    rawPoses = Array(3);
  });

  test("should initialize with default values", () => {
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    expect(builder).toBeInstanceOf(PoseBuilder);
  });

  test("should calculate pose", () => {
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    builder.calculatePose();
    expect(ctx.getPosesResult()[0].type).toBe(PoseTypes.idle);
  });

  test("should create walk pose", () => {
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    ctx.stepIdx = 1;
    builder.calculatePose();
    expect(ctx.getPosesResult()[1].type).toBe(PoseTypes.walk);
  });
  test("should create run pose", () => {
    playerPositions[6] = 5;
    playerPositions[8] = 5;
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    ctx.stepIdx = 1;
    builder.calculatePose();
    expect(ctx.getPosesResult()[1].type).toBe(PoseTypes.run);
  });

  test("should create pass pose", () => {
    rawPoses[1] = "p";
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    ctx.stepIdx = 1;
    //ctx.rawPose = "p";
    builder.calculatePose();
    expect(ctx.getPosesResult()[1].type).toBe(PoseTypes.pass);
  });

  test("should create shot pose", () => {
    rawPoses[1] = "r";
    const ctx = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    const directionBuilder = new PlayerDirectionBuilder(ctx);
    const builder = new PoseBuilder(ctx, directionBuilder);

    ctx.stepIdx = 1;
    builder.calculatePose();
    expect(ctx.getPosesResult()[1].type).toBe(PoseTypes.shot);
  });

  describe("head pose", () => {
    test.each<RawPoseTypes>(["p", "l", "v", "r"])(
      "should create from raw type: '%s'",
      (rawType) => {
        rawPoses[1] = rawType;

        const ctx = new PoseBuilderContext(
          playerPositions,
          ballPositions,
          times,
          rawPoses
        );

        ctx.stepIdx = 1;
        ctx.playerPos.x = ctx.ballPos.x;
        ctx.playerPos.z = ctx.ballPos.z;
        ctx.ballPos.y = 1.5;
        const directionBuilder = new PlayerDirectionBuilder(ctx);
        const builder = new PoseBuilder(ctx, directionBuilder);

        builder.calculatePose();
        expect(ctx.getPosesResult()[1].type).toBe(PoseTypes.head);
      }
    );
  });
});
