import { Vector2, Vector3 } from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PositionProxy } from "../PositionProxy";
import { Point2, Point3 } from "../positions.utils";

class TestPositionProxy extends PositionProxy {
  public xChanged = vi.fn();
  public yChanged = vi.fn();
  public zChanged = vi.fn();
}

describe("PositionProxy", () => {
  let positionProxy: TestPositionProxy;

  beforeEach(() => {
    positionProxy = new TestPositionProxy();
  });

  test("should initialize with default values", () => {
    expect(positionProxy.step).toBe(0);
    expect(positionProxy.x).toBe(0);
    expect(positionProxy.y).toBe(0);
    expect(positionProxy.z).toBe(0);
  });

  test("should update step value", () => {
    positionProxy.step = 5;
    expect(positionProxy.step).toBe(5);
  });

  test("should update x, y, z values and trigger change methods", () => {
    positionProxy.x = 10;
    positionProxy.y = 20;
    positionProxy.z = 30;

    expect(positionProxy.x).toBe(10);
    expect(positionProxy.y).toBe(20);
    expect(positionProxy.z).toBe(30);
  });

  test("should copy to Vector3", () => {
    const vector = new Vector3();
    positionProxy.x = 1;
    positionProxy.y = 2;
    positionProxy.z = 3;
    positionProxy.copyToVector3(vector);

    expect(vector).toMatchObject({ x: 1, y: 2, z: 3 });
  });

  test("should copy to Vector2", () => {
    const vector = new Vector2();
    positionProxy.x = 1;
    positionProxy.z = 3;
    positionProxy.copyToVector2(vector);

    expect(vector.x).toBe(1);
    expect(vector.y).toBe(3);
  });

  test("should calculate distance to another point", () => {
    const point: Point3 = { x: 3, y: 0, z: 4 };

    const distance = positionProxy.distanceTo(point);
    expect(distance).toBe(5);
  });

  describe("moveToPointAtDistance", () => {
    test("should move to a target point at x axis", () => {
      const target: Point2 = { x: 3, z: 0 };

      positionProxy.moveToPointAtDistance(target, 1);
      expect(positionProxy.x).toBeCloseTo(2);
      expect(positionProxy.z).toBeCloseTo(0);
    });

    test("should move to a target point at z axis", () => {
      const target: Point2 = { x: 0, z: 3 };

      positionProxy.moveToPointAtDistance(target, 1);
      expect(positionProxy.x).toBeCloseTo(0);
      expect(positionProxy.z).toBeCloseTo(2);
    });

    test("should move to a target point", () => {
      const target: Point2 = { x: 3, z: 3 };

      positionProxy.moveToPointAtDistance(target, 0);
      expect(positionProxy.x).toBeCloseTo(3);
      expect(positionProxy.z).toBeCloseTo(3);
    });

    test("should move to a target point at distance 1", () => {
      const target: Point2 = { x: 3, z: 3 };
      // const expectedPoint = {
      //
      //   x: target.x - Math.sin(Math.PI / 4 /* 45deg */), //= 2.29
      //   z: target.z - Math.sin(Math.PI / 4) //= 2.29
      // };

      positionProxy.moveToPointAtDistance(target, 1);
      expect(positionProxy.x).toBeCloseTo(2.29);
      expect(positionProxy.z).toBeCloseTo(2.29);
    });
  });

  test("should calculate direction from from 0,0 to 3,4", () => {
    const target: Point2 = { x: 3, z: 4 };

    const direction = positionProxy.direction2D(target);
    expect(direction).toBeCloseTo(Math.atan2(3, 4));
  });

  test("should calculate direction from 0,0 to 3,3", () => {
    const target: Point2 = { x: 3, z: 3 };

    const direction = positionProxy.direction2D(target);
    expect(direction).toBeCloseTo(Math.PI / 4);
  });

  test("should calculate direction to raw coordinates", () => {
    const direction = positionProxy.direction2DRaw(3, 4);
    expect(direction).toBeCloseTo(Math.atan2(3, 4));
  });

  test("should call xChanged when x was changed", () => {
    const expectedValue = 11;
    positionProxy.x = expectedValue;

    expect(vi.mocked(positionProxy).xChanged).toHaveBeenCalledWith(
      expectedValue
    );
  });

  test("should call yChanged when y was changed 2", () => {
    const expectedValue = 11;
    positionProxy.y = expectedValue;

    expect(vi.mocked(positionProxy).yChanged).toHaveBeenCalledWith(
      expectedValue
    );
  });

  test("should call zChanged when z was changed 2", () => {
    const expectedValue = 11;
    positionProxy.z = expectedValue;

    expect(vi.mocked(positionProxy).zChanged).toHaveBeenCalledWith(
      expectedValue
    );
  });
});
