export type FootstarMatchResponse = { xml: { general: FootstarMatchData } };

export type FootstarMatchData = {
  matchId?: number;
  gconfig: {
    jog_s: {
      _tamanho: string;
      _temanho_texto: string;
      _tbold: string;
      _tf: string;
      _fdetect: string;
    };
    field: { _ftype: string; _weathertype: string; _wpcent: string };
    ball: { _tipo: string; _tamanho: string };
    options_viewer: { _opcao1: string };
    dbug: { _op: string };
  };
  colors: {
    clr: (FsTeamColors & FsTeamColorsExt)[];
    // static items
    // <clr id="0" text="FFFFFF" shirt="ae2d00" shorts="ffffff" socks="ae2d00" shirt2="000000" shorts2="000000" socks2="000000" />
    // <clr id="1" text="FFFFFF" shirt="56c0ca" shorts="004bb0" socks="001ab6" shirt2="000000" shorts2="000000" socks2="000000" />
    // <clr id="2" text="FFFFFF" shirt="e0f569" shorts="107400" socks="ffffff" shirt2="000000" shorts2="000000" socks2="000000" />
    // <clr id="3" text="000000" shirt="ffffff" shorts="000000" socks="ffffff" shirt2="000000" shorts2="000000" socks2="000000" />
    // <clr id="4" text="FFFFFF" shirt="054d00" shorts="000000" socks="054d00" shirt2="000000" shorts2="000000" socks2="000000" />
  };
  mm: { m: { _p: string; _t1: string; _t2: string }[] };
  game_info: {
    game_comments: {
      gc: FsGameComment[];
    };
    home_team_name: { text: string; _id: string };
    away_team_name: { text: string; _id: string };
    local: {
      _pais: string;
      _cidade: string;
      _liga: string;
      _imagem_cidade: string;
      _nome_estadio: string;
    };
    game: {
      _status: "online" | "offline";
      // in seconds!!!
      _minuto: string;
      _refresh_time: string;
      _matchType: string;
    };
    weather: {
      wind: {
        _intensity: string;
        _wind_direction: string;
        _desc: string;
      };
      wtype: { _status: string; _desc: string };
      pitch_variation: string;
      weather_variation: string;
      wind_speed: string;
    };
  };
  // referee - not used
  ref: FsReferee;
  home_starting_eleven: { home_player_se: FsSquadPlayer[] };
  away_starting_eleven: { away_player_se: FsSquadPlayer[] };
  home_substitutes: "" | { home_player_sub: FsSubstPlayer[] };
  away_substitutes: "" | { away_player_sub: FsSubstPlayer[] };
  game_events: { ge: FsGameEvent[] };
  translations: { t: { _name: string; _traducao: string }[] };
  game_data: { j: FsGameDataRecord[] };
};

export type FsSubstPlayer = FsSquadPlayer & {
  _out: string;
  _minute: string;
  // probably not used
  _type: string;
};

export type FsSquadPlayer = {
  _id: string;
  // player name
  text: string;
  _shirt_number: string;
  _rating: string;
  // hair color
  _cc: string;
  // hair type
  _tc: string;
  // skin color
  _cp: string;
  // shoes color
  _cb: string;
};

export type FsGameEvent = { _m: string } & (
  | { _tipo: "gstart" | "halftime" | "extratime1" | "extratime2" | "penalties" }
  | { _tipo: "subst"; _id_player1: string; _id_player2: string }
  | { _tipo: "amarelo" | "goal"; _eqmarca: string; _jogmarca: string }
);

export type FsGameEventTypes = FsGameEvent["_tipo"];

export type FsGameDataRecord = {
  // record index
  _m: string;
  // player actions - pass/shot
  _tt: string;
  // ball positions
  _xb: string;
  _yb: string;
  _zb: string;
} & {
  // home players x postions
  _x1c: string;
  _x2c: string;
  _x3c: string;
  _x4c: string;
  _x5c: string;
  _x6c: string;
  _x7c: string;
  _x8c: string;
  _x9c: string;
  _x10c: string;
  _x11c: string;
} & {
  // home players y postions
  _y1c: string;
  _y2c: string;
  _y3c: string;
  _y4c: string;
  _y5c: string;
  _y6c: string;
  _y7c: string;
  _y8c: string;
  _y9c: string;
  _y10c: string;
  _y11c: string;
} & {
  // away players x postions
  _x1f: string;
  _x2f: string;
  _x3f: string;
  _x4f: string;
  _x5f: string;
  _x6f: string;
  _x7f: string;
  _x8f: string;
  _x9f: string;
  _x10f: string;
  _x11f: string;
} & {
  // away players y postions
  _y1f: string;
  _y2f: string;
  _y3f: string;
  _y4f: string;
  _y5f: string;
  _y6f: string;
  _y7f: string;
  _y8f: string;
  _y9f: string;
  _y10f: string;
  _y11f: string;
};

export type FsTeamColors = {
  _id: "home" | "away" | "0" | "1" | "2" | "3" | "4";
  _text: string;
  _shirt: string;
  _shorts: string;
  _socks: string;
};

export type FsTeamColorsExt = {
  // rest can be ignored
  // always white
  _text2?: string;
  // rest always black
  _shirt2: string;
  _shorts2: string;
  _socks2: string;
};

export type FsGameComment = {
  text: string;
  _m: string;
  _LANG: string;
};

// not used
type FsReferee = {
  text: string;
  _cc: string;
  _tc: string;
  _cp: string;
  _cb: string;
};
