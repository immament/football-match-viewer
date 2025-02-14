import { XMLParser } from "fast-xml-parser";
import { getMatchData } from "./__mocks__/match.1663808.data";
import { FootstarMatchData, FootstarMatchResponse } from "./footstar.api.model";
import { logger } from "/app/logger";

const baseUrls = {
  fs: "https://www.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  devFs: "https://nd.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  local: "matches/match.[id].xml",
  api: "/api/[id]",
};

export type FetchSource = "fs" | "devFs" | "local" | "api";

const fsLogger = logger.getLogger("fs-api");

export async function fetchFootstarMatchData(
  matchId: number,
  srcType: FetchSource = "devFs"
): Promise<FootstarMatchData> {
  if (!matchId) {
    return getMatchData(1);
  }
  const url = apiUrl(matchId, srcType);
  fsLogger.info("fetch", matchId, url);
  const xml = await makeFetch(url);
  const data = parseFsXml(xml);
  if (!data.matchId) data.matchId = matchId;
  fsLogger.info("matchData", data);
  return data;
}

export function parseFsXml(xml: string): FootstarMatchData {
  const parser = createXmlParser();
  const matchResp = parser.parse(xml) as FootstarMatchResponse;
  return matchResp.xml.general;
}

function createXmlParser() {
  const subsTags: Record<string, boolean | undefined> = {
    home_player_sub: true,
    away_player_sub: true,
  };

  const parser = new XMLParser({
    ignoreAttributes: false,
    textNodeName: "text",
    attributeNamePrefix: "_",
    isArray: (tagName) => !!subsTags[tagName],
  });
  return parser;
}

async function makeFetch(url: string) {
  // const headers = new Headers();
  // headers.append("Content-Type", "text/plain; charset=UTF-8");

  const resp = await fetch(url, { mode: "cors", method: "GET" });
  const xml = await resp.text();
  return xml;
}

function apiUrl(matchId: number, requestType: FetchSource): string {
  return baseUrls[requestType].replace("[id]", String(matchId));
}
