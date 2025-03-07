// src/features/match/animations/playerMovement/createPositionsArrays.test.ts

import { describe, expect, it } from "vitest";
import { PlayerId } from "../../../PlayerId";
import { PlayerPositions } from "../../positions.utils";
import { createPositionsArrays } from "../createPositionsArrays";

describe("createPositionsArrays", () => {
  const playerId = new PlayerId(0, 1);
  // const px = [1, 2, 3, 4, 5];
  // const pz = [6, 7, 8, 9, 10];
  const px = [6650, 6650 + 61, 6650 + 61, 6650 - 61 * 2, 6650];
  const pz = [4500, 4500 + 61 * 2, 4500 + 61 * 2, 4500 + 61 * 5, 4500 + 61 * 6];
  const playerPositions: PlayerPositions = { px, pz };

  it("should return an object with times and positions arrays", () => {
    const result = createPositionsArrays(playerPositions, playerId);
    expect(result).toHaveProperty("times");
    expect(result).toHaveProperty("positions");
  });

  it("should throw an error if px and pz arrays have different lengths", () => {
    const invalidPlayerPositions: PlayerPositions = {
      px: [1, 2, 3],
      pz: [6, 7, 8, 9],
    };
    expect(() =>
      createPositionsArrays(invalidPlayerPositions, playerId)
    ).toThrowError("Different raw positions array lenghts; px: 3, pz: 4");
  });

  it("should calculate times array correctly", () => {
    const result = createPositionsArrays(playerPositions, playerId);
    expect(result.times).toEqual([0, 0.5, 1, 1.5, 2]);
  });

  it("should calculate positions array correctly", () => {
    const result = createPositionsArrays(playerPositions, playerId);
    expect(result.positions).toMatchObject([
      0.35, 0, -0.35, 1, 0, 2, 1, 0, 2, -2, 0, 5, -2, 0, 5,
    ]);
  });
});
