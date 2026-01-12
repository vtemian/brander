import { describe, expect, it } from "bun:test";

import type { Skin } from "../../src/skins/schema";

describe("Skin schema types", () => {
  it("should define Skin interface with required sections", () => {
    const skin: Skin = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test skin",
        target: "web",
      },
      colors: {
        palette: [{ name: "primary", value: "#000000" }],
        semantic: [],
      },
      typography: {
        fonts: [{ role: "sans", family: "Inter", fallback: "sans-serif" }],
        scale: [{ name: "base", size: "14px", lineHeight: "1.5" }],
      },
      spacing: {
        unit: "0.25rem",
      },
      radius: {
        sizes: [{ name: "md", value: "0.375rem" }],
      },
    };

    expect(skin.name).toBe("test");
    expect(skin.meta.target).toBe("web");
  });

  it("should allow optional sections", () => {
    const skin: Skin = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test skin",
        target: "web",
      },
      colors: {
        palette: [],
        semantic: [],
      },
      typography: {
        fonts: [],
        scale: [],
      },
      spacing: {
        unit: "0.25rem",
      },
      radius: {
        sizes: [],
      },
      components: {
        buttons: [],
        cards: [],
      },
      voice: {
        tone: "Direct",
        principles: [],
      },
      guidelines: {
        dos: [],
        donts: [],
      },
    };

    expect(skin.components).toBeDefined();
    expect(skin.voice).toBeDefined();
    expect(skin.guidelines).toBeDefined();
  });
});
