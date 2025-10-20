import { describe, it, expect } from "vitest";
import { avatarFallbackInitial } from "./utils";

describe("avatarFallbackInitial", () => {
  describe("with name parameter", () => {
    it("should return first two initials for full name", () => {
      expect(avatarFallbackInitial("John Doe")).toBe("JD");
    });

    it("should return first two initials for three-word name", () => {
      expect(avatarFallbackInitial("John Michael Doe")).toBe("JM");
    });

    it("should return single initial for single name", () => {
      expect(avatarFallbackInitial("John")).toBe("J");
    });

    it("should handle lowercase names", () => {
      expect(avatarFallbackInitial("john doe")).toBe("JD");
    });

    it("should handle names with extra spaces", () => {
      expect(avatarFallbackInitial("John  Doe")).toBe("JD");
    });

    it("should return 'U' for empty string", () => {
      expect(avatarFallbackInitial("")).toBe("U");
    });

    it("should return 'U' for undefined name and displayName", () => {
      expect(avatarFallbackInitial(undefined, undefined)).toBe("U");
    });
  });

  describe("with displayName fallback", () => {
    it("should use displayName when name is undefined", () => {
      expect(avatarFallbackInitial(undefined, "Jane Smith")).toBe("JS");
    });

    it("should prefer name over displayName", () => {
      expect(avatarFallbackInitial("John Doe", "Jane Smith")).toBe("JD");
    });

    it("should use displayName for single word", () => {
      expect(avatarFallbackInitial(undefined, "Jane")).toBe("J");
    });
  });

  describe("edge cases", () => {
    it("should handle names with special characters", () => {
      expect(avatarFallbackInitial("Jean-Pierre Dubois")).toBe("JD");
    });

    it("should handle names with apostrophes", () => {
      expect(avatarFallbackInitial("O'Brien Smith")).toBe("OS");
    });

    it("should handle single character names", () => {
      expect(avatarFallbackInitial("J D")).toBe("JD");
    });

    it("should return 'U' for only whitespace", () => {
      expect(avatarFallbackInitial("   ")).toBe("U");
    });
  });
});
