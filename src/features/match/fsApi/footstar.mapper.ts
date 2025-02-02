import { decode } from "he";
import { MatchData, MatchPlayer } from "../MatchData.model";
import { FootstarMatchData, FsSquadPlayer } from "./footstar.api.model";
import { mapMovement } from "./footstar.movement.mapper";

export function mapFsMatch(fsMatch: FootstarMatchData): MatchData {
  const positions = mapMovement(fsMatch);

  return {
    positions,
    homeTeam: {
      name: fsMatch.game_info.home_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.home_starting_eleven.home_player_se
      ),
    },
    awayTeam: {
      name: fsMatch.game_info.away_team_name.text,
      squadPlayers: mapSquadPlayers(
        fsMatch.home_starting_eleven.home_player_se
      ),
    },
  };
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
