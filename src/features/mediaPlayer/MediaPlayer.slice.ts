import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { secondsToStep } from "../match/animations/positions.utils";
import { formatTime } from "../match/formatTime";

//  & CameraSlice
// & StatusSlice;
export interface MediaPlayerSlice {
  step: number;
  time: number;
  displayTime: string;
  updateStep: (newStep: number) => void;
}

export const createMediaPlayerSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MediaPlayerSlice
> = (set) => ({
  time: 0,
  step: 0,
  displayTime: "00:00",
  updateStep: (matchTimeInSeconds: number) => {
    const newStep = secondsToStep(matchTimeInSeconds);
    set((state) => {
      if (state.step === newStep) return;
      const newTime = Math.floor(newStep / 2);

      state.step = newStep;
      state.time = newTime;
      state.displayTime = formatTime(newTime);
    });
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
