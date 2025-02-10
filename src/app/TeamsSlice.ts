import { StateCreator } from "zustand";
import { MatchPlayer, TeamColors } from "../features/match/MatchData.model";
import { AppStoreState } from "./app.zu.store";

export interface TeamsSlice {
  teams: {
    homeTeam: TeamState;
    awayTeam: TeamState;
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
    homeTeam: emptyTeam(0),
    awayTeam: emptyTeam(1),
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
