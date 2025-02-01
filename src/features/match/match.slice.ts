import { PayloadAction } from "@reduxjs/toolkit";
import { convertFsMatch, fetchFootstarMatchData } from "./fsApi/footstar.api";
import { MatchData } from "./MatchData.model";
import { createAppSlice } from "/app/createAppSlice";
import { createAppAsyncThunk } from "/app/withTypes";

export const FOLLOW_BALL_IDX = 23;

export interface MatchSliceState {
  status: "idle" | "pending" | "succeeded" | "failed";
  error?: string;

  matchData?: MatchDataState;
  mediaPlayer: {
    // time: number;
    // displayTime: string;
    startTime: number;
    duration: number;
    paused: boolean;
    playbackSpeed: number;
  };
  camera: {
    followedObjectId: number;
    viewFromObject: boolean;
  };
  homeTeam: TeamState;
  awayTeam: TeamState;
}

type MatchDataState = MatchData;
interface TeamState {
  name: string;
  goals: number;
}

const initialState: MatchSliceState = {
  status: "idle",
  mediaPlayer: {
    // time: 0,
    // displayTime: formatTime(0),
    startTime: 0,
    duration: 0,
    playbackSpeed: 2,
    paused: true,
  },
  camera: {
    followedObjectId: FOLLOW_BALL_IDX,
    viewFromObject: false,
  },
  // TODO: move to different place
  homeTeam: { name: "-", goals: 0 },
  awayTeam: { name: "-", goals: 0 },
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const matchSlice = createAppSlice({
  name: "match",
  initialState,
  reducers: {
    // mediaPlayer
    gotoPercent: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload <= 100) {
        state.mediaPlayer.startTime =
          action.payload * state.mediaPlayer.duration;
      }
    },
    // updateTime: (state, action: PayloadAction<number>) => {
    //   if (action.payload >= 0 && action.payload <= state.mediaPlayer.duration) {
    //     state.mediaPlayer.time = action.payload;
    //     state.mediaPlayer.displayTime = formatTime(state.mediaPlayer.time);
    //   }
    // },
    tooglePlay: (state) => {
      state.mediaPlayer.paused = !state.mediaPlayer.paused;
    },
    changePlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.mediaPlayer.playbackSpeed = action.payload;
    },
    // camera
    changeFollowedObjectId: (state, action: PayloadAction<number>) => {
      state.camera.followedObjectId = action.payload;
    },
    changeViewFromObject: (state, action: PayloadAction<boolean>) => {
      state.camera.viewFromObject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchById.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.matchData = { ...action.payload };
        state.homeTeam = {
          name: state.matchData.homeTeam.name,
          goals: 0,
        };
        state.awayTeam = {
          name: state.matchData.awayTeam.name,
          goals: 0,
        };
        state.mediaPlayer.duration = 90 * 60;
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown Error";
      });
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectStatus: (match) => match.status,
    selectHomeTeamName: (match) => match.homeTeam.name,
    selectAwayTeamName: (match) => match.awayTeam.name,
    selectHomeGoals: (match) => match.homeTeam.goals,
    selectAwayGoals: (match) => match.awayTeam.goals,
    //
    selectMatchData: (state) => state.matchData,
    // mediaPlayer
    // selectTime: (match) => match.mediaPlayer.time,
    // selectDisplayTime: (match) => match.mediaPlayer.displayTime,
    selectStartTime: (match) => match.mediaPlayer.startTime,
    selectMatchStatus: (match) => match.status,
    selectDuration: (match) => match.mediaPlayer.duration,
    selectPaused: (state) => state.mediaPlayer.paused,
    selectPlaybackSpeed: (state) => state.mediaPlayer.playbackSpeed,
    // camera
    selectFollowedObjectId: (state) => state.camera.followedObjectId,
    selectViewFromObject: (state) => state.camera.viewFromObject,
  },
});

// Action creators are generated for each case reducer function.
export const {
  // mediaPlayer
  gotoPercent,
  tooglePlay,
  changePlaybackSpeed,
  // camera
  changeFollowedObjectId,
  changeViewFromObject,
} = matchSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectStatus,
  selectHomeTeamName,
  selectAwayTeamName,
  selectHomeGoals,
  selectAwayGoals,
  //
  selectMatchData,
  // mediaPlayer
  selectStartTime,
  selectMatchStatus,
  selectDuration,
  selectPaused,
  selectPlaybackSpeed,
  // camera
  selectFollowedObjectId,
  selectViewFromObject,
} = matchSlice.selectors;

export const fetchMatchById = createAppAsyncThunk(
  "match/fetchMatchById",
  async (matchId: number) => {
    const fsMatch = await fetchFootstarMatchData(matchId || 1663808);
    return convertFsMatch(fsMatch);
  },
  {
    condition(matchId, thunkApi) {
      if (typeof matchId !== "number") return false;
      const postsStatus = selectMatchStatus(thunkApi.getState());
      return postsStatus === "idle";
    },
  }
);
