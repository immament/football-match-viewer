import { AnimationAction, AnimationMixer } from "three";
import { secondsToStep } from "../positions.utils";
import { PlayerPoses } from "./PlayerPoses";

export class PlayerAnimationsConfig {
  get get_mixer(): AnimationMixer {
    return this._mixer;
  }

  constructor(
    private _mixer: AnimationMixer,
    private _playerPoses: PlayerPoses,
    private _rotateAction: AnimationAction,
    private _positionAction: AnimationAction
  ) {}

  startMatch(startTime: number, playbackSpeed: number): void {
    this._playerPoses.forceIdle();
    this._positionAction.play();
    this._rotateAction.play();
    if (startTime) {
      this.gotoTime(startTime);
    }
    this.changePlaybackSpeed(playbackSpeed);
    this._mixer.update(0);
  }

  gotoTime(newTime: number): void {
    if (!this._mixer.timeScale) {
      throw new Error("Player config.mixer.timeScale == 0");
    }
    this._mixer.setTime(newTime / this._mixer.timeScale);
    this._playerPoses.forceUpdatePose = true;
    this.unpauseMoveActions();
  }

  changePlaybackSpeed(playbackSpeed: number): void {
    this._mixer.timeScale = playbackSpeed;
    this.unpauseMoveActions();
  }

  updatePose(delta: number) {
    return this._playerPoses.updatePose(delta);
  }

  time() {
    return this._mixer.time;
  }
  step() {
    return secondsToStep(this._mixer.time);
  }

  private unpauseMoveActions(): void {
    this._positionAction.paused = false;
    this._rotateAction.paused = false;
  }
}
