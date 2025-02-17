import { MatchEventTimeTypes } from "../../MatchData.model";

export function createTimeEvent(minute: number, type: MatchEventTimeTypes) {
  return { time: minute, timeInSeconds: minute * 60, type: type };
}

export function createTimeEventObj({
  time,
  type,
}: {
  time: number;
  type: MatchEventTimeTypes;
}) {
  return createTimeEvent(time, type);
}
