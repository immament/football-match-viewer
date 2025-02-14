import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { MATCH_TIME_SCALE } from "./animations/positions.utils";
import {
  fetchFootstarMatchData,
  FetchSource,
  parseFsXml,
} from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import { MatchData } from "./MatchData.model";
import { logger } from "/app/logger";

export interface MatchDataSlice {
  matchData: {
    status: "idle" | "pending" | "succeeded" | "failed";
    error?: string;
    data?: Readonly<MatchData>;
    matchFetch(matchId: number): Promise<void>;
    loadMatchFromXml(props: {
      matchId: number;
      matchXml: string;
    }): Promise<void>;
    matchFetchSuccess(matchData: MatchData): void;
    matchFetchError(error: string): void;
    visibleMatchDuration(liveTime: number): number;
  };
}

const DEBUG_MATCHES_IDS = [2159688];

export const createMatchDataSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchDataSlice
> = (set, get) => ({
  matchData: {
    status: "idle",

    matchFetchSuccess: (matchData) => {
      get().teams.initTeams(matchData.teams);
      set((state) => {
        state.matchData.status = "succeeded";
        state.matchData.data = matchData;
      });

      let duration = matchData.positions.ball.px.length * MATCH_TIME_SCALE;
      let startTime: number = 0;

      if (matchData.status === "online") {
        startTime = Math.max(
          0,
          Math.min(duration, matchData.currentMinute * 60)
        );
        duration = get().matchData.visibleMatchDuration(startTime);
        duration = matchData.currentMinute;
      }

      set((state) => {
        state.mediaPlayer.duration = duration;
        state.mediaPlayer.startTime = startTime;
      });

      if (startTime > 0) {
        get().matchTimer.updateStep(startTime);
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
        const srcType: FetchSource = DEBUG_MATCHES_IDS.includes(matchId)
          ? "local"
          : "devFs";

        const fsMatch = await fetchFootstarMatchData(matchId, srcType);
        const matchData = mapFsMatch(fsMatch);
        get().matchData.matchFetchSuccess(matchData);
      } catch (error) {
        logger.error("matchFetch error:", error);
        get().matchData.matchFetchError(String(error));
      }
    },
    loadMatchFromXml: async ({
      matchId,
      matchXml,
    }: {
      matchId: number;
      matchXml: string;
    }) => {
      if (get().matchData.status !== "idle") return;
      set(({ matchData }) => {
        matchData.status = "pending";
      });

      try {
        const fsMatch = parseFsXml(matchXml);
        fsMatch.matchId = matchId;
        const matchData = mapFsMatch(fsMatch);
        get().matchData.matchFetchSuccess(matchData);
      } catch (error) {
        logger.error("loadMatchFromXml error:", error);
        get().matchData.matchFetchError(String(error));
      }
    },
    visibleMatchDuration(_liveTime: number): number {
      if (!this.data) return 0;
      const duration = this.data?.positions.ball.px.length * MATCH_TIME_SCALE;
      // const nextTimeEvent = this.data.matchTimes.reduce((acc, c) => {
      //   if (c.time < liveTime && c.time > acc) return c.time;
      //   return acc;
      // }, 0);
      // if (nextTimeEvent > 0) return Math.min(duration, nextTimeEvent);
      return duration;
    },
  },
});
