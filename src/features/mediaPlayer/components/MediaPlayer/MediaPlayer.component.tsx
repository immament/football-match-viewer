import { useEffect } from "react";
import { DisplayMomentsButton } from "./DisplayMoments.button";
import { FollowObjectButton } from "./FollowObject.button";
import { FullscreenButton } from "./Fullscreen.button";
import "./mediaPlayer.scss";
import { PlaybackSpeedButton } from "./PlaybackSpeed.button";
import { ProgressHolderComponent } from "./ProgressHolder.component";
import { ToogleCommentsButton } from "./ToogleComments.button";
import { TooglePlayButton } from "./TooglePlay.button";
import { useAppZuStore } from "/app/app.zu.store";

export function MediaPlayerComponent() {
  useKeyboard();

  const result = (
    <div className="mv-control-bar">
      <ProgressHolderComponent />
      <div className="mv-buttons-line">
        <TooglePlayButton />
        <div className="mv-buttons-group">
          <DisplayMomentsButton />
          <FollowObjectButton />
          <PlaybackSpeedButton />
          <ToogleCommentsButton />
          <FullscreenButton />
        </div>
      </div>
    </div>
  );

  return result;
}

function useKeyboard() {
  const moveTime = useAppZuStore(({ mediaPlayer }) => mediaPlayer.moveTime);
  const tooglePlay = useAppZuStore(({ mediaPlayer }) => mediaPlayer.tooglePlay);

  useEffect(() => {
    const handleKeyUp = ({ key }: KeyboardEvent) => {
      switch (key) {
        case " ":
          tooglePlay();
          break;
        case "n":
          moveTime(-1);
          break;
        case "m":
          moveTime(1);
          break;
        case "b":
          moveTime(-0.1);
          break;
        case ",":
          moveTime(0.1);
          break;
        // case "c":
        //   logger.debug("camera:", controls.camera, controls.camera.position);
        //   logger.debug("target:", controls.getCameraTarget());
        //   break;
        // case "z":
        //   controls.zoomToTarget(5);
        //   break;
      }
    };
    document.addEventListener("keyup", handleKeyUp, { passive: true });
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [moveTime, tooglePlay]);
}
