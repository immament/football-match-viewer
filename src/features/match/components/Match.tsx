import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { useMatchOrbitControls } from "../../world/MatchOrbitControls";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { useAppZuStore } from "/app/app.zu.store";
import { TeamState } from "/app/TeamsSlice";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const matchFetch = useAppZuStore((state) => state.matchData.matchFetch);
  const matchStatus = useAppZuStore((state) => state.matchData.status);
  const teams = useAppZuStore((state) => state.teams);

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
      <Players team={teams.homeTeam} teamIdx={0} />
      <Players team={teams.awayTeam} teamIdx={1} />
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
