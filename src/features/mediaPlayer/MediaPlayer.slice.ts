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
    // actions
    init(
      props: {
        startTime: number;
        visibleDuration: number;
        totalDuration: number;
      },
      isOnline: boolean
    ): void;
    gotoPercent(percentTime: number): void;
    tooglePlay(): void;
    toogleComments(): void;
    pause(): void;
    changePlaybackSpeed(playbackSpeed: number): void;
  };
}

export const createMediaPlayerSlice: StateCreator<
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
    init({ startTime, visibleDuration, totalDuration }, isOnline): void {
      set(({ mediaPlayer }) => {
        mediaPlayer.duration = visibleDuration;
        mediaPlayer.totalDuration = totalDuration;
        mediaPlayer.startTime = startTime;
        mediaPlayer.playbackSpeed = isOnline ? 1 : 2;
      });
    },
    gotoPercent: (percentTime: number) => {
      const newPercentTime = Math.min(100, Math.max(0, percentTime));
      set(({ mediaPlayer, matchTimer }) => {
        let newTime = (newPercentTime / 100) * mediaPlayer.duration;
        if (matchTimer.liveMatch && matchTimer.liveMatch.liveTime < newTime) {
          newTime = matchTimer.liveMatch.liveTime;
        }
        mediaPlayer.startTime = newTime;
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
