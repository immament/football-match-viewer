import { XMLParser } from "fast-xml-parser";
import { MatchData } from "../MatchData.model";
import {
  BALL_OFFSET_Y,
  ballHeightToPitch,
  MatchPositions,
  xToPitch,
  zToPitch,
} from "../animations/positions.utils";
import { FootstarMatchData, FootstarMatchResponse } from "./footstar.api.model";
import {
  convertBallPositions,
  convertPlayersPositions,
  convertPoses,
} from "./footstar.mapper";
import { logger } from "/app/logger";

const baseUrls = {
  fs: "https://www.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  devFs: "https://nd.footstar.org/match/get_data_nviewer.asp?jogo_id=[id]",
  local: "assets/sampleMatch/match.live.xml",
};

type FetchSource = "fs" | "devFs" | "local";

const fsLogger = logger.getLogger("fs-api");

export async function fetchFootstarMatchData(
  matchId: number,
  srcType: FetchSource = "devFs"
): Promise<FootstarMatchData> {
  fsLogger.info("fetch", matchId);

  const url = apiUrl(matchId, srcType);
  const xml = await makeFetch(url);

  const parser = new XMLParser({ ignoreAttributes: false });
  const matchResp = parser.parse(xml) as FootstarMatchResponse;
  const data = matchResp.xml.general;
  if (!data.matchId) data.matchId = matchId;
  return data;
}

export function convertFsMatch(fsMatch: FootstarMatchData): MatchData {
  const positions = convertGameData(fsMatch);

  return {
    positions,
    homeTeam: { name: fsMatch.game_info.home_team_name["#text"] },
    awayTeam: { name: fsMatch.game_info.away_team_name["#text"] },
  };
}

function convertGameData(fsMatch: FootstarMatchData) {
  const gameData = fsMatch.game_data.j;

  const positions: MatchPositions = {
    ball: {
      px: convertBallPositions(gameData, "x").map((v) => xToPitch(v)),
      pz: convertBallPositions(gameData, "y").map((v) => zToPitch(v)),
      pHeight: convertBallPositions(gameData, "z").map(
        (h) => ballHeightToPitch(h) + BALL_OFFSET_Y
      ),
    },
    players: [
      convertPlayersPositions(gameData, "c"),
      convertPlayersPositions(gameData, "f"),
    ],
    poses: convertPoses(gameData),
  };
  return positions;
}

async function makeFetch(url: string) {
  const resp = await fetch(url, { mode: "cors", method: "GET" });
  const xml = await resp.text();
  return xml;
}

function apiUrl(matchId: number, requestType: FetchSource): string {
  return baseUrls[requestType].replace("[id]", String(matchId));
}
