import { AnimationClip, Object3D } from "three";
import { vi } from "vitest";

class GltfMock extends Object3D {
  constructor(public name: string) {
    super();
  }
  _scene?: Object3D;
  get scene() {
    return (this._scene ??= new GltfMock("scene"));
  }
  getObjectByName(name: string) {
    return new GltfMock(name);
  }
  material = {
    clone: vi.fn().mockReturnValue({ color: { set: vi.fn() } })
  };
  animations: AnimationClip[] = [];
}

// const GltfMock = vi.fn((name) => {

//   // return {
//   //   _scene: undefined,
//   //   name,
//   //   animations: [],
//   //   children: [],
//   //   get scene() {
//   //     return (this._scene ??= new Object3D());
//   //   },
//   //   getObjectByName: vi.fn((name) => {
//   //     let result = this.children.find();
//   //     return new Object3D(name);
//   //   }),
//   //   material: {
//   //     clone: vi.fn().mockReturnValue({ color: { set: vi.fn() } })
//   //   },
//   //   traverse: vi.fn(),
//   //   clone: vi.fn(() => new GltfMock(name + " clone"))
//   // };

// });

export const GLTFLoader = vi.fn(() => ({
  loadAsync: vi.fn().mockResolvedValue(new GltfMock("GltfMain"))
}));
