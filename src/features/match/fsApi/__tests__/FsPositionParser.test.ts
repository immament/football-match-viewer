import { beforeEach, describe, expect, it } from "vitest";
import { FsPositionParser } from "../FsPositionParser";

describe("FsPositionParser", () => {
  let parser: FsPositionParser;

  beforeEach(() => {
    parser = new FsPositionParser();
    parser.parse("=");
  });

  it("should initialize with default values", () => {
    expect(parser.getResult()).toEqual([]);
  });

  it("should parse single digit correctly", () => {
    parser.parse("1").end();
    expect(parser.getResult()).toEqual([1]);
  });

  it("should parse multiple digits (number) correctly", () => {
    parser.parse("1").parse("2").end();
    expect(parser.getResult()).toEqual([12]);
  });

  it('should handle "+" sign correctly', () => {
    parser.parse("1").parse("+").parse("2").end();
    expect(parser.getResult()).toEqual([1, 3]);
  });

  it('should handle "-" sign correctly', () => {
    parser.parse("1").parse("-").parse("2").end();
    expect(parser.getResult()).toEqual([1, -1]);
  });

  it('should handle "/" sign correctly', () => {
    parser.parse("1").parse("/").parse("3").end();
    expect(parser.getResult()).toEqual([1, 1, 1, 1]);
  });

  it("should reset correctly", () => {
    parser.parse("1").end();
    parser.reset();
    expect(parser.getResult()).toEqual([]);

    parser.parse("=").parse("2").end();
    expect(parser.getResult()).toEqual([2]);
  });

  it("should handle complex sequence correctly", () => {
    parser
      .parse("1")
      .parse("+")
      .parse("2")
      .parse("-")
      .parse("3")
      .parse("/")
      .parse("2")
      .end();
    expect(parser.getResult()).toEqual([1, 3, 0, 0, 0]);
  });

  it.each(["1000000000", "9007199254740991"])(
    "rejects repeat count %s before writing any repeated positions",
    (count) => {
      const decoder = new FsPositionParser();
      for (const item of `0/${count}`) decoder.parse(item);
      // Fail safely even against a decoder without limits: never run a huge loop.
      Object.defineProperty(decoder.getResult(), "0", {
        set() { throw new Error("Unexpected repeated position write"); },
      });
      expect(() => decoder.end()).toThrow(/movement.*limit/i);
    }
  );

  it.each(["-1", "+1", "1.5", "NaN", "Infinity", "1e3", " 1", "", "/1", "9007199254740992"])(
    "rejects invalid repeat count %j safely",
    (count) => {
      const decoder = new FsPositionParser();
      Object.defineProperty(decoder.getResult(), "0", {
        set() { throw new Error("Unexpected repeated position write"); },
      });
      expect(() => {
        for (const item of `0/${count}`) decoder.parse(item);
        decoder.end();
      }).toThrow(/invalid movement data/i);
    }
  );

  it("accepts zero repeats and leading zeroes", () => {
    for (const item of "7/000+2/0") parser.parse(item);
    parser.end();
    expect(parser.getResult()).toEqual([7, 9]);
  });

  it("accepts exactly 180 minutes at two samples per second", () => {
    for (const item of "7/21599") parser.parse(item);
    parser.end();
    expect(parser.getResult()).toHaveLength(21600);
    expect(parser.getResult()[0]).toBe(7);
    expect(parser.getResult()[21599]).toBe(7);
  });

  it("rejects cumulative repeats before appending any of an overflowing run", () => {
    for (const item of "0/10800/10800") parser.parse(item);
    expect(parser.getResult()).toHaveLength(10801);
    expect(() => parser.end()).toThrow(/movement.*limit/i);
    expect(parser.getResult()).toHaveLength(10801);
  });

  it("also limits ordinary positions after reaching the boundary", () => {
    for (const item of "0/21599+") parser.parse(item);
    expect(() => parser.parse("1").end()).toThrow(/movement.*limit/i);
    expect(parser.getResult()).toHaveLength(21600);
  });

  it("limits positions without repeats", () => {
    for (const item of "0+".repeat(21600)) parser.parse(item);
    expect(() => parser.end()).toThrow(/movement.*limit/i);
    expect(parser.getResult()).toHaveLength(21600);
  });

  it("resets the output budget for a new stream", () => {
    for (const item of "0/21599") parser.parse(item);
    parser.end().reset();
    for (const item of "0/21600") parser.parse(item);
    parser.end();
    expect(parser.getResult()).toHaveLength(21600);
  });
});
