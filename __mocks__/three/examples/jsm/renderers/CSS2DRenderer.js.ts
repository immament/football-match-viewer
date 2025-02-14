import { Object3D, Vector2 } from "three";

export class CSS2DObject extends Object3D {
  element: HTMLElement;
  center: Vector2;

  constructor(element: HTMLElement) {
    super();
    this.element = element;
    this.center = new Vector2();
  }
}

export class CSS2DRenderer {
  domElement: HTMLElement;

  constructor() {
    this.domElement = document.createElement("div");
  }

  setSize() {}
  render() {}
}
