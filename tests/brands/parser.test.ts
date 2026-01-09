import { describe, expect, it } from "bun:test";

import { parseBrandJson } from "../../src/brands/parser";

const MINIMAL_BRAND_JSON = JSON.stringify({
  name: "test",
  version: "1.0",
  meta: {
    description: "Test brand",
    target: "web",
  },
  colors: {
    palette: [{ name: "primary", value: "#dcde8d", description: "Primary color" }],
    semantic: [{ name: "background", light: "#ffffff", dark: "#1a1a1a" }],
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

describe("parseBrandJson", () => {
  it("should parse minimal brand JSON", () => {
    const brand = parseBrandJson(MINIMAL_BRAND_JSON);

    expect(brand.name).toBe("test");
    expect(brand.version).toBe("1.0");
    expect(brand.meta.description).toBe("Test brand");
    expect(brand.meta.target).toBe("web");
  });

  it("should parse colors section", () => {
    const brand = parseBrandJson(MINIMAL_BRAND_JSON);

    expect(brand.colors.palette).toHaveLength(1);
    expect(brand.colors.palette[0].name).toBe("primary");
    expect(brand.colors.palette[0].value).toBe("#dcde8d");
    expect(brand.colors.palette[0].description).toBe("Primary color");

    expect(brand.colors.semantic).toHaveLength(1);
    expect(brand.colors.semantic[0].name).toBe("background");
    expect(brand.colors.semantic[0].light).toBe("#ffffff");
    expect(brand.colors.semantic[0].dark).toBe("#1a1a1a");
  });

  it("should parse typography section", () => {
    const brand = parseBrandJson(MINIMAL_BRAND_JSON);

    expect(brand.typography.fonts).toHaveLength(1);
    expect(brand.typography.fonts[0].role).toBe("sans");
    expect(brand.typography.fonts[0].family).toBe("Inter");

    expect(brand.typography.scale).toHaveLength(1);
    expect(brand.typography.scale[0].name).toBe("base");
    expect(brand.typography.scale[0].size).toBe("14px");
  });

  it("should parse spacing and radius", () => {
    const brand = parseBrandJson(MINIMAL_BRAND_JSON);

    expect(brand.spacing.unit).toBe("0.25rem");
    expect(brand.radius.sizes).toHaveLength(1);
    expect(brand.radius.sizes[0].name).toBe("md");
  });

  it("should throw on invalid JSON", () => {
    expect(() => parseBrandJson("not json")).toThrow();
  });

  it("should throw on empty input", () => {
    expect(() => parseBrandJson("")).toThrow();
  });

  it("should throw on missing required sections", () => {
    const invalidJson = JSON.stringify({ name: "test", version: "1.0", meta: { description: "Test", target: "web" } });
    expect(() => parseBrandJson(invalidJson)).toThrow(/colors/i);
  });

  it("should throw when name is missing", () => {
    const jsonWithoutName = JSON.stringify({
      version: "1.0",
      meta: { description: "Test brand", target: "web" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseBrandJson(jsonWithoutName)).toThrow(/name/i);
  });

  it("should throw when version is missing", () => {
    const jsonWithoutVersion = JSON.stringify({
      name: "test",
      meta: { description: "Test brand", target: "web" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseBrandJson(jsonWithoutVersion)).toThrow(/version/i);
  });

  it("should throw for invalid target value", () => {
    const jsonWithInvalidTarget = JSON.stringify({
      name: "test",
      version: "1.0",
      meta: { description: "Test brand", target: "desktop" },
      colors: { palette: [], semantic: [] },
      typography: { fonts: [], scale: [] },
      spacing: { unit: "0.25rem" },
      radius: { sizes: [] },
    });
    expect(() => parseBrandJson(jsonWithInvalidTarget)).toThrow(/target/i);
  });
});
