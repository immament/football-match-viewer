import { AnimationAction, AnimationMixer } from "three";

import { ILabelUpdater } from "../ILabelUpdater";
import { logDebugTransition, playerLogger } from "../player.logger";
import { PlayerId } from "../PlayerId";
import { PlayerActions } from "./PlayerActions";
import { PoseTypes } from "./Pose.model";
import {
  IPoseAction,
  PoseRecord,
  PoseTransitionProps,
} from "./PoseAction.model";
import { timeToStep } from "./positions.utils";
import { logger } from "/app/logger";
import { round } from "/app/utils";

export type PoseChangedEventDetail = {
  player: PlayerId;
  pose: PoseRecord | undefined;
};

// manage switch player pose (animation)
export class PlayerPoses extends EventTarget {
  forceIdle() {
    const poseTime = this._mixer.time;
    const newPose: PoseRecord = {
      type: PoseTypes.idle,
      step: 0,
      timeScale: 1,
      playerSpeed: 0,
      iteration: 0,
      direction: 0,
      rotation: 0,
    };

    this.changePose(newPose, poseTime);
  }
  // TODO: DEBUG
  private _labelUpdater: ILabelUpdater | undefined;

  private _currentPose?: PoseRecord = undefined;
  private _forceUpdatePose = false;
  public get forceUpdatePose() {
    return this._forceUpdatePose;
  }
  public set forceUpdatePose(value) {
    this._forceUpdatePose = value;
  }
  private _syncCrossFade = false;
  private _warping = false;
  private _pause = false;

  constructor(
    private _playerId: PlayerId,
    private _mixer: AnimationMixer,
    private _actions: PlayerActions,
    private _poses: PoseRecord[]
  ) {
    super();
  }

  public get currentPose(): PoseRecord | undefined {
    return this._currentPose;
  }
  public get syncCrossFade(): boolean {
    return this._syncCrossFade;
  }
  public set syncCrossFade(value: boolean) {
    this._syncCrossFade = value;
  }
  public get playerId(): PlayerId {
    return this._playerId;
  }
  public get pause(): boolean {
    return this._pause;
  }
  public set pause(value: boolean) {
    this._pause = value;
  }

  public setCurrentPose(newPose: PoseRecord | undefined) {
    if (newPose?.action) newPose.action.poseRecord = newPose;
    this._currentPose = newPose;
    this.dispatchEvent(
      new CustomEvent<PoseChangedEventDetail>("poseChanged", {
        detail: { player: this._playerId, pose: newPose },
      })
    );
  }

  // get and set pose for current time (AnimationMixer time)
  public updatePose(mixerUpdateDelta: number): void {
    if (!mixerUpdateDelta && !this._forceUpdatePose) return;

    if (this.pause) return;

    const poseTime = this._mixer.time + mixerUpdateDelta;
    const newPose = this.poseForTime(poseTime);

    this.changePose(newPose, poseTime);
  }

  private changePose(newPose: PoseRecord, poseTime: number) {
    if (newPose === this._currentPose) return;

    const props = this.createPoseTransitionProps(newPose, poseTime);

    if (this._forceUpdatePose) {
      this.clearLastPoseAction(props);
    }

    if (props.newPoseAction) {
      this.switchPose(props);
    }
    this.updateLabel();
  }

  private createPoseTransitionProps(
    newPose: PoseRecord,
    time: number,
    step?: string | number,
    withSync?: boolean
  ): PoseTransitionProps {
    if (!newPose.action)
      newPose.action = this._actions.getPoseAction(newPose.type);
    return {
      transitionId: this.newTransitionId(step ?? newPose.step),
      newPoseAction: newPose.action,
      newPoseRecord: newPose,
      withSync: withSync ?? this.syncCrossFade,
      oldPoseAction: this.currentAction,
      mixterTime: time,
    };
  }

  public switchPoseTo(newPose: PoseRecord, withSync: boolean) {
    const props: PoseTransitionProps = this.createPoseTransitionProps(
      newPose,
      this._mixer.time,
      "spt",
      withSync
    );
    if (!newPose.action) {
      playerLogger.warn(this._playerId, "Pose not found:", newPose.type);
      return;
    }

    this.switchPose(props);
  }

  // ++ INTERNALS +++

  private get currentAction(): IPoseAction | undefined {
    return this._currentPose?.action;
  }

  private _lastTransitionId = -1;
  private newTransitionId(step: number | string): string {
    return `${step}-${++this._lastTransitionId}`;
  }

  private poseForTime(time: number): PoseRecord {
    let roundedTime = timeToStep(time);
    if (roundedTime >= this._poses.length) roundedTime = this._poses.length - 1;
    return this._poses[roundedTime];
  }

  private switchPose(props: PoseTransitionProps) {
    if (this.currentAction === props.newPoseAction) {
      props.newPoseAction.setEffectiveTimeScale(props.newPoseRecord.timeScale);
      logDebugTransition(this._playerId, "{Keep Pose}:", props);
      this.setCurrentPose(props.newPoseRecord);
      this.updateLabel();
      return;
    }

    if (this.currentAction) {
      this.switchAction(props);
    } else {
      logDebugTransition(this._playerId, "{Start Pose}:", props);
      this.setCurrentPose(props.newPoseRecord);
      props.newPoseAction.startAction(props.newPoseRecord);
    }
    this.updateLabel();
  }

  private clearLastPoseAction(props: PoseTransitionProps): void {
    if (this.currentAction) {
      playerLogger.debug(
        this.playerId,
        props.transitionId,
        "{clear Last}:",
        this.currentAction.poseType
      );

      this.currentAction.stopAction();
      this.setCurrentPose(undefined);
      this.updateLabel();
    }

    this._forceUpdatePose = false;
  }

  private updateLabel() {
    this._labelUpdater?.updateLabel(
      this._labelUpdater.createLabelText(this._currentPose, this._mixer.time)
    );
  }

  private switchAction(props: PoseTransitionProps): boolean {
    logDebugTransition(
      this._playerId,
      "{switch Action}:",
      props,
      props.newPoseRecord.rotation,
      props.newPoseRecord.direction,
      props.newPoseRecord.lastDirection
    );

    if (props.withSync && props.oldPoseAction) {
      this.synchronizeCrossFade(props);
    } else {
      this.executeCrossFade(props);
    }
    this.setCurrentPose(props.newPoseRecord);
    return true;
  }

  private synchronizeCrossFade(props: PoseTransitionProps) {
    if (!this.currentAction?.canSyncCrossFadeFrom()) {
      logDebugTransition(
        this._playerId,
        "{synchronizeCrossFade skipped}:",
        props,
        this.currentAction
          ? "old action weight to low:" +
              round(this.currentAction.getEffectiveWeight())
          : "old action not set"
      );
      this.executeCrossFade(props);
      return;
    }

    logDebugTransition(this._playerId, "{synchronizeCrossFade}:", props);

    this._mixer.addEventListener(
      "loop",
      getOnLoopFinished(this, this.currentAction)
    );

    function getOnLoopFinished(
      aPlayerPose: PlayerPoses,
      anOldAction: IPoseAction
    ) {
      const onLoopFinished = (event: {
        action: AnimationAction;
        loopDelta: number;
      }) => {
        if (anOldAction.theSameAction(event.action)) {
          logDebugTransition(
            aPlayerPose.playerId,
            `{getOnLoopFinished}:`,
            props,
            "hasEventListener:",
            aPlayerPose._mixer.hasEventListener("loop", onLoopFinished)
          );

          aPlayerPose._mixer.removeEventListener("loop", onLoopFinished);
          aPlayerPose.executeCrossFade(props);
        }
      };
      return onLoopFinished;
    }
  }

  private executeCrossFade(props: PoseTransitionProps) {
    logDebugTransition(this._playerId, "{executeCrossFade}:", props);

    if (this.currentAction !== props.oldPoseAction) {
      logger.warn("this.currentAction !== props.oldAction", props);
    }

    props.newPoseAction.executeCrossFade(
      props,
      this._warping,
      this.isReverse()
    );

    // // Not only the start action, but also the end action must get a weight of 1 before fading
    // // (concerning the start action this is already guaranteed in this place)
    // newPoseAction.enabled = true;
    // newPoseAction.setEffectiveTimeScale(props.newPoseRecord.timeScale);
    // newPoseAction.setEffectiveWeight(1);
    // if (this._mixer.timeScale >= 0) {
    //   newPoseAction.time = props.newPoseRecord.startFrom ?? 0;
    //   if (props.oldPoseAction)
    //     props.oldPoseAction.crossFadeTo(
    //       newPoseAction,
    //       props.newPoseRecord.fadeTime ?? 0.1,
    //       this._warping
    //     );
    // } else {
    //   newPoseAction.time = newPoseAction.getClip().duration;
    //   if (props.oldPoseAction) {
    //     //props.oldAction.animation.syncWith(newAnimation);
    //     //props.oldAction.animation.halt(0.1);
    //     props.oldPoseAction.enabled = false;
    //   }
    // }

    //logDebugTransition(this._player, "{executeCrossFade}:", props);
  }

  private isReverse(): boolean {
    return this._mixer.timeScale < 0;
  }
}
