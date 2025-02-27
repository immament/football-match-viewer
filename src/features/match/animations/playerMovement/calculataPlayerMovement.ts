import { PlayerId } from "../../PlayerId";
import { PoseRecord } from "../player/PoseAction.model";
import { MatchMovement } from "../positions.utils";
import { calculateRotationsAndPoses } from "./calculateRotationsAndPoses";
import { createPositionsArrays } from "./createPositionsArrays";

export type PlayerMovement = {
  times: number[];
  positions: number[];
  rotateValues: number[];
  poses: PoseRecord[];
};

export function calculataPlayerMovement(
  playerId: PlayerId,
  matchPositions: MatchMovement
): PlayerMovement {
  const playerPositions =
    matchPositions.players[playerId.teamIdx][playerId.playerIdx];
  const { times, positions } = createPositionsArrays(playerPositions, playerId);

  const { rotateValues, poses } = calculateRotationsAndPoses(
    positions,
    times,
    playerId,
    matchPositions.ball,
    matchPositions.poses[playerId.teamIdx][playerId.playerIdx]
  );

  return { times, positions, rotateValues, poses };
}
