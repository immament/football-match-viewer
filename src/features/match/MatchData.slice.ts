import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import {
  analyzeBallDirections,
  BallStates,
  createPositionsArrays,
} from "./animations/ball/createBallPositionAnimation";
import { MATCH_TIME_SCALE } from "./animations/positions.utils";
import {
  fetchFootstarMatchData,
  FetchSource,
  parseFsXml,
} from "./fsApi/footstar.api";
import { mapFsMatch } from "./fsApi/footstar.mapper";
import { MatchData, MatchEvent } from "./MatchData.model";
import { logger } from "/app/logger";

export interface MatchDataSlice {
  matchData: {
    status: "idle" | "pending" | "succeeded" | "failed";
    error?: string;
    data?: Readonly<MatchData>;
    ball?: {
      times: number[];
      positions: number[];
      ballStats?: BallStates;
    };
    matchFetch(matchId: number, srcType: FetchSource): Promise<void>;
    loadMatchFromXml(props: {
      matchId: number;
      matchXml: string;
    }): Promise<void>;
    matchFetchSuccess(matchData: MatchData): void;
    matchFetchError(error: string): void;
    visibleMatchDuration(
      liveTimeInMinutes: number,
      totalDuration: number,
      matchTimes: MatchEvent[]
    ): number;
  };
}

const DEBUG_MATCHES_IDS = [2159688, 2161622];

export const createMatchDataSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchDataSlice
> = (set, get) => ({
  matchData: {
    status: "idle",

    matchFetchSuccess: (aMatchData) => {
      const debugLiveTime =
        aMatchData.status === "offline" ? get().debug.liveTime : undefined;
      if (debugLiveTime) {
        aMatchData.currentTime = debugLiveTime;
        aMatchData.status = "online";
      }
      logger.info("matchFetchSuccess ++");

      get().teams.initTeams(aMatchData.teams, aMatchData.positions);

      set(({ matchData }) => {
        matchData.status = "succeeded";
        matchData.data = aMatchData;
        matchData.ball = ballData();
      });

      const matchTimes = calculateTimes();
      get().mediaPlayer.init(matchTimes, aMatchData.status === "online");

      if (aMatchData.status === "online") {
        get().matchTimer.initLiveMatch(matchTimes.startTime);
      }
      logger.info("matchFetchSuccess --");
      return;

      function ballData(): {
        times: number[];
        positions: number[];
        ballStats: BallStates | undefined;
      } {
        const { positions, times } = createPositionsArrays(
          aMatchData.positions.ball
        );
        let ballStats: BallStates | undefined = undefined;
        if (get().debug.isDebug) {
          ballStats = analyzeBallDirections(aMatchData.positions.ball);
        }
        return { positions, times, ballStats };
      }

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
            totalDuration,
            aMatchData.matchTimes
          );
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
      totalDuration: number,
      matchTimes: MatchEvent[]
    ): number {
      const validEvents = ["extratime1"];
      const duration = totalDuration;

      const nextTimeEvent = matchTimes.reduce((acc, c) => {
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
