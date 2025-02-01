import { AnimationAction } from "three";
import { PoseTypes } from "./Pose.model";
import {
  IPoseAction,
  PoseRecord,
  PoseTransitionProps,
} from "./PoseAction.model";

export class PoseAction implements IPoseAction {
  public poseRecord?: PoseRecord;

  public set poseType(value: PoseTypes) {
    this._poseType = value;
  }
  constructor(
    private _isMove: boolean,
    private _poseType: PoseTypes,
    private _animation: AnimationAction
  ) {}

  theSameAction(action: AnimationAction): boolean {
    return action === this._animation;
  }
  get enabled(): boolean {
    return this._animation.enabled;
  }
  set enabled(value: boolean) {
    this._animation.enabled = value;
  }
  get time(): number {
    return this._animation.time;
  }
  getEffectiveWeight(): number {
    return this._animation.getEffectiveWeight();
  }
  setEffectiveTimeScale(timeScale: number): void {
    this._animation.setEffectiveTimeScale(timeScale);
  }
  crossFadeTo(
    fadeInAction: AnimationAction,
    duration: number,
    warp: boolean
  ): void {
    this._animation.crossFadeTo(fadeInAction, duration, warp);
  }

  // + IMoveAction ++
  stop(): void {
    this._animation.stop();
  }
  play(): void {
    // console.log("play", this._animation.getClip().name);
    // if (this._animation.getClip().name === "sk.throw_in.anim") {
    //   return;
    // }
    this._animation.play();
  }
  public get paused(): boolean {
    return this._animation.paused;
  }
  public set paused(value: boolean) {
    this._animation.paused = value;
  }
  // - IMoveAction --

  get name(): string {
    return this._animation.getClip().name ?? "-";
  }
  get isMove(): boolean {
    return this._isMove;
  }
  get isPose(): boolean {
    return !this._isMove;
  }
  get poseType(): PoseTypes {
    return this._poseType;
  }

  canSyncCrossFadeFrom(): boolean {
    return this._animation.getEffectiveWeight() < 0.1;
  }

  startAction(pose: PoseRecord, reverse = false): boolean {
    if (this._poseType !== pose.type) return false;
    this._animation.reset();
    if (reverse) {
      this._animation.time = this._animation.getClip().duration;
    } else if (pose.startFrom) {
      this._animation.time = pose.startFrom;
    }

    this._animation.setEffectiveTimeScale(pose.timeScale);
    this._animation.setEffectiveWeight(1);
    this._animation.play();
    return true;
  }

  stopAction() {
    this._animation.setEffectiveWeight(0);
    this._animation.enabled = false;
  }

  executeCrossFade(
    props: PoseTransitionProps,
    warping: boolean,
    reverse: boolean = false
  ) {
    this._animation.enabled = true;
    this._animation.setEffectiveTimeScale(props.newPoseRecord.timeScale);
    this._animation.setEffectiveWeight(1);
    this._animation.getMixer();
    if (reverse) {
      this._animation.time = this._animation.getClip().duration;
      if (props.oldPoseAction) {
        props.oldPoseAction.enabled = false;
      }
      return;
    }

    this._animation.time = props.newPoseRecord.startFrom ?? 0;
    props.oldPoseAction?.crossFadeTo(
      this._animation,
      props.newPoseRecord.fadeTime ?? 0.1,
      warping
    );
  }

  debug_state() {
    return {
      enabled: this._animation.enabled,
      isRunning: this._animation.isRunning(),
      paused: this._animation.paused,
      weight: this._animation.weight,
      weightEff: this._animation.getEffectiveWeight(),
      timeScale: this._animation.timeScale,
      timeScaleEff: this._animation.getEffectiveTimeScale(),
      time: this._animation.time,
    };
  }

  debug_animation(): AnimationAction {
    return this._animation;
  }
}
