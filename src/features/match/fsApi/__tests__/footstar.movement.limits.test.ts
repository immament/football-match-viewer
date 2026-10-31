import match2159688 from "/public/matches/match.2159688.xml?raw";
import match2161622 from "/public/matches/match.2161622.xml?raw";
import matchLive from "/public/matches/match.live.xml?raw";
import { describe, expect, it } from "vitest";
import { getMatchData } from "../__mocks__/match.1663808.data";
import { parseFsXml } from "../footstar.api";
import { FsGameDataRecord } from "../footstar.api.model";
import {
  convertBallPositions,
  convertPlayerPositions,
  mapMovement,
} from "../footstar.movement.mapper";

const record = getMatchData(1663808).game_data.j[0];
const records = (parts: string[]): FsGameDataRecord[] =>
  parts.map((_xb) => ({ ...record, _xb, _x1c: _xb }));

describe("movement limits across records", () => {
  it("keeps repeat digits and operators split across records", () => {
    const data = records(["0", "/2", "160", "0"]);
    expect(convertBallPositions(data, "x")).toHaveLength(21600);
    expect(convertPlayerPositions(data, "c", 1, "x")).toHaveLength(21600);
  });

  it("rejects cumulative overflow spread across records for ball and players", () => {
    const data = records(["0/10800", "/108", "01"]);
    expect(() => convertBallPositions(data, "x")).toThrow(/movement.*limit/i);
    expect(() => convertPlayerPositions(data, "c", 1, "x")).toThrow(/movement.*limit/i);
  });

  it("preserves deltas and zero repeats across record boundaries", () => {
    const data = records(["=10/", "0-", "3/2", "+5"]);
    expect(convertBallPositions(data, "x")).toEqual([10, 7, 7, 7, 12]);
  });

  it.each([
    ["2159688", match2159688, 14423],
    ["2161622", match2161622, 11013],
    ["live", matchLive, 11060],
  ] as const)("decodes all 47 coordinate streams of bundled match %s", (_, xml, length) => {
    const movement = mapMovement(parseFsXml(xml));
    const streams = [
      movement.ball.px, movement.ball.pz, movement.ball.pHeight,
      ...movement.players.flatMap((team) => team.flatMap((player) => [player.px, player.pz])),
    ];
    expect(streams).toHaveLength(47);
    for (const stream of streams) {
      expect(stream).toHaveLength(length);
      expect(stream.every(Number.isFinite)).toBe(true);
    }
  });

  it("preserves known ball and player positions from a full match", async () => {
    const data = getMatchData(1663808).game_data.j;
    await expect(convertBallPositions(data, "x")).toMatchFileSnapshot(
      "./__snapshots__/ball-positions.x.ts.snap"
    );
    await expect(convertPlayerPositions(data, "c", 1, "x")).toMatchFileSnapshot(
      "./__snapshots__/player-positions.c-1-x.snap"
    );
  });
});
