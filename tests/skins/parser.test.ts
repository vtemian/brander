import { describe, expect, it } from "bun:test";

import { parseSkinJson } from "../../src/skins/parser";

const MINIMAL_SKIN_JSON = JSON.stringify({
  name: "test",
  version: "1.0",
  meta: {
    description: "Test skin",
    target: "web",
  },
  colors: {
    palette: [{ name: "primary", value: "#0000ff", description: "Primary color" }],
    semantic: [{ name: "background", value: "#ffffff" }],
  },
  typography: {
    fonts: [{ role: "sans", family: "Inter", fallback: "system-ui, sans-serif" }],
    scale: [{ name: "base", size: "14px", lineHeight: "1.5" }],
  },
  spacing: { unit: "0.25rem" },
  radius: {
    sizes: [{ name: "md", value: "0.375rem" }],
  },
});

describe("parseSkinJson", () => {
  it("should parse minimal skin JSON", () => {
    const skin = parseSkinJson(MINIMAL_SKIN_JSON);

    expect(skin.name).toBe("test");
    expect(skin.version).toBe("1.0");
    expect(skin.meta.description).toBe("Test skin");
    expect(skin.meta.target).toBe("web");
  });

  it("should parse colors section", () => {
    const skin = parseSkinJson(MINIMAL_SKIN_JSON);

    expect(skin.colors.palette).toHaveLength(1);
    expect(skin.colors.palette[0].name).toBe("primary");
    expect(skin.colors.palette[0].value).toBe("#0000ff");
    expect(skin.colors.palette[0].description).toBe("Primary color");

    expect(skin.colors.semantic).toHaveLength(1);
    expect(skin.colors.semantic[0].name).toBe("background");
    expect(skin.colors.semantic[0].value).toBe("#ffffff");
  });

  it("should parse typography section", () => {
    const skin = parseSkinJson(MINIMAL_SKIN_JSON);

    expect(skin.typography.fonts).toHaveLength(1);
    expect(skin.typography.fonts[0].role).toBe("sans");
    expect(skin.typography.fonts[0].family).toBe("Inter");

    expect(skin.typography.scale).toHaveLength(1);
    expect(skin.typography.scale[0].name).toBe("base");
    expect(skin.typography.scale[0].size).toBe("14px");
  });

  it("should parse spacing and radius", () => {
    const skin = parseSkinJson(MINIMAL_SKIN_JSON);

    expect(skin.spacing.unit).toBe("0.25rem");
    expect(skin.radius.sizes).toHaveLength(1);
    expect(skin.radius.sizes[0].name).toBe("md");
  });

  it("should throw on invalid JSON", () => {
    expect(() => parseSkinJson("not json")).toThrow();
  });

  it("should throw on empty input", () => {
    expect(() => parseSkinJson("")).toThrow();
  });

  it("should throw on missing required sections", () => {
    const invalidJson = JSON.stringify({ name: "test", version: "1.0", meta: { description: "Test", target: "web" } });
    expect(() => parseSkinJson(invalidJson)).toThrow(/colors/i);
  });

  it("should throw when name is missing", () => {
    const jsonWithoutName = JSON.stringify({
      version: "1.0",
      meta: { description: "Test skin", target: "web" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseSkinJson(jsonWithoutName)).toThrow(/name/i);
  });

  it("should throw when version is missing", () => {
    const jsonWithoutVersion = JSON.stringify({
      name: "test",
      meta: { description: "Test skin", target: "web" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseSkinJson(jsonWithoutVersion)).toThrow(/version/i);
  });

  it("should throw for invalid target value", () => {
    const jsonWithInvalidTarget = JSON.stringify({
      name: "test",
      version: "1.0",
      meta: { description: "Test skin", target: "desktop" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseSkinJson(jsonWithInvalidTarget)).toThrow(/target/i);
  });
});
