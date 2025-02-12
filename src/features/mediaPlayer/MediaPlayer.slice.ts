import type { StateCreator } from "zustand";
import type { AppStoreState } from "../../app/app.zu.store";

export interface MediaPlayerSlice {
  mediaPlayer: {
    startTime: number;
    duration: number;
    paused: boolean;
    playbackSpeed: number;
    commentsVisible: boolean;
    gotoPercent: (percentTime: number) => void;
    tooglePlay: () => void;
    toogleComments: () => void;
    pause: () => void;
    changePlaybackSpeed: (playbackSpeed: number) => void;
  };
}

export const createMediaPlayer2Slice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MediaPlayerSlice
> = (set, get) => ({
  mediaPlayer: {
    startTime: 0,
    duration: 0,
    playbackSpeed: 2,
    paused: true,
    commentsVisible: true,
    gotoPercent: (percentTime: number) => {
      const newPercentTime = Math.min(100, Math.max(0, percentTime));
      set(({ mediaPlayer }) => {
        mediaPlayer.startTime = (newPercentTime / 100) * mediaPlayer.duration;
      });
      get().matchTimer.updateStep(get().mediaPlayer.startTime);
    },
    tooglePlay: () => {
      set(({ mediaPlayer }) => {
        mediaPlayer.paused = !mediaPlayer.paused;
      });
    },
    pause: () => {
      set(({ mediaPlayer }) => {
        mediaPlayer.paused = true;
      });
    },
    changePlaybackSpeed: (playbackSpeed: number) => {
      set(({ mediaPlayer }) => {
        mediaPlayer.playbackSpeed = playbackSpeed;
      });
    },
    toogleComments: () => {
      set(({ mediaPlayer }) => {
        mediaPlayer.commentsVisible = !mediaPlayer.commentsVisible;
      });
    },
  },
});
