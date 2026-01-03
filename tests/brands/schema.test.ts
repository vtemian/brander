import { describe, it, expect } from "bun:test";
import type { Brand } from "../../src/brands/schema";

describe("Brand schema types", () => {
  it("should define Brand interface with required sections", () => {
    const brand: Brand = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test brand",
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

    expect(brand.name).toBe("test");
    expect(brand.meta.target).toBe("web");
  });

  it("should allow optional sections", () => {
    const brand: Brand = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test brand",
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

    expect(brand.components).toBeDefined();
    expect(brand.voice).toBeDefined();
    expect(brand.guidelines).toBeDefined();
  });
});
