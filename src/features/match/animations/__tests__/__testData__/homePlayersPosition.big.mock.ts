import { PlayerPositions } from "../../positions.utils";

export function getPlayers(): PlayerPositions[] {
  const result = [];
  for(let i = 0; i< 11; i++) {
    result.push(getPlayer(i))
  }
  return result;
}

export function getPlayer(index: number): PlayerPositions {
  return { px: players.hpx[index], pz: players.hpz[index] };
}

type PlayerPositionsConfig = {
  hpx: number[][];
  hpz: number[][];
};

const players: PlayerPositionsConfig = {
  hpx: [
    [3700, 3704, 3710],
    [4400, 4404, 4410],
    [4400, 4404, 4410],
    [4400, 4404, 4410],
    [4400, 4405, 4411],
    [5200, 5204, 5210],
    [5200, 5204, 5210],
    [5200, 5204, 5210],
    [5200, 5204, 5210],
    [6500, 6504, 6510],
    [6500, 6496, 6490]
  ],
  hpz: [
    [4500, 4504, 4510],
    [2800, 2804, 2810],
    [3980, 3984, 3990],
    [5060, 5064, 5059],
    [6240, 6235, 6229],
    [2800, 2804, 2810],
    [3980, 3984, 3990],
    [5060, 5056, 5055],
    [6240, 6236, 6230],
    [2800, 2804, 2810],
    [4520, 4524, 4530]
  ]
};
