import { describe, expect, it } from "bun:test";

import { getSkin, getSkinJson, listSkins, loadSkins } from "../../src/skins";

describe("Skin loader", () => {
  it("should load bundled skins on init", async () => {
    await loadSkins();
    const skins = listSkins();

    expect(skins.length).toBeGreaterThan(0);
    expect(skins).toContain("nof1");
  });

  it("should get skin by name", async () => {
    await loadSkins();
    const skin = getSkin("nof1");

    expect(skin).toBeDefined();
    expect(skin!.name).toBe("nof1");
    expect(skin!.meta.target).toBe("web");
  });

  it("should return undefined for unknown skin", async () => {
    await loadSkins();
    const skin = getSkin("nonexistent");

    expect(skin).toBeUndefined();
  });

  it("should get raw JSON for skin", async () => {
    await loadSkins();
    const json = getSkinJson("nof1");

    expect(json).toBeDefined();
    expect(json).toContain('"name": "nof1"');
    expect(json).toContain("#111111");
  });
});
