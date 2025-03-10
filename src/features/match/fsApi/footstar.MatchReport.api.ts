import { getMatchReport } from "./__mocks__/match.report";
import { MatchReporResponseDTO } from "./footstar.MatchReport.model";
import { logger } from "/app/logger";

const baseUrls = {
  fs: "https://www.footstar.org/match/matchapi.asp?id=[id]",
  devFs: "https://www.footstar.org/match/matchapi.asp?id=[id]",
  local: "matches/match.[id].json",
  api: "/api/[id]",
};

export type FetchSource = "fs" | "devFs" | "local" | "api";

const fsLogger = logger.getLogger("fs-api");

export async function fetchFootstarMatchReport(
  matchId: number,
  srcType: FetchSource = "fs"
): Promise<MatchReporResponseDTO | undefined> {
  if (!matchId) {
    return getMatchReport(1);
  }
  const url = apiUrl(matchId, srcType);
  fsLogger.info("fetch", matchId, url);
  const data = await makeFetch(url);
  fsLogger.info("matchInfoData", data);
  return data;
}

async function makeFetch(url: string): Promise<MatchReporResponseDTO> {
  const resp = await fetch(url, { mode: "cors", method: "GET" });
  const result = (await resp.json()) as MatchReporResponseDTO;
  return result;
}

function apiUrl(matchId: number, requestType: FetchSource): string {
  return baseUrls[requestType].replace("[id]", String(matchId));
}
