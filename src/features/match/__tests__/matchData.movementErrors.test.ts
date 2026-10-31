import matchXml from "/public/matches/match.2159688.xml?raw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppZuStore } from "/app/app.zu.store";
import { logger } from "/app/logger";
import { parseFsXml } from "../fsApi/footstar.api";

vi.mock("zustand");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("movement decoding errors during match loading", () => {
  it.each([
    ["download", "0/21601"],
    ["XML", "0/21601"],
    ["download", "0/1.5"],
    ["XML", "0/1.5"],
  ])("reports invalid movement from %s (%s) in the existing error state", async (source, movement) => {
    // A small overrun also runs safely against the unbounded decoder.
    const xml = matchXml.replace(/\bxb=(["'])[^"']*\1/, `xb="${movement}"`);
    expect(parseFsXml(xml).game_data.j[0]._xb).toBe(movement);
    vi.spyOn(logger, "info").mockImplementation(() => {});
    vi.spyOn(logger.getLogger("fs-api"), "info").mockImplementation(() => {});
    vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", async () => new Response(xml));

    const actions = useAppZuStore.getState().matchData;
    if (source === "download") await actions.matchFetch(7, "fs");
    else await actions.loadMatchFromXml({ matchId: 7, matchXml: xml });

    const state = useAppZuStore.getState().matchData;
    expect(state.status).toBe("failed");
    expect(state.error).toMatch(/invalid movement data/i);
    if (movement === "0/21601") expect(state.error).toMatch(/limit/i);
    expect(state.data).toBeUndefined();
    expect(state.ball).toBeUndefined();
  });
});
