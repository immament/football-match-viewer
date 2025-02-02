import { XMLParser } from "fast-xml-parser";
import { FootstarMatchData, FootstarMatchResponse } from "./footstar.api.model";
import { logger } from "/app/logger";

const baseUrls = {
  fs: "https://www.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  devFs: "https://nd.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  local: "assets/sampleMatch/match.live.xml",
  api: "/api/[id]",
};

type FetchSource = "fs" | "devFs" | "local" | "api";

const fsLogger = logger.getLogger("fs-api");

export async function fetchFootstarMatchData(
  matchId: number,
  srcType: FetchSource = "devFs"
): Promise<FootstarMatchData> {
  const url = apiUrl(matchId, srcType);
  fsLogger.info("fetch", matchId, url);
  const xml = await makeFetch(url);
  // console.log(xml);
  const parser = createXmlParser();
  const matchResp = parser.parse(xml) as FootstarMatchResponse;

  // console.log(matchResp.xml.general.home_starting_eleven);
  const data = matchResp.xml.general;
  if (!data.matchId) data.matchId = matchId;
  fsLogger.info("matchData", data);
  return data;
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
