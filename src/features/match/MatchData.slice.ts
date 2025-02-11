import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { fetchFootstarMatchData } from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import { MatchData, MatchTeam } from "./MatchData.model";
import { fixSimilarColors } from "./validateColors";
import { TeamState } from "/app/TeamsSlice";

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
      const teams = {
        homeTeam: mapTeam(matchData.homeTeam),
        awayTeam: mapTeam(matchData.awayTeam),
      };

      fixSimilarColors(teams);

      // TODO
      const duration = 90 * 60;

      set((state) => {
        state.matchData.status = "succeeded";
        state.matchData.data = matchData;
        state.mediaPlayer.duration = duration;
        state.teams = teams;
      });

      function mapTeam(team: MatchTeam): TeamState {
        return { ...team, goals: 0 };
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
        get().matchData.matchFetchSuccess(matchData);
      } catch (error) {
        get().matchData.matchFetchError(String(error));
      }
    },
  },
});
