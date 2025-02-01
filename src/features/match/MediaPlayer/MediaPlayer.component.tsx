import { FollowObjectButton } from "./FollowObject.button";
import { FullscreenButton } from "./Fullscreen.button";
import "./mediaPlayer.scss";
import { PlaybackSpeedButton } from "./PlaybackSpeed.button";
import { ProgressHolderComponent } from "./ProgressHolder.component";
import { TooglePlayButton } from "./TooglePlay.button";

export function MediaPlayerComponent() {
  const result = (
    <div className="mv-control-bar">
      <ProgressHolderComponent />
      <div className="mv-buttons-line">
        <TooglePlayButton />
        <div className="mv-buttons-group">
          <FollowObjectButton />
          <PlaybackSpeedButton />
          <FullscreenButton />
        </div>
      </div>
    </div>
  );

  return result;
}
