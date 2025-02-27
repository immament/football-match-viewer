import { MathUtils, Quaternion, Vector2, Vector3 } from "three";
import { beforeEach, describe, expect, test } from "vitest";
import { PlayerDirectionBuilder } from "../player/PlayerDirectionBuilder";
import { PoseTypes, RawPoseEvents } from "../player/Pose.model";
import { PoseBuilderContext } from "../player/PoseBuilderContext";
import { BallPositionsConfig } from "../positions.utils";

describe("PlayerDirectionBuilder", () => {
  const _angleKeys = [
    0, 45, 60, 61, 90, 119, 120, 135, 180, -45, -60, -61, -90, -119, -120, -135,
  ] as const;
  const DEFAULT_DISTANCE_TO_BALL = 1000;

  type TestPosition = Readonly<{ x: number; z: number }>;
  type TestAngles = (typeof _angleKeys)[number];
  type AngleToPositionMap = Record<number, TestPosition>;

  const angleToPositionMap: AngleToPositionMap = createAngleVectors();

  const playerPositions = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const ballPositions: BallPositionsConfig = {
    px: [0, 0, 0],
    pHeight: [0, 0, 0],
    pz: [1, 1, 1],
  };
  const times: ReadonlyArray<number> = [0, 1, 2];
  const rawPoses: RawPoseEvents = {};

  let context: PoseBuilderContext;

  beforeEach(() => {
    context = new PoseBuilderContext(
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
  });

  test("should initialize with default values", () => {
    const builder = new PlayerDirectionBuilder(context);
    expect(builder).toBeDefined();
  });

  describe.each([0])("calculateDirection on step %i", (stepIdx) => {
    beforeEach(() => {
      context.stepIdx = stepIdx;
    });

    describe.each([
      PoseTypes.idle,
      PoseTypes.head,
      PoseTypes.pass,
      PoseTypes.shot,
    ])("pose type: %s", (poseType) => {
      test.each<{ ballDir: TestAngles }>([
        { ballDir: 0 },
        { ballDir: 45 },
        { ballDir: 90 },
        { ballDir: 135 },
        { ballDir: 180 },
        { ballDir: -135 },
        { ballDir: -90 },
        { ballDir: -45 },
      ])("should look at ball, ballDir: $ballDir", ({ ballDir }) => {
        const expQuaterion = expectedQuaternion(ballDir);

        const playerSpeed = 1;
        context.initPoseRecord(playerSpeed, DEFAULT_DISTANCE_TO_BALL);

        context.pose.type = poseType;
        const ballPos = angleToPosition(ballDir);
        context.ballPos.x = ballPos.x;
        context.ballPos.z = ballPos.z;

        const builder = new PlayerDirectionBuilder(context);
        builder.calculateDirection();

        const result = context.getDirectionsResult();

        expect(context.pose.direction).toBeCloseTo(MathUtils.degToRad(ballDir));
        const dirQuaterion = resultDirQuaternion(result, stepIdx);
        expect(dirQuaterion.angleTo(expQuaterion)).toBeCloseTo(0);
        expect(context.pose.type).toBe(poseType);
      });
    });

    describe.each([PoseTypes.walk])("pose type: %s", (poseType) => {
      test.each<{ moveDir: TestAngles }>([
        { moveDir: 0 },
        { moveDir: 45 },
        { moveDir: 90 },
        { moveDir: 135 },
        { moveDir: 180 },
        { moveDir: -135 },
        { moveDir: -90 },
        { moveDir: -45 },
      ])(
        "should look towards move when speed >= 3, moveDir: {$moveDir}",
        ({ moveDir }) => {
          const expQuaterion = expectedQuaternion(moveDir);

          const playerSpeed = 3;
          context.initPoseRecord(playerSpeed, DEFAULT_DISTANCE_TO_BALL);
          context.pose.type = poseType;
          const playerNextPos = angleToPosition(moveDir);
          context.next.playerPos.x = playerNextPos.x;
          context.next.playerPos.z = playerNextPos.z;

          const builder = new PlayerDirectionBuilder(context);
          builder.calculateDirection();

          const result = context.getDirectionsResult();

          expect(context.pose.direction).toBeCloseTo(
            MathUtils.degToRad(moveDir)
          );
          const dirQuaterion = resultDirQuaternion(result, stepIdx);
          expect(dirQuaterion.angleTo(expQuaterion)).toBeCloseTo(0);
          expect(context.pose.type).toBe(poseType);
        }
      );

      describe.each([0.5, 1, 2.99])("speed %d", (playerSpeed) => {
        test.each<{ moveDir: TestAngles }>([
          { moveDir: 0 },
          { moveDir: 45 },
          { moveDir: 60 },
          { moveDir: -45 },
          { moveDir: -60 },
        ])(
          "should look towards move when speed < 3 and ball is forward (<=60), moveDir: $moveDir",
          ({ moveDir }) => {
            const expQuaterion = expectedQuaternion(moveDir);

            context.initPoseRecord(playerSpeed, DEFAULT_DISTANCE_TO_BALL);
            context.pose.type = poseType;
            const playerNextPos = angleToPosition(moveDir);
            context.next.playerPos.x = playerNextPos.x;
            context.next.playerPos.z = playerNextPos.z;
            context.ballPos.x = 0;
            context.ballPos.z = 1;

            const builder = new PlayerDirectionBuilder(context);
            builder.calculateDirection();

            const result = context.getDirectionsResult();

            expect(MathUtils.radToDeg(context.pose.direction)).toBeCloseTo(
              moveDir
            );
            const dirQuaterion = resultDirQuaternion(result, stepIdx);
            expect(dirQuaterion.angleTo(expQuaterion)).toBeCloseTo(0);
            expect(context.pose.type).toBe(poseType);
          }
        );

        test.each<{ moveDir: TestAngles; expPose: PoseTypes }>([
          { moveDir: 61, expPose: PoseTypes.jogLeft },
          { moveDir: 119, expPose: PoseTypes.jogLeft },
          { moveDir: 120, expPose: walkOrJogBack() },
          { moveDir: 135, expPose: walkOrJogBack() },
          { moveDir: 180, expPose: walkOrJogBack() },
          { moveDir: -135, expPose: walkOrJogBack() },
          { moveDir: -120, expPose: walkOrJogBack() },
          { moveDir: -119, expPose: PoseTypes.jogRight },
          { moveDir: -61, expPose: PoseTypes.jogRight },
        ])(
          "should look at ball & change pose when speed<3 & abs(move & ball angle)>60, moveDir: $moveDir",
          ({ moveDir, expPose }) => {
            const expDir = 0;
            const expQuaterion = expectedQuaternion(expDir);

            context.initPoseRecord(playerSpeed, DEFAULT_DISTANCE_TO_BALL);
            context.pose.type = poseType;
            const playerNextPos = angleToPosition(moveDir);
            context.next.playerPos.x = playerNextPos.x;
            context.next.playerPos.z = playerNextPos.z;
            context.ballPos.x = 0;
            context.ballPos.z = 1;

            const builder = new PlayerDirectionBuilder(context);
            builder.calculateDirection();

            const result = context.getDirectionsResult();

            expect(MathUtils.radToDeg(context.pose.direction)).toBeCloseTo(
              expDir
            );
            const dirQuaterion = resultDirQuaternion(result, stepIdx);
            expect(dirQuaterion.angleTo(expQuaterion)).toBeCloseTo(0);
            expect(context.pose.type).toBe(expPose);
          }
        );

        function walkOrJogBack() {
          return playerSpeed < 1 ? PoseTypes.walkBack : PoseTypes.jogBack;
        }
      });
    });
  });

  // ++ TEST HELPERS +++

  const expectedQuaternion = (function () {
    const _defaultAxis = new Vector3(0, 1, 0);

    return function _expectedQuaternion(direction: number) {
      return new Quaternion().setFromAxisAngle(
        _defaultAxis,
        MathUtils.degToRad(direction)
      );
    };
  })();

  function resultDirQuaternion(result: number[], stepIdx: number) {
    return new Quaternion().fromArray(result, stepIdx * 4);
  }

  function createAngleVectors() {
    return _angleKeys.reduce((acc, angle) => {
      const v = new Vector2(0, 1).rotateAround(
        { x: 0, y: 0 },
        MathUtils.degToRad(-angle)
      );
      acc[angle] = { x: v.x, z: v.y };
      return acc;
    }, {} as AngleToPositionMap);
  }

  function angleToPosition(
    angle: TestAngles
  ): Readonly<{ x: number; z: number }> {
    return angleToPositionMap[angle];
  }
});
