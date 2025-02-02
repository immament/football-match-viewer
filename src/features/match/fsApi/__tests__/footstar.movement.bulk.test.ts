import { beforeAll, describe, expect, test, vi } from "vitest";
import { fetchFootstarMatchData } from "../footstar.api";
import { FootstarMatchData, FsGameDataRecord } from "../footstar.api.model";
import {
  convertBallPositions,
  convertPlayerPositions,
  FsPlayerIdx,
  FsTeamKeys,
} from "../footstar.movement.mapper";

vi.mock(import("../footstar.api"));

describe("footstar bulk positions convert", () => {
  let matchData: FootstarMatchData;
  let gameData: FsGameDataRecord[];

  beforeAll(async () => {
    const matchId = 1663808;
    matchData = await fetchFootstarMatchData(matchId);
    gameData = matchData.game_data.j;
  });

  test("should fetch match data", () => {
    expect(matchData).toBeDefined();
    expect(gameData).toBeDefined();
  });

  describe("Ball", () => {
    test.each<"x" | "y" | "z">(["x", "y", "z"])(
      "should convert ball %s postions",
      async (dimension) => {
        const result = convertBallPositions(gameData, dimension);
        await expect(result).toMatchFileSnapshot(
          `./__snapshots__/ball-positions.${dimension}.ts.snap`
        );
      }
    );
  });

  describe.each<FsTeamKeys>(["c", "f"])("team %s", (team) => {
    describe.each<FsPlayerIdx>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])(
      "player %i",
      (player) => {
        test.each<"x" | "y">(["x", "y"])(
          "should convert %s positions",
          async (dimension) => {
            const result = convertPlayerPositions(
              gameData,
              team,
              player,
              dimension
            );
            await expect(result).toMatchFileSnapshot(
              `./__snapshots__/player-positions.${team}-${player}-${dimension}.snap`
            );
          }
        );
      }
    );
  });
});
