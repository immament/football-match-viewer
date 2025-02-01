import { RawPoseEvents } from "./Pose.model";

export type BallPositionsConfig = {
  px: number[];
  pz: number[];
  // height
  pHeight: number[];
};

export type PlayerPositions = {
  px: number[];
  pz: number[];
  // without heigh
};

export type PlayerPositionsConfig = {
  hpx: number[][];
  hpz: number[][];
};

export const BALL_RADIUS = 0.2;
export const BALL_OFFSET_Y = BALL_RADIUS;
export const MATCH_TIME_SCALE = 0.5;

const PITCH_SCALE = 61;
const PITCH_OFFSET_X = 6650;
const PITCH_OFFSET_Z = 4500;
const PITCH_SCALE_HEIGHT = PITCH_SCALE / 0.58;
const PITCH_SIDE_MIN_Z = -34.2;
const PITCH_SIDE_MAX_Z = 34.2;

export function xToPitch(x: number): number {
  return (x - PITCH_OFFSET_X) / PITCH_SCALE;
}
export function zToPitch(z: number): number {
  return (z - PITCH_OFFSET_Z) / PITCH_SCALE;
}

export function heightToPitch(height: number): number {
  return height / PITCH_SCALE_HEIGHT;
}
export function ballHeightToPitch(height: number): number {
  let result = height / PITCH_SCALE_HEIGHT;
  if (result > 2) {
    result = (result - 2) / 5 + 2;
  }
  return result;
}
export function distance2D(pos1: Point2, pos2: Point2) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
}

export function onOut(position: Point3) {
  return position.z < PITCH_SIDE_MIN_Z || position.z > PITCH_SIDE_MAX_Z;
}

export function timeToStep(time: number): number {
  return Math.floor(time / MATCH_TIME_SCALE);
}

export interface Point2 {
  get x(): number;
  get z(): number;
}

export interface Point3 extends Point2 {
  get y(): number;
}

/**
 * Calculates the smallest rotation angle between two directions in range (-PI, PI).
 * @returns Angle in radians.
 */
export function rotationAngle(direction: number, newDirection: number): number {
  let angle = direction - newDirection;
  if (Math.abs(angle) > Math.PI) {
    angle = angle % (2 * Math.PI);
  }
  if (angle > Math.PI) {
    return -2 * Math.PI + angle;
  }
  if (angle < -Math.PI) {
    return 2 * Math.PI + angle;
  }

  return angle;
}
export type MatchPositions = {
  ball: BallPositionsConfig;
  players: PlayerPositions[][];
  poses: RawPoseEvents[][];
};
