import { beforeAll, describe, expect, test, vi } from "vitest";
import { fetchFootstarMatchData } from "../footstar.api";
import { FootstarMatchData, FsGameDataRecord } from "../footstar.api.model";
import { convertPoses, convertPosesPhase1 } from "../footstar.movement.mapper";

vi.mock(import("../footstar.api"));

describe("footstar convert poses", () => {
  let matchData: FootstarMatchData;
  let gameData: FsGameDataRecord[];
  let rawPoses: string;

  beforeAll(async () => {
    const matchId = 1663808;
    matchData = await fetchFootstarMatchData(matchId);
    gameData = matchData.game_data.j;
    rawPoses = gameData.map((v) => v._tt).join("");
  });

  test("should get rawPoses", () => {
    expect(rawPoses).toMatchSnapshot();
  });

  test("first convert", () => {
    const result = convertPosesPhase1(rawPoses);

    expect(result).toMatchSnapshot();
  });

  test("should convert poses", async () => {
    const result = convertPoses(gameData);

    const toCompare = result.flatMap((t) =>
      t.map((p) => Object.entries(p).flatMap((e) => e))
    );

    expect(toCompare).toMatchSnapshot();
  });
});
