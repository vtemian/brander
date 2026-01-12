import { beforeAll, describe, expect, it } from "bun:test";

import { createSkinInjectorHook } from "../src/hooks/skin-injector";
import { getSkinJson, loadSkins } from "../src/skins";

describe("Skin context injection", () => {
  beforeAll(async () => {
    await loadSkins();
  });

  it("should inject skin JSON into agent prompt", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    // Get the reskin agent config
    const config: any = {
      agent: {},
      command: {},
    };
    await plugin.config(config);

    const reskinConfig = config.agent.reskin;

    // The prompt should have the $SKIN_JSON placeholder (keeping name for backward compat)
    expect(reskinConfig.prompt).toContain("$SKIN_JSON");
  });

  it("should have nof1 skin JSON available", () => {
    const json = getSkinJson("nof1");

    expect(json).toBeDefined();
    expect(json).toContain('"name": "nof1"');
    expect(json).toContain("#111111"); // ink color
  });
});

describe("Skin injector hook", () => {
  beforeAll(async () => {
    await loadSkins();
  });

  describe("chat.params hook", () => {
    it("should replace $SKIN_JSON with skin content when skin name is in message", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $SKIN_JSON placeholder",
      };

      // Simulate a message containing the skin name
      hook.setCurrentSkinRequest("test-session", "nof1");

      await hook["chat.params"](input, output);

      // $SKIN_JSON should be replaced with actual skin JSON
      expect(output.system).not.toContain("$SKIN_JSON");
      expect(output.system).toContain('"name": "nof1"');
      expect(output.system).toContain("#111111"); // ink color from nof1 skin
    });

    it("should replace $SKIN_JSON with available skins list when no skin specified", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $SKIN_JSON placeholder",
      };

      // No skin specified
      hook.setCurrentSkinRequest("test-session", null);

      await hook["chat.params"](input, output);

      // $SKIN_JSON should be replaced with available skins message
      expect(output.system).not.toContain("$SKIN_JSON");
      expect(output.system).toContain("No skin specified");
      expect(output.system).toContain("nof1"); // available skin
    });

    it("should replace $SKIN_JSON with error message for unknown skin", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $SKIN_JSON placeholder",
      };

      // Unknown skin
      hook.setCurrentSkinRequest("test-session", "unknown-skin");

      await hook["chat.params"](input, output);

      // $SKIN_JSON should be replaced with error message
      expect(output.system).not.toContain("$SKIN_JSON");
      expect(output.system).toContain("Skin 'unknown-skin' not found");
      expect(output.system).toContain("nof1"); // suggest available skins
    });

    it("should not modify system prompt without $SKIN_JSON placeholder", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt without placeholder",
      };

      hook.setCurrentSkinRequest("test-session", "nof1");

      await hook["chat.params"](input, output);

      // Should remain unchanged
      expect(output.system).toBe("Some system prompt without placeholder");
    });
  });

  describe("chat.message hook", () => {
    it("should extract skin name from /skin command arguments", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin nof1" }],
      };

      await hook["chat.message"](input, output);

      // Internal state should have the skin name
      expect(hook.getCurrentSkinRequest("test-session")).toBe("nof1");
    });

    it("should handle /skin command without arguments", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin" }],
      };

      await hook["chat.message"](input, output);

      // Should be null when no skin specified
      expect(hook.getCurrentSkinRequest("test-session")).toBeNull();
    });

    it("should handle messages without /skin command", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      };

      await hook["chat.message"](input, output);

      // Should remain undefined (not set)
      expect(hook.getCurrentSkinRequest("test-session")).toBeUndefined();
    });

    it("should only match /skin at start of message", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Please use /skin nof1 for styling" }],
      };

      await hook["chat.message"](input, output);

      // Should NOT match /skin in the middle of a message
      expect(hook.getCurrentSkinRequest("test-session")).toBeUndefined();
    });

    it("should isolate skin requests per session", async () => {
      const hook = createSkinInjectorHook();

      // Session 1 requests nof1
      await hook["chat.message"]({ sessionID: "session-1" }, { parts: [{ type: "text", text: "/skin nof1" }] });

      // Session 2 requests a different skin (or none)
      await hook["chat.message"]({ sessionID: "session-2" }, { parts: [{ type: "text", text: "/skin" }] });

      // Each session should have its own skin request
      expect(hook.getCurrentSkinRequest("session-1")).toBe("nof1");
      expect(hook.getCurrentSkinRequest("session-2")).toBeNull();
    });
  });

  describe("chat.params hook - multiple placeholders", () => {
    it("should replace ALL $SKIN_JSON placeholders, not just the first", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "First $SKIN_JSON and second $SKIN_JSON placeholder",
      };

      hook.setCurrentSkinRequest("test-session", "nof1");

      await hook["chat.params"](input, output);

      // Both placeholders should be replaced
      expect(output.system).not.toContain("$SKIN_JSON");
      // Should contain skin content twice
      const matches = output.system.match(/"name": "nof1"/g);
      expect(matches?.length).toBe(2);
    });
  });

  describe("chat.params hook - no prior /skin command", () => {
    it("should remove placeholder when no /skin command was issued", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        system: "Some system prompt with $SKIN_JSON placeholder",
      };

      // No setCurrentSkinRequest called - simulating no /skin command

      await hook["chat.params"](input, output);

      // Placeholder should be removed or handled gracefully, not left as literal
      expect(output.system).not.toContain("$SKIN_JSON");
    });
  });

  describe("end-to-end flow", () => {
    it("should inject skin JSON after /skin command in message flow", async () => {
      const hook = createSkinInjectorHook();
      const sessionID = "e2e-test-session";

      // Step 1: User sends /skin nof1 message
      await hook["chat.message"]({ sessionID }, { parts: [{ type: "text", text: "/skin nof1" }] });

      // Step 2: chat.params is called to build the system prompt
      const paramsOutput = {
        system: "You are a skining assistant. Skin context: $SKIN_JSON",
      };
      await hook["chat.params"]({ sessionID }, paramsOutput);

      // Step 3: Verify skin JSON is in system prompt
      expect(paramsOutput.system).not.toContain("$SKIN_JSON");
      expect(paramsOutput.system).toContain('"name": "nof1"');
      expect(paramsOutput.system).toContain("#111111"); // nof1 ink color
    });
  });

  describe("session cleanup", () => {
    it("should clean up session state after skin injection", async () => {
      const hook = createSkinInjectorHook();
      const sessionID = "cleanup-test-session";

      // Set up a skin request
      hook.setCurrentSkinRequest(sessionID, "nof1");
      expect(hook.getCurrentSkinRequest(sessionID)).toBe("nof1");

      // Trigger injection via chat.params
      const output = {
        system: "Skin context: $SKIN_JSON",
      };
      await hook["chat.params"]({ sessionID }, output);

      // Session state should be cleaned up after injection
      expect(hook.getCurrentSkinRequest(sessionID)).toBeUndefined();
    });
  });
});
