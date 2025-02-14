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
});
