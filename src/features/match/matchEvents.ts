import { GameEvent } from "./MatchData.model";

export type MatchEventsMap = Record<
  number,
  { events: GameEvent[]; nextEventStep: number }
>;
