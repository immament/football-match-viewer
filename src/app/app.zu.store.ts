import { create } from "zustand";
import {
  createMatchDataSlice,
  type MatchDataSlice,
} from "../features/match/MatchData.slice";
import {
  createMediaPlayerSlice,
  type MatchTimerSlice,
} from "../features/match/MatchTimer.slice";
import {
  createMediaPlayer2Slice,
  type MediaPlayerSlice,
} from "../features/mediaPlayer/MediaPlayer.slice";
import { type CameraSlice, createCameraSlice } from "./Camera.slice";
import { createStatusSlice, type StatusSlice } from "./StatusSlice";
import { createTeamsSlice, type TeamsSlice } from "./teams.slice";

import { immer } from "zustand/middleware/immer";

export type AppStoreState = MatchTimerSlice &
  MediaPlayerSlice &
  MatchDataSlice &
  CameraSlice &
  StatusSlice &
  TeamsSlice;

export const useAppZuStore = create<AppStoreState>()(
  immer((...a) => ({
    ...createMediaPlayerSlice(...a),
    ...createMediaPlayer2Slice(...a),
    ...createCameraSlice(...a),
    ...createStatusSlice(...a),
    ...createTeamsSlice(...a),
    ...createMatchDataSlice(...a),
  }))
);
