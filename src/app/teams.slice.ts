import { StateCreator } from "zustand";
import { calculataPlayerMovement } from "../features/match/animations/playerMovement/calculataPlayerMovement";
import { MatchMovement } from "../features/match/animations/positions.utils";
import { fixSimilarColors } from "../features/match/colors/validateColors";
import {
  MatchPlayer,
  MatchTeam,
  TeamColors,
  TeamIdx,
} from "../features/match/MatchData.model";
import { PlayerId } from "../features/match/PlayerId";
import { AppStoreState } from "./app.zu.store";

export interface TeamsSlice {
  teams: {
    teamsArray: [TeamState, TeamState];
    initTeams(teams: MatchTeam[], matchMovement: MatchMovement): void;
    selectTeamById(id: number): TeamState | undefined;
    selectPlayerById(playerId: string): MatchPlayer | undefined;
  };
}

export interface TeamState {
  id: number;
  teamIdx: TeamIdx;
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
    initTeams(aTeams: MatchTeam[], matchMovement: MatchMovement): void {
      const teamsState: [TeamState, TeamState] = [
        mapTeamToState(aTeams[0], matchMovement),
        mapTeamToState(aTeams[1], matchMovement),
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

function emptyTeam(teamIdx: TeamIdx): TeamState {
  return {
    id: 0,
    teamIdx,
    name: "-",
    goals: 0,
    squadPlayers: [],
    colors: { shirt: "", shorts: "", socks: "", text: "" },
  };
}

function mapTeamToState(
  team: MatchTeam,
  matchMovement: MatchMovement
): TeamState {
  team.squadPlayers.forEach((player, playerIdx) => {
    player.movements = calculataPlayerMovement(
      new PlayerId(team.teamIdx, playerIdx),
      matchMovement
    );
  });

  return {
    teamIdx: team.teamIdx,
    id: team.id,
    name: team.name,
    colors: team.colors,
    squadPlayers: [...team.squadPlayers],
    goals: 0,
  };
}
