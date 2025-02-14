import { StateCreator } from "zustand";
import { AppStoreState } from "./app.zu.store";

export interface StatusSlice {
  x?: string;
  // TODO: Probably to move
  // match load status
}

export const createStatusSlice: StateCreator<
  AppStoreState,
  [],
  [],
  StatusSlice
> = () => ({
  error: undefined,
});
