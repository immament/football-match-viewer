import { useControls } from "leva";
import { TeamIdx } from "../MatchData.model";
import { Player } from "./Player";
import { TeamState } from "/app/teams.slice";

export function Team({ team, teamIdx }: { team: TeamState; teamIdx: TeamIdx }) {
  const { dbgLabelVisible } = useControls("Players", {
    dbgLabelVisible: false,
  });

  return (
    team.squadPlayers
      // .filter((_, idx) => idx === 10 && teamIdx === 0)
      .map((player, playerIdx) => {
        return (
          <Player
            key={`${team.id}-${playerIdx}`}
            teamIdx={teamIdx}
            player={player}
            playerIdx={playerIdx}
            colors={team.colors}
            dbgLabelVisible={dbgLabelVisible}
          />
        );
      })
  );
}
