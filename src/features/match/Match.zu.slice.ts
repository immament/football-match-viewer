import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";

export interface MatchSlice {
  time: number;
  step: number;
  // displayTime: string;
  lastEventStep: number;
  nextEventStep: number;
}
export const createMatchSlice: StateCreator<
  AppStoreState,
  [],
  [],
  MatchSlice
> = () => ({
  time: 0,
  step: 0,
  lastEventStep: -1,
  nextEventStep: 0,
});
