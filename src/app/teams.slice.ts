import { StateCreator } from "zustand";
import { fixSimilarColors } from "../features/match/colors/validateColors";
import {
  MatchPlayer,
  MatchTeam,
  TeamColors,
} from "../features/match/MatchData.model";
import { AppStoreState } from "./app.zu.store";

export interface TeamsSlice {
  teams: {
    teamsArray: [TeamState, TeamState];
    initTeams(teams: MatchTeam[]): void;
    selectTeamById(id: number): TeamState | undefined;
    selectPlayerById(playerId: string): MatchPlayer | undefined;
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
  [["zustand/immer", never]],
  [],
  TeamsSlice
> = (set) => ({
  teams: {
    teamsArray: [emptyTeam(0), emptyTeam(1)],
    initTeams(aTeams: MatchTeam[]): void {
      const teamsState: [TeamState, TeamState] = [
        mapTeamToState(aTeams[0]),
        mapTeamToState(aTeams[1]),
      ];
      fixSimilarColors(teamsState);
      set((state) => {
        state.teams.teamsArray = teamsState;
      });
    },
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

function mapTeamToState(team: MatchTeam): TeamState {
  return {
    teamIdx: team.teamIdx,
    id: team.id,
    name: team.name,
    colors: team.colors,
    squadPlayers: [...team.squadPlayers],
    goals: 0,
  };
}
