import { XMLParser } from "fast-xml-parser";
import { getMatchData } from "./__mocks__/match.data";
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

// Bundled full matches are about 2 MiB; leave room for longer matches while
// bounding both downloaded data and synchronous parser work.
const maxXmlBytes = 8 * 1024 * 1024;
const maxEntityReferences = 10000;

export async function fetchFootstarMatchData(
  matchId: number,
  srcType: FetchSource = "fs"
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
  if (xml.length > maxXmlBytes || new TextEncoder().encode(xml).byteLength > maxXmlBytes) {
    throw new Error("Match XML exceeds size limit (8 MiB)");
  }
  // Count source references too: v4 leaves numeric references for the match
  // mapper's HTML decoder and does not count &amp; in its expansion budget.
  // Conservatively include references in comments and CDATA in this budget.
  let references = 0;
  const entityReference = /&(?:#[0-9]+|#x[0-9a-fA-F]+|[A-Za-z_:][\w.:-]*);/g;
  while (entityReference.exec(xml)) {
    if (++references > maxEntityReferences) {
      throw new Error("Match XML entity expansion limit exceeded");
    }
  }
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
    processEntities: {
      enabled: true,
      maxEntitySize: 1024,
      maxEntityCount: 32,
      maxTotalExpansions: maxEntityReferences,
      maxExpandedLength: 1024 * 1024,
    },
  });
  return parser;
}

async function makeFetch(url: string) {
  const resp = await fetch(url, { mode: "cors", method: "GET" });
  if (!resp.body) throw new Error("Match XML response has no body");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let xml = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxXmlBytes) {
        await reader.cancel();
        throw new Error("Match XML exceeds size limit (8 MiB)");
      }
      xml += decoder.decode(value, { stream: true });
    }
    return xml + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

function apiUrl(matchId: number, requestType: FetchSource): string {
  return baseUrls[requestType].replace("[id]", String(matchId));
}
