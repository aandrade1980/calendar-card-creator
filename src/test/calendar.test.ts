import { describe, it, expect } from "vitest";
import { parseEndTimeFromNotes, getEndTime, BirthdayInfo, parseStartTime } from "../lib/calendar";

describe("Calendar Utilities", () => {
  describe("parseStartTime", () => {
    it("should parse '18:30'", () => {
      expect(parseStartTime("18:30")).toBe("18:30");
    });
    it("should parse '6:30 PM'", () => {
      expect(parseStartTime("6:30 PM")).toBe("18:30");
    });
    it("should parse range '18:30 a 21:30 hrs'", () => {
      expect(parseStartTime("18:30 a 21:30 hrs")).toBe("18:30");
    });
  });

  describe("parseEndTimeFromNotes", () => {
    it("should parse '18:30 a 21:30 hrs'", () => {
      const notes = "Time is 18:30 a 21:30 hrs";
      expect(parseEndTimeFromNotes(notes)).toBe("21:30");
    });

    it("should parse '18:30 a 21:30' (no hrs)", () => {
      const notes = "18:30 a 21:30";
      expect(parseEndTimeFromNotes(notes)).toBe("21:30");
    });

    it("should parse '18:30 until 21:30'", () => {
      const notes = "18:30 until 21:30";
      expect(parseEndTimeFromNotes(notes)).toBe("21:30");
    });

    it("should parse '6:30 PM a 9:30 PM'", () => {
      const notes = "6:30 PM a 9:30 PM";
      expect(parseEndTimeFromNotes(notes)).toBe("21:30");
    });

    it("should parse 'ends at 8:00 PM'", () => {
      const notes = "Party ends at 8:00 PM";
      expect(parseEndTimeFromNotes(notes)).toBe("20:00");
    });
  });

  describe("getEndTime", () => {
    it("should prioritize explicit end_time", () => {
      const info: BirthdayInfo = {
        name: "Test",
        date: "2024-04-05",
        time: "18:30",
        location: "Home",
        end_time: "22:00",
        additional_notes: "18:30 a 21:30 hrs"
      };
      expect(getEndTime(info)).toBe("22:00");
    });

    it("should use parsed time from notes if end_time is missing", () => {
      const info: BirthdayInfo = {
        name: "Test",
        date: "2024-04-05",
        time: "18:30",
        location: "Home",
        additional_notes: "18:30 a 21:30 hrs"
      };
      expect(getEndTime(info)).toBe("21:30");
    });

    it("should handle Blackpink invitation: 18:30 a 21:30 hrs", () => {
      const info: BirthdayInfo = {
        name: "Justina",
        date: "2026-03-07",
        time: "18:30 a 21:30 hrs",
        location: "Home",
      };
      expect(parseStartTime(info.time)).toBe("18:30");
      expect(getEndTime(info)).toBe("21:30");
    });
  });
});
