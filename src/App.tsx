import { Loader, PerformanceMonitor, Stats, StatsGl } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";
import "./App.scss";
import { useAppZuStore } from "./app/app.zu.store";
import { round, useRandomTraceId } from "./app/utils";
import { CommentsBox } from "./features/mediaPlayer/components/CommentsBox";
import { EventInfoBox } from "./features/mediaPlayer/components/EventInfoBox";
import { MediaHeaderComponent } from "./features/mediaPlayer/components/MediaHeader/MediaHeader.component";
import { MediaPlayerComponent } from "./features/mediaPlayer/components/MediaPlayer/MediaPlayer.component";
import { World } from "./features/world/World";

const urlParams = new URLSearchParams(window.location.search);

function App() {
  useRandomTraceId("App");

  const [dpr, setDpr] = useState(2);
  const isDebug = useAppZuStore(({ debug }) => debug.isDebug);
  const displayStats = useRef(urlParams.has("stats"));
  const displayStatsGl = useRef(urlParams.has("stats-gl"));

  const mvContainerRef = useRef<HTMLDivElement>(null);

  const reportUserActivity = useUserActivity(mvContainerRef);

  const isPaused = useAppZuStore((a) => a.mediaPlayer.paused);

  return (
    <div
      key="mv-container"
      id="mv-container"
      className="mv-user-is-active"
      onMouseMove={reportUserActivity}
      onTouchStart={reportUserActivity}
      onClick={reportUserActivity}
      ref={mvContainerRef}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 30, 30], fov: 65, near: 0.01, far: 500 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        shadows={{ type: PCFSoftShadowMap }}
        frameloop={urlParams.has("demand") || isPaused ? "demand" : "always"}
        key="three-canvas"
      >
        <World key="world-wrapper" />

        <PerformanceMonitor
          factor={1}
          onChange={({ factor }) => {
            const newDpr = round(0.9 + 1.1 * factor, 1);
            if (newDpr !== dpr) setDpr(newDpr);
          }}
        />

        {(isDebug || displayStats.current) && <Stats className="mv-stats" />}
        {displayStatsGl.current && (
          <StatsGl className="mv-stats-gl" trackGPU={true} />
        )}
      </Canvas>
      <Loader />
      <MediaHeaderComponent />
      <MediaPlayerComponent />
      <EventInfoBox />
      <CommentsBox />
      {/* <Squads /> */}
      <Leva collapsed hidden={!isDebug} />
    </div>
  );
}

export default App;

function useUserActivity(mvContainerRef: RefObject<HTMLDivElement>) {
  // console.log("useUserActivity");
  const userIsActiveRef = useRef(false);
  const inactivityTimeout = useRef<number>();
  const userActivityRef = useRef(true);

  const reportUserActivity = useCallback(() => {
    userActivityRef.current = true;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      activityCheck();
    }, 250);
    return () => clearInterval(interval);
    //
    function activityCheck() {
      if (!userActivityRef.current) return;
      userActivityRef.current = false;

      userIsActive(true);

      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }

      const timeout = 2000;

      inactivityTimeout.current = setTimeout(function () {
        if (!userActivityRef.current) {
          userIsActive(false);
        }
      }, timeout);
    }

    function userIsActive(isActive: boolean) {
      if (isActive === userIsActiveRef.current) return;

      userIsActiveRef.current = isActive;
      if (!mvContainerRef.current) return;
      // console.log("userIsActive", userIsActiveRef.current);
      if (userIsActiveRef.current) {
        mvContainerRef.current.classList.add("mv-user-is-active");
      } else {
        mvContainerRef.current.classList.remove("mv-user-is-active");
      }
    }
  }, [mvContainerRef]);

  return reportUserActivity;
}
