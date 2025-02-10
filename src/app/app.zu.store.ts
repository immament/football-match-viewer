import { create } from "zustand";
import {
  createMatchSlice,
  type MatchSlice,
} from "../features/match/Match.zu.slice";
import {
  createMatchDataSlice,
  type MatchDataSlice,
} from "../features/match/MatchData.slice";
import {
  createMediaPlayerSlice,
  type MediaPlayerSlice,
} from "../features/mediaPlayer/MediaPlayer.slice";
import {
  createMediaPlayer2Slice,
  type MediaPlayer2Slice,
} from "../features/mediaPlayer/MediaPlayer2.slice";
import { type CameraSlice, createCameraSlice } from "./Camera.slice";
import { createStatusSlice, type StatusSlice } from "./StatusSlice";
import { createTeamsSlice, type TeamsSlice } from "./TeamsSlice";

import { immer } from "zustand/middleware/immer";

export type AppStoreState = MediaPlayerSlice &
  MediaPlayer2Slice &
  MatchDataSlice &
  MatchSlice &
  CameraSlice &
  StatusSlice &
  TeamsSlice;

export const useAppZuStore = create<AppStoreState>()(
  immer((...a) => ({
    ...createMediaPlayerSlice(...a),
    ...createMediaPlayer2Slice(...a),
    ...createMatchSlice(...a),
    ...createCameraSlice(...a),
    ...createStatusSlice(...a),
    ...createTeamsSlice(...a),
    ...createMatchDataSlice(...a),
  }))
);
