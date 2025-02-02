import { MatchMovement } from "./animations/positions.utils";

export interface MatchData {
  positions: MatchMovement;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
}
export interface MatchTeam {
  name: string;
  squadPlayers: MatchPlayer[];
}

export interface MatchPlayer {
  name: string; // #text
  id: string; // @_id
  shirtNumber: string; // @_shirt_number
  rating: number; // @_rating
  hairColor: string; // @_cc
  hairType: string; // @_tc
  skinColor: string; // @_cp
  shoesColor: string; // @_cb
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
