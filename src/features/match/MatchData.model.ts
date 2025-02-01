import { MatchPositions } from "./animations/positions.utils";

export interface MatchData {
  positions: MatchPositions;
  homeTeam: Team;
  awayTeam: Team;
}
export interface Team {
  name: string;
}

// export class MatchData {
//   public get homeTeam(): Team {
//     return this._homeTeam;
//   }
//   public get awayTeam(): Team {
//     return this._awayTeam;
//   }
//   public get positions(): MatchPositions {
//     return this._positions;
//   }

//   constructor(
//     private _positions: MatchPositions,
//     private _homeTeam: Team,
//     private _awayTeam: Team
//   ) {}
// }
