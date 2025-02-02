import {
  BALL_OFFSET_Y,
  ballHeightToPitch,
  BallPositionsConfig,
  xToPitch,
  zToPitch,
} from "../../positions.utils";

export function getBallPositions(): BallPositionsConfig {
  return ballPositions;
}

const ballPositionsRaw: BallPositionsConfig = {
  px: [6650, 6794, 6771],
  pz: [4500, 5037, 4952],
  pHeight: [0, 0, 0],
};

const ballPositions: BallPositionsConfig = {
  px: ballPositionsRaw.px.map((x) => xToPitch(x)),
  pz: ballPositionsRaw.pz.map((z) => zToPitch(z)),
  pHeight: ballPositionsRaw.pHeight.map(
    (h) => ballHeightToPitch(h) + BALL_OFFSET_Y
  ),
};
