import { PlayerPositions } from "../../positions.utils";

export function getPlayers(): PlayerPositions[] {
  const result = [];
  for(let i = 0; i< 11; i++) {
    result.push(getPlayer(i))
  }
  return result
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
    [9600, 9590, 9583],
    [8900, 8890, 8883],
    [8900, 8890, 8883],
    [8900, 8890, 8883],
    [8500, 8490, 8483],
    [8500, 8489, 8481],
    [8100, 8090, 8083],
    [8100, 8090, 8083],
    [7450, 7439, 7431],
    [6800, 6805, 6805],
    [6650, 6650, 6650]
  ],
  hpz: [
    [4500, 4504, 4510],
    [5420, 5410, 5403],
    [4520, 4524, 4530],
    [3620, 3630, 3637],
    [5060, 5056, 5057],
    [3980, 3991, 3999],
    [4520, 4530, 4537],
    [3620, 3630, 3637],
    [5060, 5056, 5052],
    [5060, 5065, 5065],
    [4500, 4500, 4500]
  ]
};
