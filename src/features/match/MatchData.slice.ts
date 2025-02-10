import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { fetchFootstarMatchData } from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import { MatchData, MatchTeam } from "./MatchData.model";
import { fixSimilarColors } from "./validateColors";
import { TeamState } from "/app/TeamsSlice";

export interface MatchDataSlice {
  status: "idle" | "pending" | "succeeded" | "failed";
  error?: string;
  matchData?: MatchData;
  matchFetch: (matchId: number) => Promise<void>;
  matchFetchSuccess: (matchData: MatchData) => void;
  matchFetchError: (error: string) => void;
}

export const createMatchDataSlice: StateCreator<
  AppStoreState,
  [],
  [],
  MatchDataSlice
> = (set, get) => ({
  status: "idle",

  matchFetchSuccess: (matchData) => {
    const teams = {
      homeTeam: mapTeam(matchData.homeTeam),
      awayTeam: mapTeam(matchData.awayTeam),
    };

    fixSimilarColors(teams);

    // TODO
    const duration = 90 * 60;

    set({
      status: "succeeded",
      matchData,
      teams,
      mediaPlayer: { ...get().mediaPlayer, duration },
    });

    function mapTeam(team: MatchTeam): TeamState {
      return { ...team, goals: 0 };
    }
  },
  matchFetchError: (error: string) => {
    set({ status: "failed", error });
  },
  matchFetch: async (matchId: number) => {
    if (typeof matchId !== "number") return;
    if (get().status !== "idle") return;
    set({ status: "pending" });

    try {
      const fsMatch = await fetchFootstarMatchData(matchId);
      const matchData = mapFsMatch(fsMatch);
      get().matchFetchSuccess(matchData);
    } catch (error) {
      get().matchFetchError(String(error));
    }
  },
});
