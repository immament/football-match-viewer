import { create } from "zustand";
import { formatTime } from "./formatTime";

//import { immer } from 'zustand/middleware/immer'

interface MediaPlayerZuState {
  time: number;
  displayTime: string;
  updateTime: (newTime: number) => void;
}

export const useMediaPlayerZuStore = create<MediaPlayerZuState>((set) => ({
  time: 0,
  displayTime: "00:00",
  updateTime: (newTime: number) =>
    set((state) => {
      if (state.time !== newTime)
        return { ...state, time: newTime, displayTime: formatTime(newTime) };
      else return state;
    }),
}));
