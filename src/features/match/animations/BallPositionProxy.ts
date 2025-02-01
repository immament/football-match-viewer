import { PositionProxy } from "./PositionProxy";
import { BallPositionsConfig } from "./positions.utils";

export class BallPositionProxy extends PositionProxy {
  constructor(
    private _positions: BallPositionsConfig
  ) // private _playerId: PlayerId
  {
    super();
    this.step = 0;
  }
  public get step(): number {
    return super.step;
  }
  public set step(aStep: number) {
    super.step = aStep;
    this._vector3.set(
      this._positions.px[aStep],
      this._positions.pHeight[aStep],
      this._positions.pz[aStep]
    );
  }

  protected xChanged(value: number) {
    this._positions.px[super.step] = value;
  }
  protected yChanged(value: number) {
    this._positions.pHeight[super.step] = value;
  }
  protected zChanged(value: number) {
    this._positions.pz[super.step] = value;
  }
}
