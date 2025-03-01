import type { StateCreator } from "zustand";
import type { AppStoreState } from "../../app/app.zu.store";
import { MatchBestMoment } from "../match/MatchData.model";

export type DisplayMoments = "best" | "all" | "goals";

export interface MediaPlayerSlice {
  debug: {
    isDebug: boolean;
    liveTime?: number;
  };
  mediaPlayer: {
    // in seconds
    startTime: number;
    // in seconds
    duration: number;
    totalDuration: number;
    paused: boolean;
    playbackSpeed: number;
    commentsVisible: boolean;
    mediaPlayerContainerId: string;
    displayMoments: DisplayMoments;
    currentMoment?: MatchBestMoment;
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
    moveTime(deltaSeconds: number): void;
    gotoTime(timeInSeconds: number): void;
    tooglePlay(): void;
    toogleComments(): void;
    pause(): void;
    changePlaybackSpeed(playbackSpeed: number): void;
    changeDisplayMoments(value: DisplayMoments): void;
  };
}

export const createMediaPlayerSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MediaPlayerSlice
> = (set, get) => ({
  debug: {
    isDebug: false,
  },
  mediaPlayer: {
    startTime: 0,
    duration: 0,
    totalDuration: 0,
    playbackSpeed: 2,
    paused: true,
    commentsVisible: true,
    mediaPlayerContainerId: "root",
    displayMoments: "all",
    // actions
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
    moveTime(deltaSeconds: number): void {
      get().mediaPlayer.gotoTime(get().mediaPlayer.startTime + deltaSeconds);
    },
    gotoTime: (timeInSeconds: number) => {
      set(({ mediaPlayer, matchTimer }) => {
        let newTime = Math.min(
          mediaPlayer.duration,
          Math.max(0, timeInSeconds)
        );

        if (matchTimer.liveMatch && matchTimer.liveMatch.liveTime < newTime) {
          newTime = matchTimer.liveMatch.liveTime;
        }
        mediaPlayer.startTime = newTime;
        matchTimer.time = newTime;
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
    changeDisplayMoments: function (value: DisplayMoments): void {
      set(({ mediaPlayer }) => {
        mediaPlayer.displayMoments = value;
      });
    },
  },
});
