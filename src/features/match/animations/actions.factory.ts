import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
} from "three";
import { playerLogger } from "../player.logger";
import { PlayerId } from "../PlayerId";
import { PlayerDirectionBuilder } from "./PlayerDirectionBuilder";
import { RawPoseEvents } from "./Pose.model";
import { PoseBuilder } from "./PoseBuilder";
import { PoseBuilderContext } from "./PoseBuilderContext";
import {
  BallPositionsConfig,
  MATCH_TIME_SCALE,
  MatchPositions,
  PlayerPositions,
  xToPitch,
  zToPitch,
} from "./positions.utils";

export function createMoveActions(
  mixer: AnimationMixer,
  playerId: PlayerId,
  matchPositions: MatchPositions
) {
  const { positionAction, positionKF } = createPositionAction(
    mixer,
    playerId,
    matchPositions.players
  );

  const { rotateAction, poses } = createRotateAction(
    mixer,
    positionKF,
    playerId,
    matchPositions.ball,
    matchPositions.poses[playerId.teamIdx][playerId.playerIdx]
  );

  return { positionAction, rotateAction, poses };
}

function createPositionAction(
  mixer: AnimationMixer,
  playerId: PlayerId,
  positionsConfig: PlayerPositions[][]
) {
  const playerPositions = positionsConfig[playerId.teamIdx][playerId.playerIdx];
  const { times, positions } = createPositionsArrays(playerPositions, playerId);

  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip("position", -1, [positionKF]);
  const positionAction = mixer.clipAction(positionClip);

  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;
  return { positionAction, positionKF };
}

function createPositionsArrays(
  { px, pz }: PlayerPositions,
  playerId: PlayerId
) {
  playerLogger.trace(
    playerId,
    `time scale: ${MATCH_TIME_SCALE}, posX_Array.length: ${px.length}`
  );
  if (px.length !== pz.length) {
    throw new Error(
      `Different raw positions array lenghts; px: ${px.length}, pz: ${pz.length}`
    );
  }

  const times: number[] = Array(px.length);
  const positions: number[] = Array(px.length * 3);

  px.forEach((x, index) => {
    times[index] = index * MATCH_TIME_SCALE;
    positions[index * 3] = xToPitch(x);
    positions[index * 3 + 1] = 0;
    positions[index * 3 + 2] = zToPitch(pz[index]);
  });
  fixLastRecords(positions, 3);
  traceResult();

  if (times.length * 3 !== positions.length) {
    throw new Error(
      `Wrong array sizes times.length*3 !== positions.length: ${times.length}, ${positions.length}`
    );
  }

  return { times, positions };

  function fixLastRecords(array: unknown[], count: number) {
    for (let i = array.length - count; i < array.length; i++) {
      playerLogger.trace(playerId, "positions.length", array.length, i);
      array[i] = array[i - count];
    }
  }

  function traceResult() {
    if (playerLogger.isActive(playerId)) {
      playerLogger.trace(
        playerId,
        " positions start:",
        positions.slice(0, 6),
        "/",
        px.slice(0, 3)
      );
      playerLogger.trace(
        playerId,
        " positions end:",
        positions.slice(-6),
        "/",
        px.slice(-3)
      );

      playerLogger.trace(playerId, " times length:", times.length);
      playerLogger.trace(playerId, " times start:", times.slice(0, 3));
      playerLogger.trace(playerId, " times end:", times.slice(-3));
    }
  }
}

function createRotateAction(
  mixer: AnimationMixer,
  positionKF: VectorKeyframeTrack,
  playerId: PlayerId,
  ballPositions: BallPositionsConfig,
  rawPoses: RawPoseEvents
) {
  return createRotateActionInternal(
    mixer,
    positionKF,
    rawPoses,
    // getPlayerPoses(playerId.teamIdx, playerId.playerIdx),
    ballPositions,
    playerId
  );
}

function createRotateActionInternal(
  mixer: AnimationMixer,
  positionKF: VectorKeyframeTrack,
  rawPoses: RawPoseEvents,
  ballPositions: BallPositionsConfig,
  playerId: PlayerId
) {
  const { rotateValues, poses } = buildSteps(
    positionKF,
    rawPoses,
    ballPositions
  );

  const rotateAction = createRotateAnimationAction(
    positionKF.times,
    rotateValues,
    mixer
  );

  traceResult();

  return { rotateAction, poses };

  // ++ internal +++

  function createRotateAnimationAction(
    times: Float32Array,
    rotateValues: number[],
    mixer: AnimationMixer
  ) {
    const rotateKF = new QuaternionKeyframeTrack(
      ".quaternion",
      times,
      rotateValues
    );

    const rotateClip = new AnimationClip("rotate", -1, [rotateKF]);
    const rotateAction = mixer.clipAction(rotateClip);
    rotateAction.loop = LoopOnce;
    rotateAction.clampWhenFinished = true;
    return rotateAction;
  }

  function buildSteps(
    positionKF: VectorKeyframeTrack,
    rawPoses: RawPoseEvents,
    ballPositions: BallPositionsConfig
  ) {
    const times = Array.from(positionKF.times);
    const ctx = new PoseBuilderContext(
      positionKF.values,
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
