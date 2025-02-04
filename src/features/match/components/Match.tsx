import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";

import { useMatchOrbitControls } from "../../world/MatchOrbitControls";
import {
  fetchMatchById,
  selectStatus,
  selectTeams,
  TeamState,
} from "../match.slice";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const dispatch = useAppDispatch();
  const matchStatus = useAppSelector(selectStatus);
  const teams = useAppSelector(selectTeams);
  // const matchData = useAppSelector(selectMatchData);
  // const matchep = useAppSelector((state) => state.match.matchState.step);

  // // const matchStep = useMediaPlayerZuStore((state) => state.step);

  // const lastStep = useRef<number>(0);

  // useEffect(() => {
  //   if (matchData && lastStep.current !== matchStep) {
  //     lastStep.current = matchStep;
  //     const item = matchData.eventsMap[matchStep];
  //     if (item) {
  //       console.log("aaa", matchStep);
  //       item.events.forEach((ev) => {
  //         if (ev.type === "goal") {
  //           dispatch(teamGoal(ev.teamId));
  //         }
  //       });
  //     }
  //   }
  // }, [matchData, matchStep, teams, dispatch]);

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      const matchId = Number(urlParams.get("id"));
      dispatch(fetchMatchById(matchId));
    }
  }, [matchStatus, dispatch]);

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
// function teamById(
//   { homeTeam, awayTeam }: { homeTeam: TeamState; awayTeam: TeamState },
//   id: number
// ): TeamState | undefined {
//   if (homeTeam.id === id) return homeTeam;
//   if (awayTeam.id === id) return awayTeam;
// }
