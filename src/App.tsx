import { PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense, useContext, useState } from "react";
import "./App.scss";
import { ContainerContext } from "./app/Container.context";
import { round } from "./app/utils";
import { World } from "./components/World";
import { MediaHeaderComponent } from "./features/match/MediaHeader/MediaHeader.component";
import { MediaPlayerComponent } from "./features/match/MediaPlayer/MediaPlayer.component";

function App() {
  const [dpr, setDpr] = useState(1.5);

  const ctx = useContext(ContainerContext);

  return (
    <>
      <Suspense
        fallback={
          <div className="app-fallback">
            <span>
              <i className="bx bx-loader-alt bx-spin"></i> Loading...
            </span>
          </div>
        }
      >
        <Canvas
          dpr={dpr}
          shadows
          camera={{ position: [0, 30, 30], fov: 65, near: 0.01, far: 200 }}
        >
          <World />
          <PerformanceMonitor
            factor={1}
            onChange={({ factor }) => {
              const newDpr = round(0.5 + 1.5 * factor, 1);
              setDpr(newDpr);
            }}
          />
          <Stats className="stats" />
        </Canvas>
      </Suspense>
      <MediaHeaderComponent />
      <MediaPlayerComponent />
      <Leva collapsed hidden={!ctx?.debugMode} />
    </>
  );
}

export default App;
