import { Loader, PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useState } from "react";
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

  return (
    <>
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
            setDpr(newDpr);
          }}
        />
        <Stats className="stats" />{" "}
      </Canvas>
      <Loader />
      <MediaHeaderComponent />
      <MediaPlayerComponent />
      <EventInfoBox />
      <CommentsBox />
      <Leva collapsed hidden={!isDebug} />
    </>
  );
}

export default App;
