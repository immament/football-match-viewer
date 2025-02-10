import { PayloadAction } from "@reduxjs/toolkit";
import { secondsToStep } from "./animations/positions.utils";
import { formatTime } from "./formatTime";
import { fetchFootstarMatchData } from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import {
  MatchData,
  MatchPlayer,
  MatchTeam,
  TeamColors,
} from "./MatchData.model";
import { fixSimilarColors } from "./validateColors";
import { createAppSlice } from "/app/createAppSlice";
import { logger } from "/app/logger";
import { AppThunk } from "/app/store";
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
    // from zu
  };
  matchState: {
    time: number;
    step: number;
    displayTime: string;
    lastEventStep: number;
    nextEventStep: number;
  };
  camera: {
    followedObjectId: number;
    viewFromObject: boolean;
  };
  teams: { homeTeam: TeamState; awayTeam: TeamState };
}

export type MatchDataState = MatchData;

export interface TeamState {
  id: number;
  teamIdx: 0 | 1;
  name: string;
  goals: number;
  squadPlayers: MatchPlayer[];
  colors: TeamColors;
}

export const getInitialState = (): MatchSliceState => {
  return {
    status: "idle",
    mediaPlayer: {
      startTime: 0,
      duration: 0,
      playbackSpeed: 2,
      paused: true,
    },
    matchState: {
      time: 0,
      step: 0,
      displayTime: "00:00",
      lastEventStep: -1,
      nextEventStep: 0,
    },
    camera: { followedObjectId: FOLLOW_BALL_IDX, viewFromObject: false },
    teams: { homeTeam: emptyTeam(0), awayTeam: emptyTeam(1) },
  };
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const matchSlice = createAppSlice({
  name: "match",
  initialState: getInitialState(),
  reducers: {
    // mediaPlayer

    gotoPercent: (state, action: PayloadAction<number>) => {
      const percentTime = Math.min(100, Math.max(0, action.payload));
      state.mediaPlayer.startTime =
        (percentTime / 100) * state.mediaPlayer.duration;
    },
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
    teamGoal: (state, action: PayloadAction<number>) => {
      const team = matchSlice
        .getSelectors()
        .selectTeamById(state, action.payload);
      if (team) {
        team.goals++;
      }
    },
    // matchState
    updateStep: (match, action: PayloadAction<number>) => {
      const newStep = action.payload;
      const newTime = Math.floor(newStep / 2);

      if (match.matchData && match.matchState.nextEventStep !== -1) {
        while (newStep >= match.matchState.nextEventStep) {
          const stepEvents =
            match.matchData.eventsMap[match.matchState.nextEventStep];
          if (stepEvents) {
            stepEvents.events.forEach((ev) => {
              if (ev.type === "goal") {
                const team = selectTeamById({ match }, ev.teamId);
                if (team) {
                  // TODO: instead add goals, calculate result during converting events
                  team.goals++;
                }
                // const team = selectTeamById({ match: state }, ev.teamId);
              }
            });
            match.matchState.nextEventStep = stepEvents.nextEventStep;
          }
        }
      }
      match.matchState = {
        ...match.matchState,
        step: newStep,
        time: newTime,
        displayTime: formatTime(newTime),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchById.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchMatchById.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        logger.info("matchData:", payload);
        state.matchData = { ...payload };
        // logger.info(
        //   "matchData:",
        //   Object.entries(payload.eventsMap).flatMap(([step, value]) =>
        //     value.events.map((ev) => ({ ...ev, key: step }))
        //   )
        // );
        state.teams = {
          homeTeam: mapTeam(payload.homeTeam),
          awayTeam: mapTeam(payload.awayTeam),
        };

        fixSimilarColors(state.teams);

        // TODO
        state.mediaPlayer.duration = 90 * 60;

        function mapTeam(team: MatchTeam): TeamState {
          return { ...team, goals: 0 };
        }
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown Error";
        logger.warn("fetchMatchById error", action.error);
      });
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectStatus: (match) => match.status,
    // # Teams
    selectTeams: ({ teams }) => teams,
    selectTeamById: (
      { teams: { homeTeam, awayTeam } },
      id: number
    ): TeamState | undefined => {
      if (homeTeam.id === id) return homeTeam;
      if (awayTeam.id === id) return awayTeam;
    },
    // home team
    selectHomeTeam: ({ teams }) => teams.homeTeam,
    selectHomeTeamName: ({ teams }) => teams.homeTeam.name,
    selectHomeGoals: ({ teams }) => teams.homeTeam.goals,
    selectHomeTeamSquadPlayers: (state): MatchPlayer[] =>
      matchSlice.getSelectors().selectHomeTeam(state).squadPlayers,
    // away team
    selectAwayTeam: ({ teams }) => teams.awayTeam,
    selectAwayTeamName: ({ teams }) => teams.awayTeam.name,
    selectAwayGoals: ({ teams }) => teams.awayTeam.goals,
    selectAwayTeamSquadPlayers: ({ teams }) => teams.awayTeam.squadPlayers,

    // matchData
    selectMatchData: (state) => state.matchData,
    // mediaPlayer
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
  // teams
  teamGoal,
  // matchState
  updateStep,
} = matchSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectStatus,
  //# Teams
  selectTeams,
  selectTeamById,
  // home team
  selectHomeTeam,
  selectHomeTeamName,
  selectHomeGoals,
  selectHomeTeamSquadPlayers,
  // away team
  selectAwayTeam,
  selectAwayTeamName,
  selectAwayGoals,
  selectAwayTeamSquadPlayers,
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
    const fsMatch = await fetchFootstarMatchData(matchId);
    return mapFsMatch(fsMatch);
  },
  {
    condition(matchId, thunkApi) {
      if (typeof matchId !== "number") return false;
      const postsStatus = selectMatchStatus(thunkApi.getState());
      return postsStatus === "idle";
    },
  }
);

export const updateMatchStepThunk =
  (matchTimeInSeconds: number): AppThunk<void> =>
  async (dispatch, getState) => {
    const newStep = secondsToStep(matchTimeInSeconds);

    if (getState().match.matchState.step === newStep) return;

    dispatch(updateStep(newStep));
  };

function emptyTeam(teamIdx: 0 | 1): TeamState {
  return {
    id: 0,
    teamIdx,
    name: "-",
    goals: 0,
    squadPlayers: [],
    colors: { shirt: "", shorts: "", socks: "", text: "" },
  };
}
