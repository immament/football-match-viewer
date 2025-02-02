import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { useMatchOrbitControls } from "../../world/MatchOrbitControls";
import { fetchMatchById, selectMatchData, selectStatus } from "../match.slice";
import { teams } from "./__mockData__/teams.data";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const dispatch = useAppDispatch();
  const matchStatus = useAppSelector(selectStatus);
  const matchData = useAppSelector(selectMatchData);

  useEffect(() => {
    if (matchData) {
      console.log(matchData);
    }
  }, [matchData]);

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      const matchId = Number(urlParams.get("id"));
      dispatch(fetchMatchById(matchId));
    }
  }, [matchStatus, dispatch]);

  return (
    <group ref={matchRef} dispose={null}>
      {/* <MatchOrbitControls ballRef={ballRef} matchRef={matchRef} /> */}
      <Ball ref={ballRef} />
      {teams.map(({ players }) => {
        return players.map((pl) => (
          <Player
            key={`${pl.team}-${pl.idx}`}
            teamIdx={pl.team}
            playerIdx={pl.idx}
            shirtColor={pl.style.shirtColor}
            shortsColor={pl.style.shortsColor}
          />
        ));
      })}
    </group>
  );
};

// function preapareTeams(matchData: MatchData) {
//   const { homeTeam, awayTeam } = matchData;

//   const homeTeamPlayers = Object.keys(homeTeam).map((teamIdx) => {
//     return {
//       team: Number(teamIdx),
//       idx: 0,
//       style: homeTeam[teamIdx],
//     };
//   });
//   const awayTeamPlayers = Object.keys(awayTeam).map((teamIdx) => {
//     return {
//       team: Number(teamIdx),
//       idx: 0,
//       style: awayTeam[teamIdx],
//     };
//   });
//   return {
//     homeTeam: homeTeamPlayers,
//     awayTeam: awayTeamPlayers,
//   };
// }
