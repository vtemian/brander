import { describe, it, expect, beforeAll } from "bun:test";
import { loadBrands, getBrandXml, listBrands } from "../src/brands";
import { createBrandInjectorHook } from "../src/hooks/brand-injector";

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

describe("Brand injector hook", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  describe("chat.params hook", () => {
    it("should replace $BRAND_XML with brand content when brand name is in message", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $BRAND_XML placeholder",
      };

      // Simulate a message containing the brand name
      hook.setCurrentBrandRequest("nof1");

      await hook["chat.params"](input, output);

      // $BRAND_XML should be replaced with actual brand XML
      expect(output.system).not.toContain("$BRAND_XML");
      expect(output.system).toContain('name="nof1"');
      expect(output.system).toContain("#dcde8d"); // primary color from nof1 brand
    });

    it("should replace $BRAND_XML with available brands list when no brand specified", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $BRAND_XML placeholder",
      };

      // No brand specified
      hook.setCurrentBrandRequest(null);

      await hook["chat.params"](input, output);

      // $BRAND_XML should be replaced with available brands message
      expect(output.system).not.toContain("$BRAND_XML");
      expect(output.system).toContain("No brand specified");
      expect(output.system).toContain("nof1"); // available brand
    });

    it("should replace $BRAND_XML with error message for unknown brand", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $BRAND_XML placeholder",
      };

      // Unknown brand
      hook.setCurrentBrandRequest("unknown-brand");

      await hook["chat.params"](input, output);

      // $BRAND_XML should be replaced with error message
      expect(output.system).not.toContain("$BRAND_XML");
      expect(output.system).toContain("Brand 'unknown-brand' not found");
      expect(output.system).toContain("nof1"); // suggest available brands
    });

    it("should not modify system prompt without $BRAND_XML placeholder", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt without placeholder",
      };

      hook.setCurrentBrandRequest("nof1");

      await hook["chat.params"](input, output);

      // Should remain unchanged
      expect(output.system).toBe("Some system prompt without placeholder");
    });
  });

  describe("chat.message hook", () => {
    it("should extract brand name from /brand command arguments", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/brand nof1" }],
      };

      await hook["chat.message"](input, output);

      // Internal state should have the brand name
      expect(hook.getCurrentBrandRequest()).toBe("nof1");
    });

    it("should handle /brand command without arguments", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/brand" }],
      };

      await hook["chat.message"](input, output);

      // Should be null when no brand specified
      expect(hook.getCurrentBrandRequest()).toBeNull();
    });

    it("should handle messages without /brand command", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      };

      await hook["chat.message"](input, output);

      // Should remain undefined (not set)
      expect(hook.getCurrentBrandRequest()).toBeUndefined();
    });
  });
});
