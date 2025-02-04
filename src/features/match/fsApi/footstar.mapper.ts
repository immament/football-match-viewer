import { decode } from "he";
import { secondsToStep } from "../animations/positions.utils";
import {
  GameEvent,
  MatchData,
  MatchPlayer,
  MatchTeam,
} from "../MatchData.model";
import { MatchEventsMap } from "../matchEvents";
import {
  FootstarMatchData,
  FsGameEvent,
  FsSquadPlayer,
  FsTeamColors,
} from "./footstar.api.model";
import { mapMovement } from "./footstar.movement.mapper";
import { logger } from "/app/logger";

export function mapFsMatch(fsMatch: FootstarMatchData): MatchData {
  const positions = mapMovement(fsMatch);

  return {
    positions,
    homeTeam: mapHomeTeam(),
    awayTeam: mapAwayTeam(),
    eventsMap: mapMatchEventsToEventsMap(fsMatch.game_events.ge),
  };

  function mapHomeTeam(): MatchTeam {
    return {
      id: Number(fsMatch.game_info.home_team_name._id),
      name: fsMatch.game_info.home_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.home_starting_eleven.home_player_se
      ),
      colors: mapColors(fsMatch.colors.clr, "home"),
    };
  }

  function mapAwayTeam(): MatchTeam {
    return {
      id: Number(fsMatch.game_info.away_team_name._id),
      name: fsMatch.game_info.away_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.away_starting_eleven.away_player_se
      ),
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

export function mapSquadPlayers(players: FsSquadPlayer[]) {
  return players.map(mapSquadPlayer);
}

export function mapMatchEventsToEventsMap(
  fsEvents: FsGameEvent[]
): MatchEventsMap {
  return createEventsMap(mapMatchEvents(fsEvents));
}

export function mapMatchEvents(fsEvents: FsGameEvent[]): GameEvent[] {
  return fsEvents.map(mapMatchEvent).filter((ev) => !!ev);
}

function mapMatchEvent(fsEv: FsGameEvent): GameEvent | undefined {
  switch (fsEv._tipo) {
    case "gstart":
    case "halftime":
    case "extratime1":
    case "extratime2":
    case "penalties":
      return {
        time: mapTime(fsEv._m),
        type: fsEv._tipo,
      };
    case "amarelo":
    case "goal":
      return {
        time: mapTime(fsEv._m),
        teamId: Number(fsEv._eqmarca),
        playerId: Number(fsEv._jogmarca),
        type: fsEv._tipo === "amarelo" ? "yellow" : fsEv._tipo,
      };
    case "subst":
      return {
        time: mapTime(fsEv._m),
        playerInId: Number(fsEv._id_player1),
        playerOutId: Number(fsEv._id_player2),
        type: "subst",
      };

    default:
      logger.warn("unknown match event type: " + (fsEv as FsGameEvent)._tipo);
  }
  function mapTime(time: string) {
    return Number(time.replace(",", "."));
  }
}

export function createEventsMap(events: GameEvent[]): MatchEventsMap {
  let lastStep = -1;
  return events
    .sort((a, b) => b.time - a.time)
    .reduce((acc, ev) => {
      const step = secondsToStep(ev.time * 60);
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
