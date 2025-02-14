import { PlayerModel, Team, TeamStyleModel } from "../../teams.model";

const teamStyles: [TeamStyleModel, TeamStyleModel] = [
  {
    gk: { shirtColor: "black", shortsColor: "red" },
    field: { shirtColor: "red", shortsColor: "#EFEFEF" },
  },
  {
    gk: { shirtColor: "blue", shortsColor: "yellow" },
    field: { shirtColor: "green", shortsColor: "yellow" },
  },
];

const ONE_PLAYER_DEBUG = false;
export const teams: [Team, Team] = ONE_PLAYER_DEBUG
  ? [
      {
        players: [
          { idx: 10, isGk: false, team: 0, style: teamStyles[0].field },
        ],
      },
      { players: [] },
    ]
  : [
      { players: generatePlayers(0, teamStyles[0]) },
      { players: generatePlayers(1, teamStyles[1]) },
    ];

function generatePlayers(
  team: 0 | 1,
  { gk, field }: TeamStyleModel
): PlayerModel[] {
  return Array.from({ length: 11 }, (_, idx) => {
    const isGk = idx === 0;
    return { idx, isGk, team, style: isGk ? gk : field };
  });
}
