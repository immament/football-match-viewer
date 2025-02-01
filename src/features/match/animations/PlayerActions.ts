import { AnimationAction } from "three";

import { PlayerId } from "../PlayerId";
import { PoseTypes } from "./Pose.model";
import { IMoveAction, IPoseAction } from "./PoseAction.model";

export class PlayerActions {
  public get positionAction(): AnimationAction {
    return this._positionAction;
  }
  public get rotateAction(): AnimationAction {
    return this._rotateAction;
  }

  private _moveAnimations: IMoveAction[];

  constructor(
    private _positionAction: AnimationAction,
    private _rotateAction: AnimationAction,
    private _poseActions: Record<PoseTypes, IPoseAction>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _playerId: PlayerId
  ) {
    this._moveAnimations = [_positionAction, _rotateAction];

    Object.values(_poseActions).forEach((a) => {
      if (a.isMove) {
        this._moveAnimations.push(a);
        a.play();
      }
    });

    this._positionAction.play();
    this._rotateAction.play();
  }

  public getPoseAction(poseType: PoseTypes): IPoseAction {
    return this._poseActions[poseType];
  }

  unPauseAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.paused = false;
    });
  }

  setTime(timeInSeconds: number) {
    this._positionAction.time = timeInSeconds;
    this._rotateAction.time = timeInSeconds;
  }

  // TODO: use only in debug settings

  public get debug_poseActions(): IPoseAction[] {
    return Object.values(this._poseActions);
  }

  debug_stopAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.stop();
    });
  }

  debug_playAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.play();
    });
  }

  debug_pauseAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.paused = true;
    });
  }
}
