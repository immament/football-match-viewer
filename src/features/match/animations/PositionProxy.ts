import { Vector2, Vector3 } from "three";
import { distance2D, Point2, Point3 } from "./positions.utils";

export abstract class PositionProxy implements Point3 {
  private _step = 0;
  protected _vector3 = new Vector3();

  constructor() {}

  public get step(): number {
    return this._step;
  }
  public set step(value: number) {
    this._step = value;
  }

  get x(): number {
    return this._vector3.x;
  }
  set x(value: number) {
    this._vector3.x = value;
    this.xChanged(value);
  }
  get y() {
    return this._vector3.y;
  }
  set y(value: number) {
    this._vector3.y = value;
    this.yChanged(value);
  }
  get z() {
    return this._vector3.z;
  }
  set z(value: number) {
    this._vector3.z = value;
    this.zChanged(value);
  }

  protected abstract xChanged(value: number): void;
  protected abstract yChanged(value: number): void;
  protected abstract zChanged(value: number): void;

  copyToVector3(v: Vector3): Vector3 {
    return v.copy(this._vector3);
  }
  copyToVector2(v: Vector2): Vector2 {
    return v.set(this.x, this.z);
  }

  distanceTo(v: Point3): number {
    return distance2D(this, v);
  }
  toString() {
    return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
  }

  private _tmp_dir = new Vector2();
  private _tmp_begin = new Vector2();
  private _tmp_end = new Vector2();

  /**
   * Moves the current position to a point at a specified distance from the target point.
   *
   * @param target - The target point to move towards.
   * @param distance - The distance to move from the target point.
   */
  moveToPointAtDistance(target: Point2, distance: number) {
    this.copyToVector2(this._tmp_begin);
    this._tmp_end.set(target.x, target.z);
    this._tmp_dir.subVectors(this._tmp_begin, this._tmp_end).normalize();
    this._tmp_end.addScaledVector(this._tmp_dir, distance);
    //console.log("this._tmp_end", this._tmp_end);

    this.x = this._tmp_end.x;
    this.z = this._tmp_end.y;
  }

  direction2D(end: Point2) {
    return Math.atan2(end.x - this.x, end.z - this.z);
  }
  direction2DRaw(xEnd: number, zEnd: number) {
    return Math.atan2(xEnd - this.x, zEnd - this.z);
  }
}
