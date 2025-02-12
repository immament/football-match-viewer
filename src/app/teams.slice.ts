import { StateCreator } from "zustand";
import { MatchPlayer, TeamColors } from "../features/match/MatchData.model";
import { AppStoreState } from "./app.zu.store";

export interface TeamsSlice {
  teams: {
    // homeTeam: TeamState;
    // awayTeam: TeamState;
    teamsArray: [TeamState, TeamState];
    selectTeamById: (id: number) => TeamState | undefined;
    selectPlayerById: (playerId: string) => MatchPlayer | undefined;
  };
}

export interface TeamState {
  id: number;
  teamIdx: 0 | 1;
  name: string;
  goals: number;
  squadPlayers: MatchPlayer[];
  colors: TeamColors;
}

export const createTeamsSlice: StateCreator<
  AppStoreState,
  [],
  [],
  TeamsSlice
> = () => ({
  teams: {
    teamsArray: [emptyTeam(0), emptyTeam(1)],
    selectTeamById(this, id: number): TeamState | undefined {
      return this.teamsArray.find((t) => t.id === id);
    },
    selectPlayerById(this, playerId) {
      return (
        searchPlayer(this.teamsArray[0]) ?? searchPlayer(this.teamsArray[1])
      );
      function searchPlayer(team: TeamState) {
        return team.squadPlayers.find((p) => p.id === playerId);
      }
    },
  },
});

function emptyTeam(teamIdx: 0 | 1): TeamState {
  return {
    id: 0,
    teamIdx,
    name: "-",
    goals: 0,
    squadPlayers: [],
    colors: { shirt: "", shorts: "", socks: "", text: "" },
  };
}
