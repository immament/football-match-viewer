import match2159688 from "/public/matches/match.2159688.xml?raw";
import match2161622 from "/public/matches/match.2161622.xml?raw";
import matchLive from "/public/matches/match.live.xml?raw";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchFootstarMatchData, parseFsXml } from "../footstar.api";

const wrap = (content: string) => `<xml><general>${content}</general></xml>`;
const withEntity = (value: string, content: string) =>
  `<!DOCTYPE xml [<!ENTITY team "${value}">]>${wrap(content)}`;

afterEach(() => vi.unstubAllGlobals());

describe("match XML parsing", () => {
  test.each([["2159688", match2159688], ["2161622", match2161622], ["live", matchLive]])(
    "parses the bundled match %s",
    (id, xml) => {
      const data = parseFsXml(xml);
      expect(data.home_starting_eleven.home_player_se).toHaveLength(11);
      expect(data.away_starting_eleven.away_player_se).toHaveLength(11);
      expect(data.game_data.j.length).toBeGreaterThan(0);
      if (id === "2161622") {
        expect(data.game_info.home_team_name).toEqual({
          text: "Inter Codru", _id: "1469",
        });
        expect(data.game_info.away_team_name.text).toBe("Šebestovci B");
      }
    }
  );

  test("preserves entity decoding, attributes, CDATA and substitution arrays", () => {
    const data = parseFsXml(withEntity("United", `
      <game_info><home_team_name id="7">&team; &amp; &#231; &#xE9; &lt; &gt; &quot; &apos;</home_team_name>
      <away_team_name id="A&amp;B"><![CDATA[Club <city> & friends]]></away_team_name></game_info>
      <home_substitutes><home_player_sub id="9">José</home_player_sub></home_substitutes>
      <away_substitutes><away_player_sub id="10">Ana</away_player_sub></away_substitutes>`));
    expect(data.game_info.home_team_name).toEqual({
      _id: "7", text: 'United & &#231; &#xE9; < > " \'',
    });
    expect(data.game_info.away_team_name).toEqual({
      _id: "A&B", text: "Club <city> & friends",
    });
    expect(data.home_substitutes).toEqual({ home_player_sub: [{ _id: "9", text: "José" }] });
    expect(data.away_substitutes).toEqual({ away_player_sub: [{ _id: "10", text: "Ana" }] });
  });

  test("rejects oversized direct input, counting UTF-8 bytes", () => {
    expect(() => parseFsXml(wrap(`<text>${"é".repeat(4 * 1024 * 1024)}</text>`)))
      .toThrow(/XML.*size/i);
  });

  test("rejects oversized entity definitions", () => {
    expect(() => parseFsXml(withEntity("a".repeat(1025), "<text>&team;</text>")))
      .toThrow(/entity.*size/i);
  });

  test("rejects cumulative expansion across nodes and attributes", () => {
    const nodes = '<gc attr="&team;">&team;</gc>'.repeat(600);
    expect(() => parseFsXml(withEntity("a".repeat(1024), nodes)))
      .toThrow(/expanded content size/i);
  });

  test.each(["&#65;", "&#x41;", "&lt;"])("bounds cumulative %s decoding", (entity) => {
    expect(() => parseFsXml(wrap(`<a>${entity.repeat(5000)}</a><b>${entity.repeat(5001)}</b>`)))
      .toThrow(/entity expansion limit/i);
  });

  test("bounds the number of entity declarations", () => {
    const declarations = Array.from({ length: 33 }, (_, i) => `<!ENTITY e${i} "a">`).join("");
    expect(() => parseFsXml(`<!DOCTYPE xml [${declarations}]>${wrap("<text>safe</text>")}`))
      .toThrow(/entity count/i);
  });

  test("rejects invalid entity names without evaluating injected regex", () => {
    expect(() => parseFsXml(`<!DOCTYPE xml [<!ENTITY (a+)+ "x">]>${wrap("<text>safe</text>")}`))
      .toThrow(/entity name/i);
  });
});

describe("match XML download", () => {
  test("decodes UTF-8 split across response chunks", async () => {
    const bytes = new TextEncoder().encode(wrap("<game_info><home_team_name id='7'>é</home_team_name></game_info>"));
    const split = bytes.indexOf(0xc3) + 1;
    vi.stubGlobal("fetch", async () => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    })));
    const data = await fetchFootstarMatchData(7);
    expect(data.game_info.home_team_name.text).toBe("é");
    expect(data.matchId).toBe(7);
  });

  test.each([undefined, "1"])("rejects and cancels an oversized stream with Content-Length %s", async (length) => {
    let cancelled = false;
    let chunks = 0;
    const body = new ReadableStream({
      pull(controller) {
        if (chunks++ < 10) controller.enqueue(new Uint8Array(1024 * 1024));
        else controller.close();
      },
      cancel() { cancelled = true; },
    });
    vi.stubGlobal("fetch", async () => new Response(body, {
      headers: length ? { "Content-Length": length } : undefined,
    }));
    await expect(fetchFootstarMatchData(7)).rejects.toThrow(/XML.*size/i);
    expect(cancelled).toBe(true);
  });
});
