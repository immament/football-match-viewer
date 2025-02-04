import { create } from "zustand";
import { formatTime } from "../match/formatTime";

//import { immer } from 'zustand/middleware/immer'

interface MediaPlayerZuState {
  step: number;
  time: number;
  displayTime: string;
  updateStep: (newStep: number) => void;
}

export const useMediaPlayerZuStore = create<MediaPlayerZuState>((set) => ({
  time: 0,
  step: 0,
  displayTime: "00:00",
  updateStep: (matchTime: number) =>
    set((state) => {
      const newStep = Math.floor(matchTime * 2);
      if (state.step === newStep) return state;
      const newTime = Math.floor(newStep / 2);

      return {
        ...state,
        step: newStep,
        time: newTime,
        displayTime: formatTime(newTime),
      };
    }),
}));
