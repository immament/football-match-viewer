import { describe, expect, test } from "vitest";
import { MatchPlayer } from "../../MatchData.model";
import { FsSquadPlayer } from "../footstar.api.model";
import { mapSquadPlayer, mapSquadPlayers } from "../footstar.mapper";

describe("footstar players mapper", () => {
  const fsPlayers: FsSquadPlayer[] = [
    {
      text: "Pascoal Pimentel",
      _id: "130088",
      _shirt_number: "1",
      _rating: "5",
      _cc: "5C4000",
      _tc: "1",
      _cp: "654318",
      _cb: "000000",
    },
    {
      text: "Miguel Proen&#231;a",
      _id: "130091",
      _shirt_number: "2",
      _rating: "6",
      _cc: "FEFF99",
      _tc: "2",
      _cp: "F7BD84",
      _cb: "000000",
    },
  ];

  test("should map squad player", () => {
    const expected: MatchPlayer = {
      name: "Pascoal Pimentel",
      id: "130088",
      shirtNumber: "1",
      rating: 5,
      hairColor: "#5C4000",
      hairType: "1",
      skinColor: "#654318",
      shoesColor: "#000000",
    };

    const result = mapSquadPlayer(fsPlayers[0]);

    expect(result).toMatchObject(expected);
  });

  test("should map squad players", () => {
    const expected: MatchPlayer[] = [
      {
        name: "Pascoal Pimentel",
        id: "130088",
        shirtNumber: "1",
        rating: 5,
        hairColor: "#5C4000",
        hairType: "1",
        skinColor: "#654318",
        shoesColor: "#000000",
      },
      {
        name: "Miguel Proença",
        id: "130091",
        shirtNumber: "2",
        rating: 6,
        hairColor: "#FEFF99",
        hairType: "2",
        skinColor: "#F7BD84",
        shoesColor: "#000000",
      },
    ];

    const result = mapSquadPlayers(fsPlayers);

    expect(result).toMatchObject(expected);
  });
});
