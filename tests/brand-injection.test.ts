import { describe, it, expect, beforeAll } from "bun:test";
import { loadBrands, getBrandXml } from "../src/brands";

describe("Brand context injection", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  it("should inject brand XML into agent prompt", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    // Get the brander agent config
    const config: any = {
      agent: {},
      command: {},
    };
    await plugin.config(config);

    const branderConfig = config.agent.brander;

    // The prompt should have the $BRAND_XML placeholder
    expect(branderConfig.prompt).toContain("$BRAND_XML");
  });

  it("should have nof1 brand XML available", () => {
    const xml = getBrandXml("nof1");

    expect(xml).toBeDefined();
    expect(xml).toContain('name="nof1"');
    expect(xml).toContain("#dcde8d"); // primary color
  });
});
