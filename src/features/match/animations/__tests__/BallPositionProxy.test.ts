import { beforeEach, describe, expect, test } from "vitest";
import { BallPositionProxy } from "../ball/BallPositionProxy";
import { BallPositionsConfig } from "../positions.utils";

describe("BallPositionProxy", () => {
  let positionProxy: BallPositionProxy;
  let _positionsConfig: BallPositionsConfig;

  beforeEach(() => {
    _positionsConfig = { px: [1, 4], pz: [2, 5], pHeight: [3, 6] };
    positionProxy = new BallPositionProxy(_positionsConfig);
  });

  test("should initialize with default values", () => {
    expect(positionProxy.step).toBe(0);
    expect(positionProxy.x).toBe(1);
    expect(positionProxy.z).toBe(2);
    expect(positionProxy.y).toBe(3);
  });

  test("should returns new positions afer change step", () => {
    positionProxy.step = 1;
    expect(positionProxy.step).toBe(1);
    expect(positionProxy.x).toBe(4);
    expect(positionProxy.z).toBe(5);
    expect(positionProxy.y).toBe(6);
  });

  test("should modify positions config if position proxy is modified", () => {
    const step = 0;
    const expected = { x: 11, z: 12, y: 13 };
    positionProxy.x = expected.x;
    positionProxy.z = expected.z;
    positionProxy.y = expected.y;

    expect(positionProxy.x).toBe(expected.x);
    expect(positionProxy.z).toBe(expected.z);
    expect(positionProxy.y).toBe(expected.y);

    expect(_positionsConfig.px[step]).toBe(expected.x);
    expect(_positionsConfig.pz[step]).toBe(expected.z);
    expect(_positionsConfig.pHeight[step]).toBe(expected.y);
  });
});
