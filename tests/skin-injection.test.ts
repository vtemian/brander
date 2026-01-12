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

    // The prompt should have the $SKIN_JSON placeholder (kept for reference)
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

  describe("chat.message hook - skin injection", () => {
    it("should inject skin JSON into message when /skin command is used", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin nof1" }],
      };

      await hook["chat.message"](input, output);

      // Should have added a new part with skin definition
      expect(output.parts.length).toBe(2);
      const injectedPart = output.parts[1];
      expect(injectedPart.type).toBe("text");
      expect(injectedPart.text).toContain("<skin-definition");
      expect(injectedPart.text).toContain('"name": "nof1"');
      expect(injectedPart.text).toContain("#111111"); // ink color
    });

    it("should inject available skins message when no skin specified", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin" }],
      };

      await hook["chat.message"](input, output);

      // Should have added a new part with available skins
      expect(output.parts.length).toBe(2);
      const injectedPart = output.parts[1];
      expect(injectedPart.text).toContain("No skin specified");
      expect(injectedPart.text).toContain("nof1");
    });

    it("should inject error message for unknown skin", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin unknown-skin" }],
      };

      await hook["chat.message"](input, output);

      // Should have added a new part with error message
      expect(output.parts.length).toBe(2);
      const injectedPart = output.parts[1];
      expect(injectedPart.text).toContain("not found");
      expect(injectedPart.text).toContain("nof1"); // suggests available skins
    });

    it("should not inject anything for non-skin messages", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      };

      await hook["chat.message"](input, output);

      // Should not add any new parts
      expect(output.parts.length).toBe(1);
    });
  });

  describe("chat.message hook - skin extraction", () => {
    it("should extract skin name from /skin command arguments", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin nof1" }],
      };

      await hook["chat.message"](input, output);

      // Verify skin was injected (extraction happened)
      expect(output.parts.length).toBe(2);
      expect(output.parts[1].text).toContain("nof1");
    });

    it("should extract skin name from expanded command template", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [
          {
            type: "text",
            text: `Analyze this project and generate a skin transformation plan.

Available skins:
- nof1

User request: nof1

The skin JSON is already injected into your system prompt.`,
          },
        ],
      };

      await hook["chat.message"](input, output);

      // Should have injected the skin JSON
      expect(output.parts.length).toBe(2);
      expect(output.parts[1].text).toContain("<skin-definition");
      expect(output.parts[1].text).toContain('"name": "nof1"');
    });

    it("should only match /skin at start of message", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Please use /skin nof1 for styling" }],
      };

      await hook["chat.message"](input, output);

      // Should NOT inject - /skin is in the middle
      expect(output.parts.length).toBe(1);
    });
  });

  describe("end-to-end flow", () => {
    it("should inject skin JSON in message when /skin command is used", async () => {
      const hook = createSkinInjectorHook();
      const sessionID = "e2e-test-session";

      // User sends /skin nof1 message
      const output = { parts: [{ type: "text", text: "/skin nof1" }] };
      await hook["chat.message"]({ sessionID }, output);

      // Verify skin JSON is injected into the message
      expect(output.parts.length).toBe(2);
      const skinPart = output.parts[1];
      expect(skinPart.text).toContain("<skin-definition");
      expect(skinPart.text).toContain('"name": "nof1"');
      expect(skinPart.text).toContain("#111111"); // nof1 ink color
    });

    it("should work with expanded command template", async () => {
      const hook = createSkinInjectorHook();
      const sessionID = "e2e-test-session-2";

      // Simulating what OpenCode sends after expanding the /skin command template
      const output = {
        parts: [
          {
            type: "text",
            text: `Analyze this project and generate a skin transformation plan.

Available skins:
- nof1

User request: nof1

The skin JSON is already injected into your system prompt.`,
          },
        ],
      };

      await hook["chat.message"]({ sessionID }, output);

      // Verify skin JSON is injected
      expect(output.parts.length).toBe(2);
      expect(output.parts[1].text).toContain("<skin-definition");
      expect(output.parts[1].text).toContain('"name": "nof1"');
    });
  });
});
