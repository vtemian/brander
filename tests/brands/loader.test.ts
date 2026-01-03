import { describe, it, expect } from "bun:test";
import { loadBrands, getBrand, listBrands, getBrandXml } from "../../src/brands";

describe("Brand loader", () => {
  it("should load bundled brands on init", async () => {
    await loadBrands();
    const brands = listBrands();

    expect(brands.length).toBeGreaterThan(0);
    expect(brands).toContain("nof1");
  });

  it("should get brand by name", async () => {
    await loadBrands();
    const brand = getBrand("nof1");

    expect(brand).toBeDefined();
    expect(brand!.name).toBe("nof1");
    expect(brand!.meta.description).toContain("OpenCode");
  });

  it("should return undefined for unknown brand", async () => {
    await loadBrands();
    const brand = getBrand("nonexistent");

    expect(brand).toBeUndefined();
  });

  it("should get raw XML for brand", async () => {
    await loadBrands();
    const xml = getBrandXml("nof1");

    expect(xml).toBeDefined();
    expect(xml).toContain("<brand");
    expect(xml).toContain('name="nof1"');
  });
});
