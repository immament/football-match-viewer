import { TeamColors } from "../MatchData.model";
import { Color } from "./Color";
import { KitColorsVo } from "./KitColorsVo";
import { TeamState } from "/app/teams.slice";

export function fixSimilarColors([homeTeam, awayTeam]: [TeamState, TeamState]) {
  const homeKit = createKit(homeTeam);
  const awayKit = createKit(awayTeam).fixIfSimilar(homeKit, homeTeam.id);
  applyColors(homeTeam.colors, homeKit);
  applyColors(awayTeam.colors, awayKit);
}

function applyColors(colors: TeamColors, kit: KitColorsVo) {
  colors.shirt = kit.shirt().hex();
  colors.text = kit.text().hex();
}

function createKit(team: TeamState) {
  return KitColorsVo.createForShirtColor(
    new Color(team.colors.shirt),
    team.id,
    new Color(team.colors.text)
  );
}
