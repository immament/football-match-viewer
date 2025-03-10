import { Loader, PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";
import "./App.scss";
import { useAppZuStore } from "./app/app.zu.store";
import { round } from "./app/utils";
import { CommentsBox } from "./features/mediaPlayer/components/CommentsBox";
import { EventInfoBox } from "./features/mediaPlayer/components/EventInfoBox";
import { MediaHeaderComponent } from "./features/mediaPlayer/components/MediaHeader/MediaHeader.component";
import { MediaPlayerComponent } from "./features/mediaPlayer/components/MediaPlayer/MediaPlayer.component";
import { World } from "./features/world/World";

function App() {
  const [dpr, setDpr] = useState(1.5);
  const isDebug = useAppZuStore(({ debug }) => debug.isDebug);

  const userActivityRef = useRef(false);
  const userIsActiveRef = useRef(false);
  const inactivityTimeout = useRef<number>();
  const mvContainerRef = useRef<HTMLDivElement>(null);

  const matchFetch = useAppZuStore((state) => state.matchData.matchFetch);
  const matchStatus = useAppZuStore((state) => state.matchData.status);

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      matchFetch(
        Number(urlParams.get("id")),
        urlParams.has("dev") ? "devFs" : "fs"
      );
    }
  }, [matchStatus, matchFetch]);

  const activityCheck = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      activityCheck();
    }, 250);
    return () => clearInterval(interval);
  }, [activityCheck]);

  return (
    <div
      id="mv-container"
      onMouseMove={() => reportUserActivity()}
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
      >
        <World />
        <PerformanceMonitor
          factor={1}
          onChange={({ factor }) => {
            const newDpr = round(0.9 + 1.1 * factor, 1);
            // console.log("new", newDpr, factor);
            setDpr(newDpr);
          }}
        />
        <Stats className="stats" />
      </Canvas>
      <Loader />
      <MediaHeaderComponent />
      <MediaPlayerComponent />
      <EventInfoBox />
      <CommentsBox />
      <Leva collapsed hidden={!isDebug} />
    </div>
  );

  function reportUserActivity() {
    userActivityRef.current = true;
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
}

export default App;
