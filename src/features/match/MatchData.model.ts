import { PlayerMovement } from "./animations/playerMovement/calculataPlayerMovement";
import { MatchMovement } from "./animations/positions.utils";

export interface MatchData {
  positions: MatchMovement;
  teams: [MatchTeam, MatchTeam];
  eventsMap: MatchEventsMap;
  matchTimes: MatchEvent[];
  commentsMap: MatchCommentsMap;
  status: "offline" | "online";
  currentTime: number;
}
export type TeamColors = {
  text: string;
  shirt: string;
  shorts: string;
  socks: string;
};

export interface MatchTeam {
  id: number;
  teamIdx: TeamIdx;
  name: string;
  squadPlayers: MatchPlayer[];
  substPlayers: MatchSubstPlayer[];
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
  movements?: PlayerMovement;
}

export interface MatchSubstPlayer extends MatchPlayer {
  outPlayerId: string; // @_out
  minute: number; // @_minute
}

export type MatchEventsMap = Record<
  number,
  { events: MatchEvent[]; nextEventStep: number }
>;

export type MatchEventTimeTypes =
  | "gstart"
  | "halftime"
  | "gend"
  | "extratime1"
  | "extratime2"
  | "penalties";

export const MatchEventTimeTypesValues = [
  "gstart",
  "halftime",
  "gend",
  "extratime1",
  "extratime2",
  "penalties",
];

export type MatchEvent = { time: number; timeInSeconds: number } & (
  | { type: MatchEventTimeTypes }
  | { type: "subst"; playerInId: string; playerOutId: string; teamIdx: TeamIdx }
  | GoalMatchEvent
  | { type: "yellow"; teamId: number; playerId: number }
);

export type GoalMatchEvent = {
  type: "goal";
  teamId: number;
  teamIdx: TeamIdx;
  playerId: number;
  homeGoals: number;
  awayGoals: number;
};

export type MatchCommentsMap = Record<number, MatchComment>;

export type MatchComment = {
  time: number;
  displayTime: string;
  step: number;
  text: string;
};
export type TeamIdx = 0 | 1;
