import { ColorRepresentation } from "three";

export interface Team {
  players: PlayerModel[];
}
export interface PlayerModel {
  style: { shirtColor: ColorRepresentation; shortsColor: ColorRepresentation };
  team: 0 | 1;
  isGk: boolean;
  idx: number;
}
export interface TeamStyleModel {
  gk: PlayerStyleModel;
  field: PlayerStyleModel;
}

export interface PlayerStyleModel {
  shirtColor: ColorRepresentation;
  shortsColor: ColorRepresentation;
}
