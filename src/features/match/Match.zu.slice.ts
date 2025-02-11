import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";

export interface MatchSlice {
  match: {
    lastEventStep: number;
    nextEventStep: number;
  };
}
export const createMatchSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchSlice
> = () => ({
  match: {
    lastEventStep: -1,
    nextEventStep: 0,
  },
});
