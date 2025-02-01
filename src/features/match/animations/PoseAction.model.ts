import { AnimationAction } from "three";
import { PoseTypes } from "./Pose.model";

export interface IPoseAction extends IMoveAction {
  poseRecord?: PoseRecord;
  poseType: PoseTypes;
  get isMove(): boolean;
  startAction(pose: PoseRecord, reverse?: boolean): boolean;
  stopAction(): void;
  theSameAction(action: AnimationAction): boolean;
  executeCrossFade(
    props: PoseTransitionProps,
    warping: boolean,
    reverse?: boolean
  ): void;

  // AnimationAction
  enabled: boolean;
  get time(): number;
  canSyncCrossFadeFrom(): boolean;
  getEffectiveWeight(): number;
  setEffectiveTimeScale(timeScale: number): void;
  crossFadeTo(
    fadeInAction: AnimationAction,
    duration: number,
    warp: boolean
  ): void;

  debug_state(): PoseActionState;
  debug_animation(): AnimationAction;
}

export interface IMoveAction {
  stop(): void;
  play(): void;
  paused: boolean;
}

export interface PoseActionState {
  enabled: boolean;
  isRunning: boolean;
  paused: boolean;
  weight: number;
  weightEff: number;
  timeScale: number;
  timeScaleEff: number;
  time: number;
}

export type PoseRecord = {
  readonly type: PoseTypes;
  readonly timeScale: number;
  readonly playerSpeed: number;
  readonly step: number;
  readonly startFrom?: number;
  readonly fadeTime?: number;
  readonly lockTime?: number;
  readonly iteration?: number;
  readonly rawPose?: string;
  readonly direction: number;
  readonly lastDirection?: number;
  // in radians
  readonly rotation: number;
  action?: IPoseAction;
};

export type PoseTransitionProps = {
  readonly oldPoseAction: IPoseAction | undefined;
  readonly newPoseAction: IPoseAction;
  readonly newPoseRecord: PoseRecord;
  readonly withSync: boolean;
  readonly transitionId: string;
  readonly mixterTime: number;
};
