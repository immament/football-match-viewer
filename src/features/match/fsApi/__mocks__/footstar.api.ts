import { FootstarMatchData } from "../footstar.api.model";
import { getMatchData } from "./match.1663808.data";

export async function fetchFootstarMatchData(
  matchId: number
): Promise<FootstarMatchData> {
  return getMatchData(matchId);
}
