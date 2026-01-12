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

    // The prompt should reference skin-definition block
    expect(reskinConfig.prompt).toContain("<skin-definition>");
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

  describe("chat.message hook - skin extraction", () => {
    it("should extract skin name from /skin command", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin nof1" }],
      };

      await hook["chat.message"](input, output);

      // Should have stored the skin request
      expect(hook.getLastSkinRequest()).toBe("nof1");
    });

    it("should extract null when no skin specified", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "/skin" }],
      };

      await hook["chat.message"](input, output);

      expect(hook.getLastSkinRequest()).toBeNull();
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

The skin JSON will be provided in this message.`,
          },
        ],
      };

      await hook["chat.message"](input, output);

      expect(hook.getLastSkinRequest()).toBe("nof1");
    });

    it("should not extract from non-skin messages", async () => {
      const hook = createSkinInjectorHook();

      const input = { sessionID: "test-session" };
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      };

      await hook["chat.message"](input, output);

      // Should remain null (no active skin, no pending request)
      expect(hook.getLastSkinRequest()).toBeNull();
    });
  });

  describe("experimental.chat.messages.transform hook - injection", () => {
    it("should inject skin JSON into last user message", async () => {
      const hook = createSkinInjectorHook();

      // Set up the skin request (normally done by chat.message)
      hook.setLastSkinRequest("nof1");

      const output = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "Analyze this project" }],
          },
        ],
      };

      await hook["experimental.chat.messages.transform"]({}, output);

      // Should have injected skin definition
      expect(output.messages[0].parts.length).toBe(2);
      expect(output.messages[0].parts[1].text).toContain("<skin-definition");
      expect(output.messages[0].parts[1].text).toContain('"name": "nof1"');
      expect(output.messages[0].parts[1].text).toContain("#111111");

      // activeSkin persists for the session (for subsequent LLM calls)
      expect(hook.getLastSkinRequest()).toBe("nof1");
    });

    it("should inject available skins message when no skin specified", async () => {
      const hook = createSkinInjectorHook();

      // Set up null skin request
      hook.setLastSkinRequest(null);

      const output = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "/skin" }],
          },
        ],
      };

      await hook["experimental.chat.messages.transform"]({}, output);

      expect(output.messages[0].parts.length).toBe(2);
      expect(output.messages[0].parts[1].text).toContain("No skin specified");
      expect(output.messages[0].parts[1].text).toContain("nof1");
    });

    it("should inject error for unknown skin", async () => {
      const hook = createSkinInjectorHook();

      hook.setLastSkinRequest("unknown-skin");

      const output = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "/skin unknown-skin" }],
          },
        ],
      };

      await hook["experimental.chat.messages.transform"]({}, output);

      expect(output.messages[0].parts.length).toBe(2);
      expect(output.messages[0].parts[1].text).toContain("not found");
      expect(output.messages[0].parts[1].text).toContain("nof1"); // suggests available
    });

    it("should find the last user message in conversation", async () => {
      const hook = createSkinInjectorHook();

      hook.setLastSkinRequest("nof1");

      const output = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "First message" }],
          },
          {
            info: { role: "assistant" },
            parts: [{ type: "text", text: "Response" }],
          },
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "Second message with /skin" }],
          },
        ],
      };

      await hook["experimental.chat.messages.transform"]({}, output);

      // Should inject into the LAST user message only
      expect(output.messages[0].parts.length).toBe(1); // first user msg unchanged
      expect(output.messages[1].parts.length).toBe(1); // assistant unchanged
      expect(output.messages[2].parts.length).toBe(2); // last user msg has injection
      expect(output.messages[2].parts[1].text).toContain("<skin-definition");
    });
  });

  describe("end-to-end flow", () => {
    it("should extract then inject skin JSON", async () => {
      const hook = createSkinInjectorHook();

      // Step 1: chat.message extracts the skin name
      await hook["chat.message"](
        { sessionID: "test" },
        {
          parts: [
            {
              type: "text",
              text: `Analyze this project.

User request: nof1`,
            },
          ],
        },
      );

      expect(hook.getLastSkinRequest()).toBe("nof1");

      // Step 2: experimental.chat.messages.transform injects the skin JSON
      const output = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "User request: nof1" }],
          },
        ],
      };

      await hook["experimental.chat.messages.transform"]({}, output);

      expect(output.messages[0].parts.length).toBe(2);
      expect(output.messages[0].parts[1].text).toContain("<skin-definition");
      expect(output.messages[0].parts[1].text).toContain('"name": "nof1"');
    });
  });
});
