import { playerLogger } from "../../player.logger";
import { PlayerId } from "../../PlayerId";
import { PlayerDirectionBuilder } from "../player/PlayerDirectionBuilder";
import { RawPoseEvents } from "../player/Pose.model";
import { PoseBuilder } from "../player/PoseBuilder";
import { PoseBuilderContext } from "../player/PoseBuilderContext";
import { BallPositionsConfig } from "../positions.utils";
import { logger } from "/app/logger";

export function calculateRotationsAndPoses(
  // [x, y, z, x, y, z, ...]
  positions: number[],
  times: ReadonlyArray<number>,
  playerId: PlayerId,
  ballPositions: BallPositionsConfig,
  rawPoses: RawPoseEvents
) {
  return createRotateActionInternal(
    positions,
    times,
    rawPoses,
    ballPositions,
    playerId
  );
}

function createRotateActionInternal(
  positions: number[],
  times: ReadonlyArray<number>,
  rawPoses: RawPoseEvents,
  ballPositions: BallPositionsConfig,
  playerId: PlayerId
) {
  const { rotateValues, poses } = buildSteps(
    positions,
    rawPoses,
    ballPositions
  );
  if (logger.getLevel() == 0) {
    traceResult();
  }

  return { rotateValues, poses };

  // ++ internal +++

  function buildSteps(
    positions: number[],
    rawPoses: RawPoseEvents,
    ballPositions: BallPositionsConfig
  ) {
    // const times = Array.from(positionKF.times);
    const ctx = new PoseBuilderContext(
      positions,
      ballPositions,
      times,
      rawPoses
    );

    const rotationBuilder = new PlayerDirectionBuilder(ctx);
    const poseBuilder = new PoseBuilder(ctx, rotationBuilder);

    for (ctx.stepIdx = 0; ctx.stepIdx < times.length - 1; ctx.stepIdx++) {
      poseBuilder.calculatePose();
    }

    return {
      times,
      rotateValues: ctx.getDirectionsResult(),
      poses: ctx.getPosesResult(),
    };
  }

  function traceResult() {
    if (playerLogger.isActive(playerId)) {
      playerLogger.trace(playerId, "rotations length:", rotateValues.length);
      playerLogger.trace(
        playerId,
        "rotations start:",
        rotateValues.slice(0, 8)
      );
      playerLogger.trace(playerId, "rotations end:", rotateValues.slice(-8));

      playerLogger.trace(playerId, "poses length:", poses.length);
      playerLogger.trace(playerId, "poses start:", poses.slice(0, 3));
      playerLogger.trace(playerId, "poses end:", poses.slice(-3));
    }
  }
}
