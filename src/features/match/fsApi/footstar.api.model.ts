export type FootstarMatchResponse = { xml: { general: FootstarMatchData } };

export type FootstarMatchData = {
  matchId?: number;
  gconfig: {
    jog_s: {
      "@_tamanho": string;
      "@_temanho_texto": string;
      "@_tbold": string;
      "@_tf": string;
      "@_fdetect": string;
    };
    field: {
      "@_ftype": string;
      "@_weathertype": string;
      "@_wpcent": string;
    };
    ball: {
      "@_tipo": string;
      "@_tamanho": string;
    };
    options_viewer: {
      "@_opcao1": string;
    };
    dbug: { "@_op": string };
  };
  colors: {
    clr: {
      "@_id": string;
      "@_text": string;
      "@_shirt": string;
      "@_shorts": string;
      "@_socks": string;
      "@_text2"?: string;
      "@_shirt2": string;
      "@_shorts2": string;
      "@_socks2": string;
    }[];
  };
  mm: {
    m: {
      "@_p": string;
      "@_t1": string;
      "@_t2": string;
    }[];
  };
  game_info: {
    game_comments: {
      gc: {
        "#text": string;
        "@_m": string;
        "@_LANG": string;
      }[];
    };
    home_team_name: {
      "#text": string;
      "@_id": string;
    };
    away_team_name: {
      "#text": string;
      "@_id": string;
    };
    local: {
      "@_pais": string;
      "@_cidade": string;
      "@_liga": string;
      "@_imagem_cidade": string;
      "@_nome_estadio": string;
    };
    game: {
      "@_status": "online" | "offline";
      "@_minuto": string;
      "@_refresh_time": string;
      "@_matchType": string;
    };
    weather: {
      wind: {
        "@_intensity": string;
        "@_wind_direction": string;
        "@_desc": string;
      };
      wtype: {
        "@_status": string;
        "@_desc": string;
      };
      pitch_variation: string;
      weather_variation: string;
      wind_speed: string;
    };
  };
  ref: {
    "#text": number;
    "@_cc": string;
    "@_tc": string;
    "@_cp": string;
    "@_cb": string;
  };
  home_starting_eleven: {
    home_player_se: SquadPlayer[];
  };
  away_starting_eleven: {
    away_player_se: SquadPlayer[];
  };
  home_substitutes: {
    home_player_sub: PlayerSubstitution | PlayerSubstitution[];
  };
  away_substitutes: {
    away_player_sub: PlayerSubstitution | PlayerSubstitution[];
  };
  game_events: {
    ge: GameEvent[];
  };
  translations: {
    t: { "@_name": string; "@_traducao": string }[];
  };
  game_data: {
    j: GameDataRecord[];
  };
};

export type GameDataRecord = {
  "@_m": string;
  "@_xb": string;
  "@_yb": string;
  "@_zb": string;
  "@_x1c": string;
  "@_x2c": string;
  "@_x3c": string;
  "@_x4c": string;
  "@_x5c": string;
  "@_x6c": string;
  "@_x7c": string;
  "@_x8c": string;
  "@_x9c": string;
  "@_x10c": string;
  "@_x11c": string;
  "@_y1c": string;
  "@_y2c": string;
  "@_y3c": string;
  "@_y4c": string;
  "@_y5c": string;
  "@_y6c": string;
  "@_y7c": string;
  "@_y8c": string;
  "@_y9c": string;
  "@_y10c": string;
  "@_y11c": string;
  "@_x1f": string;
  "@_x2f": string;
  "@_x3f": string;
  "@_x4f": string;
  "@_x5f": string;
  "@_x6f": string;
  "@_x7f": string;
  "@_x8f": string;
  "@_x9f": string;
  "@_x10f": string;
  "@_x11f": string;
  "@_y1f": string;
  "@_y2f": string;
  "@_y3f": string;
  "@_y4f": string;
  "@_y5f": string;
  "@_y6f": string;
  "@_y7f": string;
  "@_y8f": string;
  "@_y9f": string;
  "@_y10f": string;
  "@_y11f": string;
  "@_tt": string;
};

export type PlayerSubstitution = {
  "#text": string;
  "@_type": string;
  "@_id": string;
  "@_shirt_number": string;
  "@_rating": string;
  "@_out": string;
  "@_minute": string;
  "@_cc": string;
  "@_tc": string;
  "@_cp": string;
  "@_cb": string;
};

export type SquadPlayer = {
  "#text": string;
  "@_id": string;
  "@_shirt_number": string;
  "@_rating": string;
  "@_cc": string;
  "@_tc": string;
  "@_cp": string;
  "@_cb": string;
};

export type GameEvent = { "@_m": string } & (
  | { "@_tipo": "gstart" | "halftime" | "gend" }
  | { "@_tipo": "subst"; "@_id_player1": string; "@_id_player2": string }
  | { "@_tipo": "amarelo" | "goal"; "@_eqmarca": string; "@_jogmarca": string }
);
