import { Suspense, useRef } from "react";
import { Group, Mesh } from "three";
import { Ball } from "./Ball";
import { useMatchOrbitControls } from "./MatchOrbitControls";
import { Team } from "./Team";
import { useAppZuStore } from "/app/app.zu.store";
import { useRandomTraceId } from "/app/utils";

export const Match = () => {
  useRandomTraceId("Match");

  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const teams = useAppZuStore((state) => state.teams.teamsArray);

  return (
    <group ref={matchRef} dispose={null} key="Match">
      <Suspense fallback={null}>
        <Ball ref={ballRef} key="ball" />
      </Suspense>
      <Suspense fallback={null} key={"team-out-susp"}>
        {teams.map((team) => (
          <Team
            team={team}
            teamIdx={team.teamIdx}
            key={"team-out-" + team.teamIdx}
          />
        ))}
      </Suspense>
    </group>
  );
};
