import type { StateCreator } from "zustand";
import type { AppStoreState } from "../../app/app.zu.store";

export interface MediaPlayerSlice {
  mediaPlayer: {
    // in seconds
    startTime: number;
    // in seconds
    duration: number;
    totalDuration: number;
    paused: boolean;
    playbackSpeed: number;
    commentsVisible: boolean;
    init({
      startTime,
      visibleDuration,
      totalDuration,
    }: {
      startTime: number;
      visibleDuration: number;
      totalDuration: number;
    }): void;
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
    totalDuration: 0,
    playbackSpeed: 2,
    paused: true,
    commentsVisible: true,
    init({
      startTime,
      visibleDuration,
      totalDuration,
    }: {
      startTime: number;
      visibleDuration: number;
      totalDuration: number;
    }): void {
      set(({ mediaPlayer }) => {
        mediaPlayer.duration = visibleDuration;
        mediaPlayer.totalDuration = totalDuration;
        mediaPlayer.startTime = startTime;
      });
    },
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
