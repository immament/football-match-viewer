import { describe, expect, test } from "vitest";
import {
  ballHeightToPitch,
  distance2D,
  heightToPitch,
  onOut,
  Point2,
  Point3,
  rotationAngle,
  timeToStep,
  xToPitch,
  zToPitch
} from "../positions.utils";

describe("positions utils", () => {
  test("should convert x to pitch", () => {
    const x = 6650;
    const result = xToPitch(x);
    expect(result).toBe(0);
  });

  test("should convert z to pitch", () => {
    const z = 4500;
    const result = zToPitch(z);
    expect(result).toBe(0);
  });

  test("should convert height to pitch", () => {
    const height = 61 / 0.58;
    const result = heightToPitch(height);
    expect(result).toBeCloseTo(1);
  });

  describe("ball height to pitch", () => {
    test("should convert ball height to pitch when pith heigh <= 2", () => {
      const height = 2 * (61 / 0.58);
      const result = ballHeightToPitch(height);
      expect(result).toBeCloseTo(2);
    });
    test("should convert ball height to pitch when pith heigh > 2", () => {
      const height = 30 * (61 / 0.58);
      const result = ballHeightToPitch(height);
      expect(result).toBeCloseTo(7.6);
    });
  });

  test("should calculate distance between two points", () => {
    const pos1: Point2 = { x: 0, z: 0 };
    const pos2: Point2 = { x: 3, z: 4 };
    const result = distance2D(pos1, pos2);
    expect(result).toBe(5);
  });

  test("should check if position is out of bounds", () => {
    const position: Point3 = { x: 0, y: 0, z: 35 };
    const result = onOut(position);
    expect(result).toBe(true);
  });

  test("should convert time to step", () => {
    const time = 1;
    const result = timeToStep(time);
    expect(result).toBe(2);
  });

  describe("rotationAngle", () => {
    test("should calculate rotation angle between two directions (PI)", () => {
      const directionA = Math.PI / 2;
      const directionB = -Math.PI / 2;
      const result = rotationAngle(directionA, directionB);
      expect(result).toBeCloseTo(Math.PI);
    });
    test("should calculate rotation angle between two directions (PI + 0.1)", () => {
      const directionA = Math.PI;
      const directionB = -0.1;
      const result = rotationAngle(directionA, directionB);
      expect(result).toBeCloseTo(-Math.PI + 0.1);
    });

    test("should calculate rotation angle between two directions (-PI - 0.1)", () => {
      const directionA = -Math.PI;
      const directionB = 0.1;
      const result = rotationAngle(directionA, directionB);
      expect(result).toBeCloseTo(Math.PI - 0.1);
    });

    test("should calculate rotation angle between two directions (5*PI + 0.1)", () => {
      const directionA = 5 * Math.PI;
      const directionB = -0.1;
      const result = rotationAngle(directionA, directionB);
      expect(result).toBeCloseTo(-Math.PI + 0.1);
    });

    test("should calculate rotation angle between two directions (-5*PI - 0.1)", () => {
      const directionA = -5 * Math.PI;
      const directionB = 0.1;
      const result = rotationAngle(directionA, directionB);
      expect(result).toBeCloseTo(Math.PI - 0.1);
    });
  });
});
