import { AnimationClip, Object3D } from "three";
import { PoseTypes } from "./animations/Pose.model";

export class ModelConfig {
  public get getMeshFn(): (model: Object3D) => Object3D | undefined {
    return this._getMeshFn;
  }
  public get modelPath(): string {
    return this._modelPath;
  }

  constructor(
    private _modelPath: string,
    private _getMeshFn: (model: Object3D) => Object3D | undefined,
    private _animationIdxs?: Partial<AnimationIdxs>,
    private _animationNames?: Partial<AnimationNames>
  ) {}

  animationClip(clips: AnimationClip[], pose: PoseTypes) {
    if (this._animationIdxs && this._animationIdxs[pose]) {
      return clips[this._animationIdxs[pose]];
    }

    if (this._animationNames) {
      const name = this._animationNames[pose];
      if (name) return clips.find((c) => c.name === name);
    }

    return undefined;
  }
}
export type AnimationIdxs = Record<PoseTypes, number>;
export type AnimationNames = Record<PoseTypes, string>;
