import { RawPoseEvents, RawPoseTypes } from "../animations/player/Pose.model";
import {
  BALL_OFFSET_Y,
  ballHeightToPitch,
  MatchMovement,
  PlayerPositions,
  xToPitch,
  zToPitch,
} from "../animations/positions.utils";
import { FsPositionParser } from "./FsPositionParser";
import {
  FootstarMatchData,
  FsGameDataRecord,
  FsGameDataRecord as GameDataPositions,
} from "./footstar.api.model";

export type FsTeamKeys = "c" | "f";
export type FsPlayerIdx = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
const PLAYER_IDXS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type FsBallPositionDimension = "x" | "y" | "z";
type FsPlayerPositionDimension = "x" | "y";

export function mapMovement(fsMatch: FootstarMatchData): MatchMovement {
  const gameData = fsMatch.game_data.j;

  const positions: MatchMovement = {
    ball: {
      px: convertBallPositions(gameData, "x").map((v) => xToPitch(v)),
      pz: convertBallPositions(gameData, "y").map((v) => zToPitch(v)),
      pHeight: convertBallPositions(gameData, "z").map(
        (h) => ballHeightToPitch(h) + BALL_OFFSET_Y
      ),
    },
    players: [
      convertPlayersPositions(gameData, "c"),
      convertPlayersPositions(gameData, "f"),
    ],
    poses: convertPoses(gameData),
  };
  return positions;
}

export function convertBallPositions(
  gameData: GameDataPositions[],
  dimension: FsBallPositionDimension
) {
  const result = convertToPositions(gameData, `_${dimension}b`);
  return result;
}

export function convertPlayerPositions(
  gameData: GameDataPositions[],
  team: FsTeamKeys,
  player: FsPlayerIdx,
  dimension: FsPlayerPositionDimension
) {
  const result = convertToPositions(gameData, `_${dimension}${player}${team}`);
  return result;
}

function convertToPositions(
  gameData: GameDataPositions[],
  type: keyof GameDataPositions
) {
  const parser = new FsPositionParser();

  gameData.forEach((record) => {
    for (const item of record[type]) {
      parser.parse(item);
    }
  });

  parser.end();
  return parser.getResult();
}

function convertPlayersPositions(
  gameData: GameDataPositions[],
  team: FsTeamKeys
): PlayerPositions[] {
  return PLAYER_IDXS.map((idx) => ({
    px: convertPlayerPositions(gameData, team, idx, "x"),
    pz: convertPlayerPositions(gameData, team, idx, "y"),
  }));
}

export function convertPoses(gameData: FsGameDataRecord[]): RawPoseEvents[][] {
  return convertPosesWithSounds(getPosesStr()).poses;

  function getPosesStr(): string {
    return gameData.map((v) => v._tt).join("");
  }

  function convertPosesWithSounds(rawPosesStr: string): {
    arrSounds: Record<number, number>;
    poses: RawPoseEvents[][];
  } {
    const rawPoses = convertPosesPhase1(rawPosesStr);
    const result = {
      arrSounds: {} as Record<number, number>,
      poses: [createPlayersResult(), createPlayersResult()],
    };

    for (let step = 0; step < rawPoses.length; step++) {
      if (rawPoses[step].length > 1) {
        const [pose, player] = rawPoses[step].split("_");

        if (pose !== "n") {
          putResult(Number(player) - 1, step, pose as RawPoseTypes);
        }

        switch (pose) {
          case "p":
          case "l":
          case "w":
            result.arrSounds[step] = 1;
            break;
          case "r":
          case "v":
            result.arrSounds[step] = 2;
            break;
          case "b":
            result.arrSounds[step] = 7;
            break;
          case "s":
            result.arrSounds[step] = 4;
            break;
        }
      }
    }
    return result;

    function putResult(playerIdx: number, time: number, value: RawPoseTypes) {
      if (playerIdx > 10) {
        result.poses[1][playerIdx - 11][time] = value;
        return;
      }
      result.poses[0][playerIdx][time] = value;
      return;
    }
    function createPlayersResult() {
      return PLAYER_IDXS.map(() => ({} as RawPoseEvents));
    }
    // trace("_root.JogadoresCasa[0]: " + _root.JogadoresCasa[0].ac);
  }
}

export function convertPosesPhase1(rawPosesStr: string): string[] {
  const tttArr = rawPosesStr.split("");
  const result: string[] = [];
  let idx = tttArr[0] === "n" ? 1 : 0;
  while (idx < tttArr.length) {
    if (isNumber(tttArr[idx])) {
      let playerIdx = tttArr[idx];
      let digitIdx = idx + 1;
      while (isNumber(tttArr[digitIdx])) {
        playerIdx += tttArr[digitIdx];
        digitIdx++;
      }
      idx = digitIdx - 1;
      result[result.length - 1] += "_" + playerIdx;
    } else {
      result.push(tttArr[idx]);
    }
    idx++;
  }
  return result; //* _root.timeC;

  function isNumber(value: string) {
    return !isNaN(Number(value));
  }
}
