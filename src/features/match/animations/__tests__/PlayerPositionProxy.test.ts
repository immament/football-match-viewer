import { beforeEach, describe, expect, test } from "vitest";
import { PlayerPositionProxy } from "../player/PlayerPositionProxy";

describe("PlayerPositionProxy", () => {
  let positions: Array<number>;

  beforeEach(() => {
    positions = [0, 0, 0, 1, 1, 1];
  });

  test("should initialize with default values", () => {
    const proxy = new PlayerPositionProxy(positions);
    expect(proxy.step).toBe(0);
    expect(proxy.x).toBe(0);
    expect(proxy.y).toBe(0);
    expect(proxy.z).toBe(0);
  });

  test("should update position on step change", () => {
    const proxy = new PlayerPositionProxy(positions);
    proxy.step = 1;
    expect(proxy.x).toBe(1);
    expect(proxy.y).toBe(1);
    expect(proxy.z).toBe(1);
  });

  test("should update x position", () => {
    const proxy = new PlayerPositionProxy(positions);
    proxy.x = 2;
    expect(positions[0]).toBe(2);
  });

  test("should update y position", () => {
    const proxy = new PlayerPositionProxy(positions);
    proxy.y = 2;
    expect(positions[1]).toBe(2);
  });

  test("should update z position", () => {
    const proxy = new PlayerPositionProxy(positions);
    proxy.z = 2;
    expect(positions[2]).toBe(2);
  });
});
