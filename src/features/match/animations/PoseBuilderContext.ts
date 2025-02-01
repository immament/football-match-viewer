import { BallPositionProxy } from "./BallPositionProxy";
import { PlayerPositionProxy } from "./PlayerPositionProxy";
import { RawPoseEvents } from "./Pose.model";
import { PoseRecord } from "./PoseAction.model";
import { PoseBuilderStep } from "./PoseBuilderStep";
import { BallPositionsConfig } from "./positions.utils";

export class PoseBuilderContext extends PoseBuilderStep {
  private _prev: PoseBuilderStep;
  private _next: PoseBuilderStep;

  public get prev(): PoseBuilderStep {
    return this._prev;
  }
  public get current(): PoseBuilderStep {
    return this;
  }
  public get next(): PoseBuilderStep {
    return this._next;
  }

  get stepIdx(): number {
    return super.stepIdx;
  }

  set stepIdx(value: number) {
    this._prev.stepIdx = value - 1;
    super.stepIdx = value;
    this._next.stepIdx = value + 1;
  }

  constructor(
    playerPositions: Float32Array,
    ballPositions: BallPositionsConfig,
    times: ReadonlyArray<number>,
    rawPoses: RawPoseEvents
  ) {
    super(
      new PlayerPositionProxy(playerPositions),
      new BallPositionProxy(ballPositions),
      times,
      rawPoses
    );

    if (playerPositions.length !== times.length * 3) {
      throw new Error(
        `Wrong array sizes playerPositions.length !== times.length
        [${playerPositions.length}!==${times.length * 3}]`
      );
    }
    if (ballPositions.px.length !== times.length) {
      throw new Error(
        `Wrong array sizes ballPositions.px.length !== times.length
        [${ballPositions.px.length}!==${times.length}]`
      );
    }

    const createStep = function (this: PoseBuilderContext) {
      return new PoseBuilderStep(
        new PlayerPositionProxy(playerPositions),
        new BallPositionProxy(ballPositions),
        times,
        rawPoses,
        this.posesResult,
        this.directionsResult
      );
    }.bind(this);
    this._prev = createStep();
    this._next = createStep();
  }

  public getPosesResult(): PoseRecord[] {
    this.fixLastPose();
    return this.posesResult;
  }

  getDirectionsResult() {
    this.fixLastDirection(this.directionsResult, 4);
    return this.directionsResult;
  }

  // if last position is undefined pose is copied from previouse position
  private fixLastPose() {
    if (!this.posesResult[this.posesResult.length - 1]) {
      this.posesResult[this.posesResult.length - 1] = {
        ...this.posesResult[this.posesResult.length - 2],
        step: this.posesResult.length - 1,
      };
    }
  }
  private fixLastDirection(rotations: number[], count: number) {
    for (let i = rotations.length - count; i < rotations.length; i++) {
      rotations[i] = rotations[i - count];
    }
  }
}
