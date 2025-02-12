import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { TeamState } from "../../../app/teams.slice";
import { Ball } from "./Ball";
import { useMatchOrbitControls } from "./MatchOrbitControls";
import { Player } from "./Player";
import { useAppZuStore } from "/app/app.zu.store";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const matchFetch = useAppZuStore((state) => state.matchData.matchFetch);
  const matchStatus = useAppZuStore((state) => state.matchData.status);
  const teams = useAppZuStore((state) => state.teams.teamsArray);

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      const matchId = Number(urlParams.get("id"));
      matchFetch(matchId);
    }
  }, [matchStatus, matchFetch]);

  return (
    <group ref={matchRef} dispose={null}>
      <Ball ref={ballRef} key="ball" />
      {teams.map((team) => (
        <Players team={team} teamIdx={team.teamIdx} key={team.teamIdx} />
      ))}
    </group>
  );
};

function Players({ team, teamIdx }: { team: TeamState; teamIdx: 0 | 1 }) {
  return team?.squadPlayers.map((player, idx) => (
    <Player
      key={`${team.id}-${idx}`}
      teamIdx={teamIdx}
      playerIdx={idx}
      shirtColor={team.colors.shirt}
      shortsColor={team.colors.shorts}
      bodyColor={player.skinColor}
    />
  ));
}
