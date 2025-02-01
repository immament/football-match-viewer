import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { fetchMatchById, selectStatus } from "../features/match/match.slice";
import { Ball } from "./Ball";
import { useMatchOrbitControls } from "./MatchOrbitControls";
import { Player } from "./Player";
import { teams } from "./__mockData__/teams.data";
import { useAppDispatch, useAppSelector } from "/app/withTypes";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const dispatch = useAppDispatch();
  const matchStatus = useAppSelector(selectStatus);

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
