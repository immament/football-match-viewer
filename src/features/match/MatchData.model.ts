import { MatchMovement } from "./animations/positions.utils";
import { MatchEventsMap } from "./matchEvents";

export interface MatchData {
  positions: MatchMovement;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  eventsMap: MatchEventsMap;
}
export type TeamColors = {
  text: string;
  shirt: string;
  shorts: string;
  socks: string;
};

export interface MatchTeam {
  id: number;
  name: string;
  squadPlayers: MatchPlayer[];
  colors: TeamColors;
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

export type GameEvent = { time: number } & (
  | {
      type:
        | "gstart"
        | "halftime"
        | "gend"
        | "extratime1"
        | "extratime2"
        | "penalties";
    }
  | {
      type: "subst";
      playerInId: number;
      playerOutId: number;
    }
  | {
      type: "goal" | "yellow";
      teamId: number;
      playerId: number;
    }
);
