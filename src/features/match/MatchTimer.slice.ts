import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { secondsToStep } from "./animations/positions.utils";
import { formatTime } from "./formatTime";

export interface MatchTimerSlice {
  matchTimer: {
    step: number;
    time: number;
    displayTime: string;
    updateStep: (newStep: number) => void;
  };
}

export const createMediaPlayerSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchTimerSlice
> = (set) => ({
  matchTimer: {
    time: 0,
    step: 0,
    displayTime: "00:00",
    updateStep: (matchTimeInSeconds: number) => {
      const newStep = secondsToStep(matchTimeInSeconds);
      set(({ matchTimer }) => {
        if (matchTimer.step === newStep) return;
        const newTime = Math.floor(newStep / 2);

        matchTimer.step = newStep;
        matchTimer.time = newTime;
        matchTimer.displayTime = formatTime(newTime);
      });
    },
  },
});

/*

const newStep = action.payload;
const newTime = Math.floor(newStep / 2);

if (match.matchData && match.matchState.nextEventStep !== -1) {
  while (newStep >= match.matchState.nextEventStep) {
    const stepEvents =
      match.matchData.eventsMap[match.matchState.nextEventStep];
    if (stepEvents) {
      stepEvents.events.forEach((ev) => {
        if (ev.type === "goal") {
          const team = selectTeamById({ match }, ev.teamId);
          if (team) {
            // TODO: instead add goals, calculate result during converting events
            team.goals++;
          }
          // const team = selectTeamById({ match: state }, ev.teamId);
        }
      });
      match.matchState.nextEventStep = stepEvents.nextEventStep;
    }
  }
}
match.matchState = {
  ...match.matchState,
  step: newStep,
  time: newTime,
  displayTime: formatTime(newTime),
};
*/
