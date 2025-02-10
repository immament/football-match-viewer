import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";

export interface MediaPlayer2Slice {
  mediaPlayer: {
    startTime: number;
    duration: number;
    paused: boolean;
    playbackSpeed: number;
    gotoPercent: (percentTime: number) => void;
    tooglePlay: () => void;
    changePlaybackSpeed: (playbackSpeed: number) => void;
  };
}

export const createMediaPlayer2Slice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MediaPlayer2Slice
> = (set) => ({
  mediaPlayer: {
    startTime: 0,
    duration: 0,
    playbackSpeed: 2,
    paused: true,
    gotoPercent: (percentTime: number) => {
      const newPercentTime = Math.min(100, Math.max(0, percentTime));
      set((state) => {
        state.mediaPlayer.startTime =
          (newPercentTime / 100) * state.mediaPlayer.duration;
      });
    },
    tooglePlay: () => {
      set((state) => {
        state.mediaPlayer.paused = !state.mediaPlayer.paused;
      });
    },
    changePlaybackSpeed: (playbackSpeed: number) => {
      set((state) => {
        state.mediaPlayer.playbackSpeed = playbackSpeed;
      });
    },
  },
});
