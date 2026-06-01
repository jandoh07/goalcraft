import { describe, it, expect } from "vitest";
import { parseInitialState } from "./non-negotiable-recurrence";

describe("parseInitialState", () => {
  describe("daily", () => {
    it("returns daily when all 7 days are present", () => {
      const tags = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      expect(parseInitialState(tags)).toEqual({
        active: "daily",
        customFrequency: null,
        interval: 1,
        selectedDays: [],
        selectedMonthDayNumbers: [],
      });
    });

    it("deduplicates tags before checking", () => {
      const tags = ["sun", "sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      expect(parseInitialState(tags)).toEqual(
        expect.objectContaining({ active: "daily" }),
      );
    });
  });

  describe("weekdays", () => {
    it("returns weekdays when mon-fri are present", () => {
      const tags = ["mon", "tue", "wed", "thu", "fri"];
      expect(parseInitialState(tags)).toEqual(
        expect.objectContaining({ active: "weekdays" }),
      );
    });
  });

  describe("weekends", () => {
    it("returns weekends when sat and sun are present", () => {
      const tags = ["sat", "sun"];
      expect(parseInitialState(tags)).toEqual(
        expect.objectContaining({ active: "weekends" }),
      );
    });
  });

  describe("weekly", () => {
    it("returns weekly for a single day tag", () => {
      expect(parseInitialState(["mon"])).toEqual(
        expect.objectContaining({ active: "weekly" }),
      );
    });

    it("returns weekly for any single valid day", () => {
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      days.forEach((day) => {
        expect(parseInitialState([day])).toEqual(
          expect.objectContaining({ active: "weekly" }),
        );
      });
    });
  });

  describe("monthly", () => {
    it("returns monthly for a single xM tag", () => {
      expect(parseInitialState(["1M"])).toEqual(
        expect.objectContaining({ active: "monthly" }),
      );
    });
  });

  describe("custom Xdays", () => {
    it("returns Xdays with correct interval", () => {
      const tags = ["3D_0", "3D_1", "3D_2"];
      expect(parseInitialState(tags)).toEqual({
        active: "custom",
        customFrequency: "Xdays",
        interval: 3,
        selectedDays: [],
        selectedMonthDayNumbers: [],
      });
    });
  });

  describe("custom Xweeks", () => {
    it("returns Xweeks with correct interval and selectedDays", () => {
      const tags = ["mon_2W_0", "wed_2W_1"];
      expect(parseInitialState(tags)).toEqual({
        active: "custom",
        customFrequency: "Xweeks",
        interval: 2,
        selectedDays: ["mon", "wed"],
        selectedMonthDayNumbers: [],
      });
    });

    it("deduplicates and sorts selectedDays", () => {
      const tags = ["wed_1W_0", "mon_1W_1", "mon_1W_2"];
      const result = parseInitialState(tags);
      expect(result.selectedDays).toEqual(["mon", "wed"]);
    });
  });

  describe("custom Xmonths", () => {
    it("returns Xmonths with correct interval and selectedMonthDayNumbers", () => {
      const tags = ["2M_0_15", "2M_1_28"];
      expect(parseInitialState(tags)).toEqual({
        active: "custom",
        customFrequency: "Xmonths",
        interval: 2,
        selectedDays: [],
        selectedMonthDayNumbers: [15, 28],
      });
    });

    it("handles last_day tag", () => {
      const tags = ["1M_0_1", "last_day"];
      expect(parseInitialState(tags)).toEqual(
        expect.objectContaining({
          active: "custom",
          customFrequency: "Xmonths",
        }),
      );
    });
  });

  describe("fallback", () => {
    it("returns null active for empty tags", () => {
      expect(parseInitialState([])).toEqual({
        active: null,
        customFrequency: null,
        interval: 1,
        selectedDays: [],
        selectedMonthDayNumbers: [],
      });
    });

    it("returns null active for unrecognized tags", () => {
      expect(parseInitialState(["garbage", "tags"])).toEqual(
        expect.objectContaining({ active: null }),
      );
    });
  });
});
