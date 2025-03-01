import { decode } from "he";
import { minuteToStep } from "../animations/positions.utils";
import { formatTimeFromMinutes } from "../formatTime";
import {
  MatchBestMoment,
  MatchComment,
  MatchCommentsMap,
  MatchData,
  MatchEvent,
  MatchEventsMap,
  MatchEventTimeTypesValues,
  MatchPlayer,
  MatchSubstPlayer,
  MatchTeam,
} from "../MatchData.model";
import {
  FootstarMatchData,
  FsBestMoment,
  FsGameComment,
  FsGameEvent,
  FsSquadPlayer,
  FsSubstPlayer,
  FsTeamColors,
} from "./footstar.api.model";
import { mapMovement } from "./footstar.movement.mapper";
import { logger } from "/app/logger";

export function mapFsMatch(fsMatch: FootstarMatchData): MatchData {
  const positions = mapMovement(fsMatch);
  const teams: [MatchTeam, MatchTeam] = [mapHomeTeam(), mapAwayTeam()];
  const matchEvents = mapMatchEvents(fsMatch.game_events.ge, teams);
  const matchTimes = matchEvents.filter((e) =>
    MatchEventTimeTypesValues.includes(e.type)
  );

  return {
    positions,
    teams,
    eventsMap: createEventsMap(matchEvents),
    commentsMap: createCommentsMap(
      mapGameComments(fsMatch.game_info.game_comments.gc)
    ),
    status: fsMatch.game_info.game._status,
    currentTime: Number(fsMatch.game_info.game._minuto) || 0,
    matchTimes,
    bestMoments: mapBestMoments(fsMatch.mm.m),
  };

  function mapHomeTeam(): MatchTeam {
    return {
      id: Number(fsMatch.game_info.home_team_name._id),
      teamIdx: 0,
      name: fsMatch.game_info.home_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.home_starting_eleven.home_player_se
      ),
      substPlayers:
        fsMatch.home_substitutes !== ""
          ? mapSubstPlayers(fsMatch.home_substitutes.home_player_sub)
          : [],
      colors: mapColors(fsMatch.colors.clr, "home"),
    };
  }

  function mapAwayTeam(): MatchTeam {
    return {
      id: Number(fsMatch.game_info.away_team_name._id),
      teamIdx: 1,
      name: fsMatch.game_info.away_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.away_starting_eleven.away_player_se
      ),
      substPlayers:
        fsMatch.away_substitutes !== ""
          ? mapSubstPlayers(fsMatch.away_substitutes.away_player_sub)
          : [],
      colors: mapColors(fsMatch.colors.clr, "away"),
    };
  }

  function mapColors(colors: FsTeamColors[], team: "home" | "away") {
    const teamColors = colors.find((c) => c._id === team);
    if (!teamColors) return defaultColors();
    return {
      text: "#" + teamColors._text,
      shirt: "#" + teamColors._shirt,
      shorts: "#" + teamColors._shorts,
      socks: "#" + teamColors._socks,
    };

    function defaultColors() {
      return team === "home"
        ? {
            text: "#FFFFFF",
            shirt: "#FF0000",
            shorts: "#FFFFFF",
            socks: "#FF0000",
          }
        : {
            text: "#FFFFFF",
            shirt: "#00FF00",
            shorts: "#FFFFFF",
            socks: "#00FF00",
          };
    }
  }
}

export function mapSquadPlayers(players: FsSquadPlayer[]) {
  return players.map(mapSquadPlayer);
}

export function mapSquadPlayer(pl: FsSquadPlayer): MatchPlayer {
  return {
    name: decode(pl.text),
    id: pl._id,
    shirtNumber: pl._shirt_number,
    rating: Number(pl._rating),
    hairColor: "#" + pl._cc,
    hairType: pl._tc,
    skinColor: "#" + pl._cp,
    shoesColor: "#" + pl._cb,
  };
}

export function mapSubstPlayers(players: FsSubstPlayer[]): MatchSubstPlayer[] {
  return players.map(mapSubstPlayer);
}

export function mapSubstPlayer(pl: FsSubstPlayer): MatchSubstPlayer {
  return {
    ...mapSquadPlayer(pl),
    minute: Number(pl._minute),
    outPlayerId: pl._out,
  };
}

export function mapMatchEvents(
  fsEvents: FsGameEvent[],
  teams: [MatchTeam, MatchTeam]
): MatchEvent[] {
  const matchResult = { homeGoals: 0, awayGoals: 0 };

  return fsEvents
    .map(mapMatchEvent)
    .filter((ev) => !!ev)
    .sort((a, b) => a.time - b.time);

  function mapMatchEvent(fsEv: FsGameEvent): MatchEvent | undefined {
    switch (fsEv._tipo) {
      case "gstart":
      case "halftime":
      case "extratime1":
      case "extratime2":
      case "penalties":
        return {
          ...mapEventTime(fsEv._m),
          type: fsEv._tipo,
        };
      case "amarelo":
        return {
          ...mapEventTime(fsEv._m),
          type: "yellow",
          teamId: Number(fsEv._eqmarca),
          playerId: Number(fsEv._jogmarca),
        };
      case "goal":
        if (Number(fsEv._eqmarca) === teams[0].id) {
          matchResult.homeGoals++;
        } else {
          matchResult.awayGoals++;
        }
        return {
          ...mapEventTime(fsEv._m),
          teamId: Number(fsEv._eqmarca),
          teamIdx: teams[0].id === Number(fsEv._eqmarca) ? 0 : 1,
          playerId: Number(fsEv._jogmarca),
          type: fsEv._tipo,
          ...matchResult,
        };
      case "subst":
        return {
          ...mapEventTime(fsEv._m),
          type: "subst",
          teamIdx: teams[0].substPlayers.find((p) => p.id === fsEv._id_player1)
            ? 0
            : 1,
          playerInId: fsEv._id_player1,
          playerOutId: fsEv._id_player2,
        };

      default:
        logger.warn("unknown match event type: " + (fsEv as FsGameEvent)._tipo);
    }
    function mapEventTime(time: string) {
      const minute = mapTime(time);
      return { time: minute, timeInSeconds: minute * 60 };
    }
  }
}

export function createEventsMap(events: MatchEvent[]): MatchEventsMap {
  let lastStep = -1;

  return events
    .sort((a, b) => b.time - a.time)
    .reduce((acc, ev) => {
      const step = minuteToStep(ev.time);

      if (acc[step]) {
        acc[step].events.push(ev);
        acc[step].events.sort((a, b) => a.time - b.time);
      } else {
        acc[step] = { events: [ev], nextEventStep: lastStep };
      }
      lastStep = step;
      return acc;
    }, {} as MatchEventsMap);
}

export function mapGameComments(comments: FsGameComment[]): MatchComment[] {
  return comments.map(mapGameComment);
}

export function mapGameComment(comment: FsGameComment): MatchComment {
  const time = Number(comment._m.replace(",", "."));
  return {
    time,
    step: minuteToStep(time),
    displayTime: formatTimeFromMinutes(time),
    text: comment.text.replace(/\[br\]/g, "\n"),
  };
}

export function createCommentsMap(comments: MatchComment[]): MatchCommentsMap {
  return comments
    .sort((a, b) => a.time - b.time)
    .reduce((acc, c) => {
      if (acc[c.step]) {
        // join texts from 2 events
        acc[c.step].text += "\n" + c.text;
      } else {
        acc[c.step] = { ...c };
      }
      return acc;
    }, {} as MatchCommentsMap);
}

export function mapBestMoments(bestMoments: FsBestMoment[]): MatchBestMoment[] {
  return bestMoments.map((bm) => ({
    startTime: mapTimeToSeconds(bm._t1),
    endTime: mapTimeToSeconds(bm._t2),
  }));
}

function mapTimeToSeconds(minute: string) {
  return mapTime(minute) * 60;
}
function mapTime(minute: string) {
  return Number(minute.replace(",", "."));
}
