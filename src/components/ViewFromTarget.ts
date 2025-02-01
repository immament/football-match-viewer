import { Camera, Object3D, Vector3 } from "three";

export class ViewFromTarget {
  private _enabled = false;
  // private offset = new Vector3(2, 0, 0);
  private direction = new Vector3();
  private offsetScale = 2;
  private _onMouseWheel: (event: WheelEvent) => void;

  constructor() {
    this._onMouseWheel = this.onMouseWheel.bind(this);
  }

  public get enabled(): boolean {
    return this._enabled;
  }
  public set enabled(value: boolean) {
    this._enabled = value;
    this.switchListenMouseWheel();
  }

  update(targetObject: Object3D, camera: Camera, targetPoint: Vector3) {
    if (!this._enabled || !targetObject) return;
    const isPlayer = targetObject.name === "Player";
    if (isPlayer) {
      const cameraY = 1;

      targetObject.getWorldDirection(this.direction);

      camera.position
        .set(targetObject.position.x, cameraY, targetObject.position.z)
        .addScaledVector(this.direction, -this.offsetScale);

      this.direction.y = cameraY;
      targetPoint.addVectors(targetObject.position, this.direction);
    } else {
      targetPoint.copy(targetObject.position);

      camera.position.x = targetObject.position.x;
      camera.position.y = 2 + targetObject.position.y / 2;
      camera.position.z = targetObject.position.z + this.offsetScale * 4;
    }
  }

  private switchListenMouseWheel() {
    if (this.enabled) {
      document.addEventListener("wheel", this._onMouseWheel, { passive: true });
    } else {
      document.removeEventListener("wheel", this._onMouseWheel);
    }
  }

  private onMouseWheel(event: WheelEvent) {
    this.offsetScale += event.deltaY * -0.01;
    this.restrictOffsetScale();
  }

  private restrictOffsetScale() {
    this.offsetScale = Math.min(Math.max(0.9, this.offsetScale), 4);
  }
}
