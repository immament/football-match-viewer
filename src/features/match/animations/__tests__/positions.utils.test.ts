import { describe, expect, test } from "vitest";
import {
  ballHeightToPitch,
  distance2D,
  heightToPitch,
  onOut,
  Point2,
  Point3,
  rotationAngle,
  secondsToStep,
  xToPitch,
  zToPitch,
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
    const result = secondsToStep(time);
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

  // test.only("should calculate angle between 3 points 2d ", () => {
  //   const prev = new Vector2(0, 1);
  //   const current = new Vector2(1, 1);
  //   const next = new Vector2(2, 2);
  //   console.log(
  //     angle2d(prev, current),
  //     ",",
  //     angle2d(current, next),
  //     ",",
  //     "result:",
  //     angle2d(prev, current) + angle2d(current, next)
  //   );
  //   // console.log(MathUtils.radToDeg(prev.angleTo(current)));
  //   // // An example at 90 degree
  //   // console.log(MathUtils.radToDeg(current.angleTo(next)));

  //   console.log("find angle", findAngleDeg(prev, current, next));
  // });
});

// function angle2d(a: Vector2, b: Vector2) {
//   const xDist = a.x - b.x;
//   const zDist = a.y - b.y;
//   return (Math.atan2(zDist, xDist) * 180) / Math.PI;
// }

// function findAngleDeg(a: Vector2, b: Vector2, c: Vector2) {
//   return MathUtils.radToDeg(findAngle(a, b, c));
// }

// function findAngle(a: Vector2, b: Vector2, c: Vector2) {
//   const ab = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
//   const bc = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2));
//   const ac = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
//   return Math.acos((bc * bc + ab * ab - ac * ac) / (2 * bc * ab));
// }
