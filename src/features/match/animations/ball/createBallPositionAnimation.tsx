import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  VectorKeyframeTrack,
} from "three";
import { BallPositionsConfig, MATCH_TIME_SCALE } from "../positions.utils";
import { logger } from "/app/logger";

export type BallState = {
  angle: number;
  dist: number;
  dAngle?: number;
  dDist?: number;
  stop: boolean;
  start: boolean;
};
export type BallStates = (BallState | undefined)[];

export function createBallPositionAction(
  mixer: AnimationMixer,
  times: number[],
  positions: number[]
) {
  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip(
    "ball.position",
    times[times.length - 1],
    [positionKF]
  );

  const positionAction = mixer.clipAction(positionClip);
  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;

  return positionAction;
}

export function analyzeBallDirections(
  rawPositions: BallPositionsConfig
): BallStates {
  // const prev = new Vector2();
  // const current = new Vector2();
  // const next = new Vector2();
  const result: (BallState | undefined)[] = [];
  const p1 = { x: 0, z: 0 };
  const p2 = { x: 0, z: 0 };
  let last = undefined;

  for (let i = 0; i < rawPositions.px.length - 1; i++) {
    p1.x = rawPositions.px[i];
    p1.z = rawPositions.pz[i];
    p2.x = rawPositions.px[i + 1];
    p2.z = rawPositions.pz[i + 1];

    const xDist = p1.x - p2.x;
    const zDist = p1.z - p2.z;
    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
    const angle = (Math.atan2(zDist, xDist) * 180) / Math.PI;
    let dAngle: number | undefined;
    let dDist: number | undefined;
    let stop: boolean = false;
    let start: boolean = false;
    if (last) {
      dAngle = angle - last.angle;
      dDist = dist - last.dist;
      stop = dist < 0.05 && last.dist > 1;
      start = dist > 1 && last.dist < 0.05;
    }
    last = { angle, dist, dAngle, dDist, stop, start };
    result.push(last);
  }
  return result;
}

// function analyze(positions: number[]) {
//   // const prev = new Vector2();
//   // const current = new Vector2();
//   // const next = new Vector2();
//   const angles = [];

//   for (let i = 3; i < positions.length; i += 3) {
//     angles.push(
//       angle2dRaw(
//         positions[i - 3],
//         positions[i - 1],
//         positions[i],
//         positions[i + 2]
//       )
//     );
//   }

//   console.log("ball angles", angles);
// }

// pz => height
export function createPositionsArrays({
  px,
  pz,
  pHeight,
}: BallPositionsConfig): {
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

  if (logger.getLevel() <= logger.levels["TRACE"]) {
    logger.trace(
      "ball positions start:",
      positions.slice(0, 9),
      px.slice(0, 3)
    );
    logger.trace("ball positions end:", positions.slice(-9), px.slice(-3));

    logger.trace("ball times length:", times.length);
    logger.trace("ball times start:", times.slice(0, 9));
    logger.trace("ball times end:", times.slice(-9));
  }

  if (times.length * 3 !== positions.length) {
    throw new Error(
      `Ball: Wrong array sizes times.length*3 !== positions.length: ${times.length}, ${positions.length}`
    );
  }
  return { times, positions };
}
