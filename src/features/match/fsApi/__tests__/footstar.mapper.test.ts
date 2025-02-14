import { describe, expect, test } from "vitest";
import {
  MatchEvent,
  MatchPlayer,
  MatchSubstPlayer,
  MatchTeam,
} from "../../MatchData.model";
import {
  FsGameComment,
  FsGameEvent,
  FsSquadPlayer,
  FsSubstPlayer,
} from "../footstar.api.model";
import {
  createCommentsMap,
  mapGameComment,
  mapGameComments,
  mapMatchEvents,
  mapSquadPlayer,
  mapSquadPlayers,
  mapSubstPlayer,
  mapSubstPlayers,
} from "../footstar.mapper";

describe("footstar mapper", () => {
  describe("map squad players", () => {
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

  describe("map substitution players", () => {
    const fsSubstPlayers: FsSubstPlayer[] = [
      {
        text: "Davi Mariano",
        _id: "130093",
        _shirt_number: "12",
        _rating: "6",
        _out: "130091",
        _minute: "1",
        _cc: "414010",
        _tc: "4",
        _cp: "F7BD84",
        _cb: "000000",
        _type: "",
      },
      {
        text: "Dinis Paranhos",
        _id: "130105",
        _shirt_number: "13",
        _rating: "7",
        _out: "66291",
        _minute: "5",
        _cc: "5C5C5C",
        _tc: "1",
        _cp: "F7BD84",
        _cb: "000000",
        _type: "",
      },
    ];
    const expectedSubstPlayers: MatchSubstPlayer[] = [
      {
        name: "Davi Mariano",
        id: "130093",
        shirtNumber: "12",
        rating: 6,
        hairColor: "#414010",
        hairType: "4",
        skinColor: "#F7BD84",
        shoesColor: "#000000",
        minute: 1,
        outPlayerId: "130091",
      } as const,
      {
        name: "Dinis Paranhos",
        id: "130105",
        shirtNumber: "13",
        rating: 7,
        hairColor: "#5C5C5C",
        hairType: "1",
        skinColor: "#F7BD84",
        shoesColor: "#000000",
        minute: 5,
        outPlayerId: "66291",
      } as const,
    ];

    test("should map subst player", () => {
      const result = mapSubstPlayer(fsSubstPlayers[0]);

      expect(result).toMatchObject(expectedSubstPlayers[0]);
    });

    test("should map subst players", () => {
      const result = mapSubstPlayers(fsSubstPlayers);

      expect(result).toMatchObject(expectedSubstPlayers);
    });
  });

  describe("map match events", () => {
    test("should map match events", () => {
      const fsGameEvents: FsGameEvent[] = [
        { _m: "0", _tipo: "gstart" },
        {
          _m: "1",
          _id_player1: "130093",
          _id_player2: "130091",
          _tipo: "subst",
        },
        {
          _m: "45,199",
          _eqmarca: "24",
          _jogmarca: "130100",
          _tipo: "amarelo",
        },
        { _m: "45,62341", _tipo: "halftime" },
        { _m: "90,235", _tipo: "extratime1" },
        { _m: "105,833", _tipo: "extratime2" },
        { _m: "121,7", _tipo: "penalties" },
      ];

      const result = mapMatchEvents(fsGameEvents, [
        { substPlayers: [] as MatchSubstPlayer[] } as MatchTeam,
        { substPlayers: [] as MatchSubstPlayer[] } as MatchTeam,
      ]);

      expect(result).toMatchObject([
        { time: 0, type: "gstart" },
        {
          time: 1,
          type: "subst",
          playerInId: "130093",
          playerOutId: "130091",
        },
        {
          time: expect.closeTo(45.199),
          type: "yellow",
          teamId: 24,
          playerId: 130100,
        },
        { time: expect.closeTo(45.62341), type: "halftime" },
        { time: expect.closeTo(90.235), type: "extratime1" },
        { time: expect.closeTo(105.833), type: "extratime2" },
        { time: expect.closeTo(121.7), type: "penalties" },
      ]);
    });

    test("should map match event with substPlayers", () => {
      const fsGameEvents: FsGameEvent[] = [
        { _m: "1", _id_player1: "11", _id_player2: "12", _tipo: "subst" },
        { _m: "2", _id_player1: "21", _id_player2: "22", _tipo: "subst" },
      ];

      const result = mapMatchEvents(fsGameEvents, [
        {
          substPlayers: [
            {
              name: "Jan Kowalski",
              id: "11",
              shirtNumber: "2",
              rating: 5,
              hairColor: "#5C4000",
              hairType: "1",
              skinColor: "#654318",
              shoesColor: "#000000",
            },
          ] as MatchSubstPlayer[],
        } as MatchTeam,
        {
          substPlayers: [
            {
              name: "Pascoal Pimentel",
              id: "12",
              shirtNumber: "3",
              rating: 5,
              hairColor: "#5C4000",
              hairType: "1",
              skinColor: "#654318",
              shoesColor: "#000000",
            },
          ] as MatchSubstPlayer[],
        } as MatchTeam,
      ]);

      expect(result).toMatchObject([
        {
          time: 1,
          type: "subst",
          playerInId: "11",
          playerOutId: "12",
          teamIdx: 0,
        },
        {
          time: 2,
          type: "subst",
          playerInId: "21",
          playerOutId: "22",
          teamIdx: 1,
        },
      ] as MatchEvent[]);
    });
  });

  describe("map comments", () => {
    test("should map comment", () => {
      const comment: FsGameComment = {
        _m: "0,008",
        text: "The game starts![br]The sky is clear, there are no clouds in sight.[br]The wind is calm.[br]Diabos takes the kick-off.",
        _LANG: "JOG43",
      };

      const result = mapGameComment(comment);
      expect(result).toMatchObject({
        time: expect.closeTo(0.008, 3),
        displayTime: "00:00",
        step: 0,
        text: "The game starts!\nThe sky is clear, there are no clouds in sight.\nThe wind is calm.\nDiabos takes the kick-off.",
      });
    });

    test("should map comments", () => {
      const comments: FsGameComment[] = [
        {
          _m: "0,008",
          text: "The game starts![br]The sky is clear, there are no clouds in sight.[br]The wind is calm.[br]Diabos takes the kick-off.",
          _LANG: "JOG43",
        },
        {
          text: "Anatoli Atanasov tries to play at first touch...[br]Anatoli Atanasov recovers the ball.[br]Vítor Mendes tries to go past Anatoli Atanasov[br]Vítor Mendes makes a dribble and moves forward[br]Vítor Mendes moves forward with the ball",
          _m: "2,107",
          _LANG: "JOG95",
        },
      ];

      const result = mapGameComments(comments);

      expect(result).toMatchObject([
        {
          time: expect.closeTo(0.008, 3),
          displayTime: "00:00",
          step: 0,
          text: "The game starts!\nThe sky is clear, there are no clouds in sight.\nThe wind is calm.\nDiabos takes the kick-off.",
        },
        {
          time: expect.closeTo(2.107, 3),
          displayTime: "02:06",
          step: 252,
          text: "Anatoli Atanasov tries to play at first touch...\nAnatoli Atanasov recovers the ball.\nVítor Mendes tries to go past Anatoli Atanasov\nVítor Mendes makes a dribble and moves forward\nVítor Mendes moves forward with the ball",
        },
      ]);
    });

    test("should create comments map", () => {
      const comments: FsGameComment[] = [
        {
          _m: "2,100",
          text: "The game starts![br]The sky is clear, there are no clouds in sight.[br]The wind is calm.[br]Diabos takes the kick-off.",
          _LANG: "JOG43",
        },
        {
          text: "Anatoli Atanasov tries to play at first touch...[br]Anatoli Atanasov recovers the ball.[br]Vítor Mendes tries to go past Anatoli Atanasov[br]Vítor Mendes makes a dribble and moves forward[br]Vítor Mendes moves forward with the ball",
          _m: "2,107",
          _LANG: "JOG95",
        },
      ];

      const result = createCommentsMap(mapGameComments(comments));

      expect(result).toMatchObject({
        [252]: {
          time: expect.closeTo(2.1, 3),
          displayTime: "02:06",
          step: 252,
          text: "The game starts!\nThe sky is clear, there are no clouds in sight.\nThe wind is calm.\nDiabos takes the kick-off.\nAnatoli Atanasov tries to play at first touch...\nAnatoli Atanasov recovers the ball.\nVítor Mendes tries to go past Anatoli Atanasov\nVítor Mendes makes a dribble and moves forward\nVítor Mendes moves forward with the ball",
        },
      });
    });
  });
});
