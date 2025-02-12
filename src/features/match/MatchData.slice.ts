import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { MATCH_TIME_SCALE } from "./animations/positions.utils";
import { fixSimilarColors } from "./colors/validateColors";
import { fetchFootstarMatchData } from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import { MatchData, MatchTeam } from "./MatchData.model";
import { TeamState } from "/app/teams.slice";

export interface MatchDataSlice {
  matchData: {
    status: "idle" | "pending" | "succeeded" | "failed";
    error?: string;
    data?: Readonly<MatchData>;
    matchFetch: (matchId: number) => Promise<void>;
    matchFetchSuccess: (matchData: MatchData) => void;
    matchFetchError: (error: string) => void;
  };
}

export const createMatchDataSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchDataSlice
> = (set, get) => ({
  matchData: {
    status: "idle",

    matchFetchSuccess: (matchData) => {
      const teams: [TeamState, TeamState] = [
        mapTeamToState(matchData.teams[0]),
        mapTeamToState(matchData.teams[1]),
      ];

      fixSimilarColors(teams);

      const duration = matchData.positions.ball.px.length * MATCH_TIME_SCALE;

      set((state) => {
        state.matchData.status = "succeeded";
        state.matchData.data = matchData;
        state.mediaPlayer.duration = duration;
        state.teams.teamsArray = teams;
      });

      function mapTeamToState(team: MatchTeam): TeamState {
        return {
          teamIdx: team.teamIdx,
          id: team.id,
          name: team.name,
          colors: team.colors,
          squadPlayers: [...team.squadPlayers],
          goals: 0,
        };
      }
    },
    matchFetchError: (error: string) => {
      set(({ matchData }) => {
        matchData.status = "failed";
        matchData.error = error;
      });
    },
    matchFetch: async (matchId: number) => {
      if (typeof matchId !== "number") return;
      if (get().matchData.status !== "idle") return;
      set(({ matchData }) => {
        matchData.status = "pending";
      });

      try {
        const fsMatch = await fetchFootstarMatchData(matchId);
        const matchData = mapFsMatch(fsMatch);
        console.log("matchData", matchData.commentsMap);
        get().matchData.matchFetchSuccess(matchData);
      } catch (error) {
        get().matchData.matchFetchError(String(error));
      }
    },
  },
});
