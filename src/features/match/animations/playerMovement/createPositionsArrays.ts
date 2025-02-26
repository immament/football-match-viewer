import { playerLogger } from "../../player.logger";
import { PlayerId } from "../../PlayerId";
import {
  MATCH_TIME_SCALE,
  PlayerPositions,
  xToPitch,
  zToPitch,
} from "../positions.utils";

export function createPositionsArrays(
  { px, pz }: PlayerPositions,
  playerId: PlayerId
): { times: number[]; positions: number[] } {
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
