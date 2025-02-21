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
    matchFetch(matchId: number, srcType: FetchSource): Promise<void>;
    loadMatchFromXml(props: {
      matchId: number;
      matchXml: string;
    }): Promise<void>;
    matchFetchSuccess(matchData: MatchData): void;
    matchFetchError(error: string): void;
    visibleMatchDuration(
      liveTimeInMinutes: number,
      totalDuration: number
    ): number;
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

    matchFetchSuccess: (aMatchData) => {
      logger.info("matchFetchSuccess ++");
      get().teams.initTeams(aMatchData.teams);
      set((state) => {
        state.matchData.status = "succeeded";
        state.matchData.data = aMatchData;
      });

      const times = calculateTimes();
      get().mediaPlayer.init(times, aMatchData.status === "online");

      if (aMatchData.status === "online") {
        get().matchTimer.initLiveMatch(times.startTime);
      }
      logger.info("matchFetchSuccess --");

      function calculateTimes() {
        const totalDuration =
          aMatchData.positions.ball.px.length * MATCH_TIME_SCALE;
        let visibleDuration = totalDuration;
        let startTime: number = 0;

        if (aMatchData.status === "online") {
          startTime = Math.max(
            0,
            Math.min(totalDuration, aMatchData.currentTime)
          );
          visibleDuration = get().matchData.visibleMatchDuration(
            startTime,
            totalDuration
          );
          // totalDuration = aMatchData.currentMinute;
        }
        return { visibleDuration, totalDuration, startTime };
      }
    },
    matchFetchError: (error: string) => {
      set(({ matchData }) => {
        matchData.status = "failed";
        matchData.error = error;
      });
    },
    matchFetch: async (matchId: number, srcType: FetchSource) => {
      if (typeof matchId !== "number") return;
      if (get().matchData.status !== "idle") return;
      set(({ matchData }) => {
        matchData.status = "pending";
      });

      if (DEBUG_MATCHES_IDS.includes(matchId)) srcType = "local";

      try {
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
      logger.info("loadMatchFromXml", { matchId });
      if (get().matchData.status !== "idle") return;
      set(({ matchData }) => {
        matchData.status = "pending";
      });

      try {
        const fsMatch = parseFsXml(matchXml);
        fsMatch.matchId = matchId;
        const matchData = mapFsMatch(fsMatch);
        // if (matchData.status === "offline") {
        get().matchData.matchFetchSuccess(matchData);
        // } else {
        //   logger.error("loadMatchFromXml error:", "live matches not supported");
        // }
      } catch (error) {
        logger.error("loadMatchFromXml error:", error);
        get().matchData.matchFetchError(String(error));
      }
    },
    visibleMatchDuration(
      liveTimeInSeconds: number,
      totalDuration: number
    ): number {
      const validEvents = ["extratime1"];
      if (!this.data) return 0;
      const duration = totalDuration;
      const nextTimeEvent = this.data.matchTimes.reduce((acc, c) => {
        const result =
          validEvents.includes(c.type) &&
          c.timeInSeconds > liveTimeInSeconds &&
          c.timeInSeconds < acc
            ? c.timeInSeconds
            : acc;

        return result;
      }, totalDuration);
      if (nextTimeEvent > 0) return Math.min(duration, nextTimeEvent);
      return duration;
    },
  },
});
