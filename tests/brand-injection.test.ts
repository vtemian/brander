import { beforeAll, describe, expect, it } from "bun:test";

import { getBrandJson, loadBrands } from "../src/brands";
import { createBrandInjectorHook } from "../src/hooks/brand-injector";

describe("Brand context injection", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  it("should inject brand JSON into agent prompt", async () => {
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

    // The prompt should have the $BRAND_XML placeholder (keeping name for backward compat)
    expect(branderConfig.prompt).toContain("$BRAND_XML");
  });

  it("should have nof1 brand JSON available", () => {
    const json = getBrandJson("nof1");

    expect(json).toBeDefined();
    expect(json).toContain('"name": "nof1"');
    expect(json).toContain("#111111"); // ink color
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
      hook.setCurrentBrandRequest("test-session", "nof1");

      await hook["chat.params"](input, output);

      // $BRAND_XML should be replaced with actual brand JSON
      expect(output.system).not.toContain("$BRAND_XML");
      expect(output.system).toContain('"name": "nof1"');
      expect(output.system).toContain("#111111"); // ink color from nof1 brand
    });

    it("should replace $BRAND_XML with available brands list when no brand specified", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $BRAND_XML placeholder",
      };

      // No brand specified
      hook.setCurrentBrandRequest("test-session", null);

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
      hook.setCurrentBrandRequest("test-session", "unknown-brand");

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

      hook.setCurrentBrandRequest("test-session", "nof1");

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
      expect(hook.getCurrentBrandRequest("test-session")).toBe("nof1");
    });

    it("should handle /brand command without arguments", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/brand" }],
      };

      await hook["chat.message"](input, output);

      // Should be null when no brand specified
      expect(hook.getCurrentBrandRequest("test-session")).toBeNull();
    });

    it("should handle messages without /brand command", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      };

      await hook["chat.message"](input, output);

      // Should remain undefined (not set)
      expect(hook.getCurrentBrandRequest("test-session")).toBeUndefined();
    });

    it("should only match /brand at start of message", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Please use /brand nof1 for styling" }],
      };

      await hook["chat.message"](input, output);

      // Should NOT match /brand in the middle of a message
      expect(hook.getCurrentBrandRequest("test-session")).toBeUndefined();
    });

    it("should isolate brand requests per session", async () => {
      const hook = createBrandInjectorHook();

      // Session 1 requests nof1
      await hook["chat.message"]({ sessionID: "session-1" }, { parts: [{ type: "text", text: "/brand nof1" }] });

      // Session 2 requests a different brand (or none)
      await hook["chat.message"]({ sessionID: "session-2" }, { parts: [{ type: "text", text: "/brand" }] });

      // Each session should have its own brand request
      expect(hook.getCurrentBrandRequest("session-1")).toBe("nof1");
      expect(hook.getCurrentBrandRequest("session-2")).toBeNull();
    });
  });

  describe("chat.params hook - multiple placeholders", () => {
    it("should replace ALL $BRAND_XML placeholders, not just the first", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "First $BRAND_XML and second $BRAND_XML placeholder",
      };

      hook.setCurrentBrandRequest("test-session", "nof1");

      await hook["chat.params"](input, output);

      // Both placeholders should be replaced
      expect(output.system).not.toContain("$BRAND_XML");
      // Should contain brand content twice
      const matches = output.system.match(/"name": "nof1"/g);
      expect(matches?.length).toBe(2);
    });
  });

  describe("chat.params hook - no prior /brand command", () => {
    it("should remove placeholder when no /brand command was issued", async () => {
      const hook = createBrandInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $BRAND_XML placeholder",
      };

      // No setCurrentBrandRequest called - simulating no /brand command

      await hook["chat.params"](input, output);

      // Placeholder should be removed or handled gracefully, not left as literal
      expect(output.system).not.toContain("$BRAND_XML");
    });
  });

  describe("end-to-end flow", () => {
    it("should inject brand JSON after /brand command in message flow", async () => {
      const hook = createBrandInjectorHook();
      const sessionID = "e2e-test-session";

      // Step 1: User sends /brand nof1 message
      await hook["chat.message"]({ sessionID }, { parts: [{ type: "text", text: "/brand nof1" }] });

      // Step 2: chat.params is called to build the system prompt
      const paramsOutput = {
        system: "You are a branding assistant. Brand context: $BRAND_XML",
      };
      await hook["chat.params"]({ sessionID }, paramsOutput);

      // Step 3: Verify brand JSON is in system prompt
      expect(paramsOutput.system).not.toContain("$BRAND_XML");
      expect(paramsOutput.system).toContain('"name": "nof1"');
      expect(paramsOutput.system).toContain("#111111"); // nof1 ink color
    });
  });

  describe("session cleanup", () => {
    it("should clean up session state after brand injection", async () => {
      const hook = createBrandInjectorHook();
      const sessionID = "cleanup-test-session";

      // Set up a brand request
      hook.setCurrentBrandRequest(sessionID, "nof1");
      expect(hook.getCurrentBrandRequest(sessionID)).toBe("nof1");

      // Trigger injection via chat.params
      const output = {
        system: "Brand context: $BRAND_XML",
      };
      await hook["chat.params"]({ sessionID }, output);

      // Session state should be cleaned up after injection
      expect(hook.getCurrentBrandRequest(sessionID)).toBeUndefined();
    });
  });
});
