import { Suspense, useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { FetchSource } from "../fsApi/footstar.api";
import { Ball } from "./Ball";
import { useMatchOrbitControls } from "./MatchOrbitControls";
import { Team } from "./Team";
import { useAppZuStore } from "/app/app.zu.store";
import { logger } from "/app/logger";

export const Match = () => {
  const ballRef = useRef<Mesh | null>(null);
  const matchRef = useRef<Group | null>(null);
  useMatchOrbitControls(ballRef, matchRef);

  const matchFetch = useAppZuStore((state) => state.matchData.matchFetch);
  const loadMatchFromXml = useAppZuStore(
    (state) => state.matchData.loadMatchFromXml
  );
  const matchStatus = useAppZuStore((state) => state.matchData.status);
  const teams = useAppZuStore((state) => state.teams.teamsArray);

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("ext")) {
        logger.info("matchData from ext");
        function listener(ev: Event) {
          logger.info("matchData from listener", ev);
          if (ev instanceof CustomEvent) loadMatchFromXml(ev.detail);
        }
        document.addEventListener("matchDataForViewer", listener);
        document.dispatchEvent(new Event("matchViewerReady"));
        return () => {
          document.removeEventListener("matchDataForViewer", listener);
        };
      }

      const matchId = Number(urlParams.get("id"));
      const srcType: FetchSource = urlParams.has("dev") ? "devFs" : "fs";
      matchFetch(matchId, srcType);
    }
  }, [matchStatus, matchFetch, loadMatchFromXml]);

  return (
    <group ref={matchRef} dispose={null}>
      <Suspense fallback={null}>
        <Ball ref={ballRef} key="ball" />
        {teams.map((team) => (
          <Team team={team} teamIdx={team.teamIdx} key={team.teamIdx} />
        ))}
      </Suspense>
    </group>
  );
};
