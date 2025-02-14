import { Quaternion, Vector3 } from "three";
import {
  PoseTypes,
  RawPoseEvents,
  RawPoseTypes,
  Writeable,
} from "./Pose.model";
import { PoseRecord } from "./PoseAction.model";
import { PositionProxy } from "./PositionProxy";

export class PoseBuilderStep {
  private _stepIdx: number = 0;
  public get stepIdx(): number {
    return this._stepIdx;
  }
  public set stepIdx(value: number) {
    this._stepIdx = value;
    this._playerPos.step = value;
    this._ballPos.step = value;
  }

  constructor(
    private _playerPos: PositionProxy,
    private _ballPos: PositionProxy,
    private _times: ReadonlyArray<number>,
    private _rawPoses: RawPoseEvents,
    private _posesResult: Writeable<PoseRecord>[] = Array(_times.length),
    // 4 floats for quaternion
    private _directionsResult: number[] = Array<number>(_times.length * 4)
  ) {
    if (_posesResult.length !== _times.length) {
      throw new Error(
        `Wrong array sizes posesResult.length !== times.length [${_posesResult.length}!==${_times.length}]`
      );
    }
    if (_directionsResult.length !== _times.length * 4) {
      throw new Error(
        `Wrong array sizes directionsResult.length !== times.length*4
        [${_directionsResult.length}!==${_times.length * 4}]`
      );
    }
  }

  public get ballPos(): PositionProxy {
    return this._ballPos;
  }
  public get playerPos(): PositionProxy {
    return this._playerPos;
  }
  public get pose(): Writeable<PoseRecord> {
    return this._posesResult[this.stepIdx];
  }
  public get time(): number {
    return this._times[this.stepIdx];
  }
  public get rawPose(): RawPoseTypes | undefined {
    return this._rawPoses[this.stepIdx];
  }

  protected get posesResult(): Writeable<PoseRecord>[] {
    return this._posesResult;
  }

  protected get directionsResult(): number[] {
    return this._directionsResult;
  }

  initPoseRecord(
    playerSpeed: number,
    distanceToBall: number
  ): Writeable<PoseRecord> {
    return (this._posesResult[this.stepIdx] = {
      type: PoseTypes.idle,
      step: this.stepIdx,
      timeScale: 1,
      playerSpeed,
      iteration: 0,
      rawPose: this.rawPose,
      direction: 0,
      rotation: 0,
      distanceToBall,
    });
  }

  // temp variable to optimalization
  private readonly _tmp_quaternion = new Quaternion();
  private readonly _defaultAxis = new Vector3(0, 1, 0);

  /**
   * Saves the player's direction by setting the quaternion from the given axis angle
   * and storing the result in the directions array (number[]).
   *
   * @param direction - The direction angle in radians
   */
  savePlayerDirection(direction: number) {
    this._tmp_quaternion.setFromAxisAngle(this._defaultAxis, direction);
    this._tmp_quaternion.toArray(this.directionsResult, this.stepIdx * 4);
  }
}
