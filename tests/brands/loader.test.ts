import { describe, expect, it } from "bun:test";

import { getBrand, getBrandJson, listBrands, loadBrands } from "../../src/brands";

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
    expect(brand!.meta.target).toBe("web");
  });

  it("should return undefined for unknown brand", async () => {
    await loadBrands();
    const brand = getBrand("nonexistent");

    expect(brand).toBeUndefined();
  });

  it("should get raw JSON for brand", async () => {
    await loadBrands();
    const json = getBrandJson("nof1");

    expect(json).toBeDefined();
    expect(json).toContain('"name": "nof1"');
    expect(json).toContain("#111111");
  });
});
