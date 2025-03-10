export type MatchReporResponseDTO =
  | MatchReportPageContentDTO
  | MatchReportResponseErrorDTO;

export interface MatchReportResponseErrorDTO {
  error: true;
  code: "NO_MATCH" | "NO_MATCH_ID";
  message: string;
}

export interface MatchReportPageContentDTO {
  match: MatchReportDTO;
  error?: false;
}

export interface MatchReportDTO {
  id: number;
  competition: MatchReportCompetitionDTO;
  homeFormation?: TeamFormationDTO;
  awayFormation?: TeamFormationDTO;
  events?: MatchEventDTO[];
  homeTeam: TeamInfoDTO;
  awayTeam: TeamInfoDTO;
  result?: MatchResultWithPenaltiesDTO;
  info: MatchReportInfoDTO;
  times: MatchTimesDTO;
  currentPlayerId: number;
  liveTime?: LiveTimeDTO;
  hasRelation?: boolean;
}

type MatchReportCompetitionDTO = {
  name: string;
  type: MatchType;
  compId?: number;
} & (
  | {
      teamsType: TeamTypeEnum.club | TeamTypeEnum.pvp;
      ageCategory: ClubAgeCategoryDTO;
    }
  | {
      teamsType: TeamTypeEnum.nt | TeamTypeEnum.ct;
      ageCategory: RepAgeCategoryDTO;
    }
);

type LiveTimeDTO = {
  minute: number;
  part: MatchPart;
};

type MatchTimesDTO = {
  halfTime: number;
  fullTime: number;
  extraTime1?: number;
  extraTime2?: number;
  maxTime?: number;
};

type StadionDTO = {
  clubId: number;
  cityId: number;
  cityName: string;
  name: string;
  type: "club" | "youth";
};

interface MatchEventDTO {
  id: number;
  timeInMinutes: number;
  teamId: number;
  typeId: MatchEventTypeDTO;
  playerId: number;
  secondPlayerId?: number;
}

// export enum TeamTypeEnum {
//   Club = 0,
//   Nt = 1,
//   Ct = 2,
//   Pvp = 3
// }

type MatchReportInfoDTO = {
  stadion?: StadionDTO;
  attendance: number;
  date: string;
  avgExp?: ExperienceEnum;
  zonesPossesion?: [number, number][];
};

enum MatchEventTypeDTO {
  yellowCard = 1,
  redCard = 2,
  smallInjury = 5,
  bigInjury = 6,
  goal = 7,
}

type TeamFormationDTO = {
  teamId: number;
  startingEleven: StartingElevenPlayerDTO[];
  substitutions: SubsPlayerDTO[];
  stats?: {
    possession: number;
    shots: number;
    shotsOnGoal: number;
    skillsAvg?: number;
    ratingAvg?: number;
  };
};

type StartingElevenPlayerDTO = MatchPlayerCoreDTO & {
  position: PositionDTO;
  positionId: number;
  positionType: PositionTypeEnum;
};

type PositionDTO = Exclude<string, "Sub">;

type PlayerAfterMatchInfoDTO = {
  rating: number;
  isMom?: boolean;
  stats: number[];
  talents?: NamedItemDTO[];
  skills?: number[];
  orders?: number[];
};

type MatchPlayerCoreDTO = {
  playerId: number;
  playerName: string;
  countryId?: number;
  shirtNumber: number;
  subOut?: SubsInfo;
  faceData?: string;
  afterMatchInfo?: PlayerAfterMatchInfoDTO;
};

type SubsPlayerDTO = MatchPlayerCoreDTO & {
  position: "Sub";
  subIn?: SubsInfo;
};

type SubsInfo = { minute: number; playerId: number; playerName: string };

type NamedItemDTO = {
  id: number;
  name: string;
};

enum MatchPart {
  FirstHalf = 1,
  SecondHalf = 2,
  ExtraTime1 = 3,
  ExtraTime2 = 4,
}

export interface TeamInfoDTO {
  id: number;
  type: TeamTypeEnum;
  name: string;
  logo?: string;
  manager?: {
    id: number;
    faceData: string | undefined;
    name: string;
    countryCode?: string;
    countryId?: number;
  };
  kitColors?: KitColorsDTO;
}

enum TeamTypeEnum {
  club = 0,
  nt = 1,
  ct = 2,
  pvp = 3,
}

type KitColorsDTO = {
  shirt: string;
  number: string;
};

//  type TeamType = "club" | "nt" | "ct" | "pvp";

enum PositionTypeEnum {
  GK = 0,
  D,
  DM,
  M,
  AM,
  F,
}

enum ExperienceEnum {
  terrible = 1,
  veryBad,
  bad,
  weak,
  passable,
  good,
  veryGood,
  excelent,
  formidable,
  worldClass,
}

type MatchType =
  | ClubMatchType
  | NtMatchType
  | CtMatchType
  | "comp"
  | "ct"
  | "pvp";

type NtMatchType = "nt-friend" | "nt-qual" | "nt-wc";
type ClubMatchType =
  | "friendly"
  | "league"
  | "playoff"
  | "ITC"
  | "cup"
  | "youth";
type CtMatchType = "ct-prequal" | "ct-qual" | "ct-wc";

enum RepAgeCategoryDTO {
  Main = 0,
  U21 = 1,
  U18 = 2,
}

enum ClubAgeCategoryDTO {
  Main = 0,
  U19 = 1, // only fs
}

type MatchResultWithPenaltiesDTO = MatchResultDTO & {
  afterPenalties?: MatchResultDTO;
};

type MatchResultDTO = {
  home: number;
  away: number;
};
