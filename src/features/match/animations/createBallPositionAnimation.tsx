import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  VectorKeyframeTrack,
} from "three";
import { BallPositionsConfig, MATCH_TIME_SCALE } from "./positions.utils";
import { logger } from "/app/logger";

export function createBallPositionAnimation(
  mixer: AnimationMixer,
  rawPositions: BallPositionsConfig
) {
  const { times, positions } = createPositionsArrays(rawPositions);
  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip(
    "ball.position",
    times[times.length - 1],
    [positionKF]
  );

  const positionAction = mixer.clipAction(positionClip);
  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;

  return { positionAction };
}
// pz => height
function createPositionsArrays({ px, pz, pHeight }: BallPositionsConfig): {
  times: number[];
  positions: number[];
} {
  if (px.length !== pz.length || pHeight.length !== px.length) {
    logger.warn("positions arays have diffrent length!", {
      x_length: px.length,
      z_length: pz.length,
      height_length: pHeight.length,
    });
  }

  const times: number[] = Array(px.length);
  const positions: number[] = Array(px.length * 3);

  for (
    let index = 0, time = 0, positionIndex = 0;
    index < px.length;
    index++, time = index * MATCH_TIME_SCALE, positionIndex = index * 3
  ) {
    times[index] = time;

    positions[positionIndex] = px[index];
    positions[positionIndex + 1] = pHeight[index];
    positions[positionIndex + 2] = pz[index];
  }

  logger.trace("ball positions start:", positions.slice(0, 9), px.slice(0, 3));
  logger.trace("ball positions end:", positions.slice(-9), px.slice(-3));

  logger.trace("ball times length:", times.length);
  logger.trace("ball times start:", times.slice(0, 9));
  logger.trace("ball times end:", times.slice(-9));

  if (times.length * 3 !== positions.length) {
    throw new Error(
      `Ball: Wrong array sizes times.length*3 !== positions.length: ${times.length}, ${positions.length}`
    );
  }
  return { times, positions };
}
