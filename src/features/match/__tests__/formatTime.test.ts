import { describe, expect, it } from "vitest";
import { formatTime } from "../formatTime";

describe("formatTime", () => {
  it("should format time correctly for full minutes and seconds", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(59)).toBe("00:59");
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(3599)).toBe("59:59");
    expect(formatTime(3600)).toBe("60:00");
  });

  it("should pad single digit minutes and seconds with leading zeros", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
  });
});
