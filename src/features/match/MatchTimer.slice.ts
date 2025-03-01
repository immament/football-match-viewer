import { StateCreator } from "zustand";
import { AppStoreState } from "../../app/app.zu.store";
import { secondsToStep } from "./animations/positions.utils";
import { formatTime, formatTimeFromMinutes } from "./formatTime";
import {
  GoalMatchEvent,
  MatchCommentsMap,
  MatchData,
  MatchEvent,
  MatchEventsMap,
} from "./MatchData.model";
import { logger } from "/app/logger";

let _liveInterval: number | undefined;

export interface MatchTimerSlice {
  matchTimer: {
    step: number;
    /** in seconds */
    time: number;
    displayTime: string;
    lastEventStep: number;
    nextEventStep: number;
    lastCommentStep: number;
    liveMatch?: {
      liveTime: number;
      startTime: number;
      // liveTimeOffset: number;
    };
    eventToDisplay?: {
      time: string;
      header: string;
      content: string;
      iconCss: string;
      style: React.CSSProperties;
    };
    commentToDisplay?: {
      displayTime: string;
      content: string;
      step: number;
      // style: React.CSSProperties;
    };
    updateStep: (matchTimeInSeconds: number) => void;
    updateNextEventStep: (newStep: number) => void;
    updateComment: (newStep: number) => void;
    initLiveMatch(liveTime: number): void;
    updateLiveTime(): void;
    checkBestMoments(newTime: number): boolean;
  };
}

export const createMatchTimerSlice: StateCreator<
  AppStoreState,
  [["zustand/immer", never]],
  [],
  MatchTimerSlice
> = (set, get) => ({
  matchTimer: {
    time: 0,
    step: 0,
    displayTime: "00:00",
    lastEventStep: -1,
    nextEventStep: 0,
    lastCommentStep: -1,
    updateStep: (matchTimeInSeconds: number) => {
      const newStep = secondsToStep(matchTimeInSeconds);
      let stepUpdated = false;

      if (get().matchTimer.step === newStep) return;
      if (get().mediaPlayer.displayMoments === "best") {
        if (get().matchTimer.checkBestMoments(matchTimeInSeconds)) return;
      }

      set(({ matchTimer }) => {
        const newDisplayTime = Math.floor(newStep / 2);

        matchTimer.step = newStep;
        matchTimer.time = matchTimeInSeconds;
        matchTimer.displayTime = formatTime(newDisplayTime);
        stepUpdated = true;
      });
      if (stepUpdated) {
        get().matchTimer.updateNextEventStep(newStep);
        if (get().mediaPlayer.commentsVisible)
          get().matchTimer.updateComment(newStep);
      }
    },
    checkBestMoments(newTime: number) {
      const bestMoments = get().matchData.data?.bestMoments;
      if (!bestMoments) return false;
      if (isCurrentMomementOk()) return false;

      const currentMoment = bestMoments.find(
        (m) => m.startTime <= newTime && m.endTime > newTime
      );
      if (currentMoment) {
        set(({ mediaPlayer }) => {
          mediaPlayer.currentMoment = currentMoment;
        });
        return false;
      }
      const liveTime = get().matchTimer.liveMatch?.liveTime;
      const nextMoment = bestMoments.find(
        (m) => m.startTime >= newTime && (!liveTime || m.startTime < liveTime)
      );
      if (nextMoment !== undefined) {
        set(({ mediaPlayer }) => {
          mediaPlayer.currentMoment = nextMoment;
        });
        get().mediaPlayer.gotoTime(nextMoment.startTime);
        return true;
      }
      return false;

      function isCurrentMomementOk() {
        const current = get().mediaPlayer.currentMoment;
        return (
          current && current.startTime <= newTime && current.endTime > newTime
        );
      }
    },
    updateNextEventStep: (newStep: number) => {
      set(({ matchTimer, matchData, teams }) => {
        if (matchData.data) {
          if (newStep < matchTimer.lastEventStep) {
            resetEvents(matchData.data);
          }
          applyNextEvents(matchData.data.eventsMap);
        }
        function resetEvents(data: MatchData) {
          matchTimer.lastEventStep = -1;
          matchTimer.nextEventStep = 0;
          resetTeam(0);
          resetTeam(1);

          function resetTeam(teamIdx: number) {
            teams.teamsArray[teamIdx].goals = 0;
            teams.teamsArray[teamIdx].squadPlayers = [
              ...data.teams[teamIdx].squadPlayers,
            ];
          }
        }
        function applyNextEvents(eventsMap: MatchEventsMap) {
          if (matchTimer.nextEventStep < 0) return;
          while (
            newStep >= matchTimer.nextEventStep &&
            matchTimer.nextEventStep >= 0
          ) {
            const stepEvents = eventsMap[matchTimer.nextEventStep];
            if (stepEvents) {
              stepEvents.events.forEach((ev) => applyEvent(ev));
              matchTimer.lastEventStep = matchTimer.nextEventStep;
              matchTimer.nextEventStep = stepEvents.nextEventStep;
            } else {
              return;
            }
          }
        }
        function applyEvent(ev: MatchEvent) {
          switch (ev.type) {
            case "goal":
              teams.teamsArray[0].goals = ev.homeGoals;
              teams.teamsArray[1].goals = ev.awayGoals;
              if (matchTimer.nextEventStep === newStep) {
                displayGoalEvent(ev);
              }
              return;
            case "subst":
              {
                if (!matchData.data) return;

                const playerIn = matchData.data.teams[
                  ev.teamIdx
                ].substPlayers.find((pl) => pl.id === ev.playerInId);

                if (playerIn) {
                  teams.teamsArray[ev.teamIdx].squadPlayers = teams.teamsArray[
                    ev.teamIdx
                  ].squadPlayers.map((pl) => {
                    if (pl.id !== ev.playerOutId) return pl;
                    playerIn.movements = pl.movements;
                    return playerIn;
                  });
                }
              }
              return;
          }
        }
        function displayGoalEvent(ev: { time: number } & GoalMatchEvent) {
          const team = teams.teamsArray[ev.teamIdx];

          matchTimer.eventToDisplay = {
            time: formatTimeFromMinutes(ev.time),
            header: team.name ?? "unknown team",
            content:
              teams.selectPlayerById(ev.playerId.toString())?.name ??
              "unknown player",
            iconCss: "bx bx-football bx-tada",
            style: {
              backgroundColor: team.colors.shirt,
              color: team.colors.text,
            },
          };
        }
      });
    },
    updateComment: (newStep: number) => {
      set(({ matchTimer, matchData }) => {
        if (matchData.data) {
          if (newStep < matchTimer.lastCommentStep) {
            resetComments();
          }
          applyNextComment(matchData.data.commentsMap);
        }

        function resetComments() {
          matchTimer.lastCommentStep = -1;
        }

        function applyNextComment(comments: MatchCommentsMap) {
          if (!comments[newStep]) return;
          const comment = comments[newStep];
          matchTimer.commentToDisplay = {
            step: newStep,
            content: comment.text,
            displayTime: comment.displayTime,
          };
        }
      });
    },
    initLiveMatch(liveTime: number) {
      if (!(liveTime > 0)) return;
      if (_liveInterval) clearInterval(_liveInterval);

      set(({ matchTimer, mediaPlayer }) => {
        if (liveTime < mediaPlayer.totalDuration) {
          matchTimer.liveMatch = {
            liveTime,
            // liveTimeOffset: liveTime * 1000,
            startTime: Date.now() - liveTime * 1000,
          };
          _liveInterval = setInterval(() => {
            get().matchTimer.updateLiveTime();
          }, 1000);
        }
      });
      get().matchTimer.updateStep(liveTime);
    },
    updateLiveTime() {
      set(({ matchTimer, mediaPlayer }) => {
        const liveMatch = matchTimer.liveMatch;
        if (!liveMatch) {
          logger.info("no live match");
          return;
        }

        liveMatch.liveTime = Math.floor(
          (Date.now() - liveMatch.startTime) / 1000
        );

        if (liveMatch.liveTime >= mediaPlayer.totalDuration) {
          clearInterval(_liveInterval);
          _liveInterval = undefined;
          matchTimer.liveMatch = undefined;
          return;
        }
        if (liveMatch.liveTime >= mediaPlayer.duration) {
          mediaPlayer.duration = mediaPlayer.totalDuration;
        }
      });
    },
  },
});
