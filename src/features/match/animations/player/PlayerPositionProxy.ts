import { PositionProxy } from "../PositionProxy";

export class PlayerPositionProxy extends PositionProxy {
  constructor(private _positions: number[]) {
    super();
    this.step = 0;
  }

  public get step(): number {
    return super.step;
  }
  public set step(value: number) {
    super.step = value;
    this._vector3.fromArray(this._positions, value * 3);
  }
  protected xChanged(value: number) {
    // playerLogger.debug(
    //   this._playerId,
    //   super.step,
    //   "xChanged:",
    //   this,
    //   `${this._vector3.x} => ${value}`,
    //   this._positions[super.step * 3]
    // );
    this._positions[super.step * 3] = value;
  }
  protected yChanged(value: number) {
    this._positions[super.step * 3 + 1] = value;
  }
  protected zChanged(value: number) {
    this._positions[super.step * 3 + 2] = value;
  }
}
