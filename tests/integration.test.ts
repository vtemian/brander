import { beforeAll, describe, expect, it } from "bun:test";

import { agents, PRIMARY_AGENT_NAME } from "../src/agents";
import { getSkin, loadSkins } from "../src/skins";

describe("Reskin plugin integration", () => {
  beforeAll(async () => {
    await loadSkins();
  });

  describe("Skin loading", () => {
    it("should load nof1 skin with all required sections", () => {
      const skin = getSkin("nof1");

      expect(skin).toBeDefined();
      expect(skin!.name).toBe("nof1");
      expect(skin!.version).toBe("1.1");

      // Required sections
      expect(skin!.meta).toBeDefined();
      expect(skin!.colors).toBeDefined();
      expect(skin!.typography).toBeDefined();
      expect(skin!.spacing).toBeDefined();
      expect(skin!.radius).toBeDefined();

      // Optional sections (present in nof1)
      expect(skin!.voice).toBeDefined();
      expect(skin!.guidelines).toBeDefined();
    });

    it("should have correct nof1 color palette", () => {
      const skin = getSkin("nof1");
      const ink = skin!.colors.palette.find((c) => c.name === "ink");
      const paper = skin!.colors.palette.find((c) => c.name === "paper");

      expect(ink?.value).toBe("#111111");
      expect(paper?.value).toBe("#ffffff");
    });

    it("should have correct nof1 typography", () => {
      const skin = getSkin("nof1");
      const monoFont = skin!.typography.fonts.find((f) => f.role === "mono");

      expect(monoFont?.family).toBe("'IBM Plex Mono'");
    });
  });

  describe("Agent configuration", () => {
    it("should have reskin as primary agent", () => {
      expect(PRIMARY_AGENT_NAME).toBe("reskin");
      expect(agents.reskin.mode).toBe("primary");
    });

    it("should have subagents with read-only tools", () => {
      expect(agents["style-analyzer"].tools?.write).toBe(false);
      expect(agents["style-analyzer"].tools?.edit).toBe(false);
      expect(agents["component-scanner"].tools?.write).toBe(false);
      expect(agents["component-scanner"].tools?.edit).toBe(false);
    });

    it("should have reskin with write enabled but edit disabled", () => {
      expect(agents.reskin.tools?.write).toBe(true);
      expect(agents.reskin.tools?.edit).toBe(false);
    });
  });

  describe("Full plugin initialization", () => {
    it("should initialize without errors", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };

      const plugin = await pluginModule.default(mockCtx);

      expect(plugin).toBeDefined();
      expect(plugin.config).toBeDefined();
    });

    it("should configure all components", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      const config: any = {
        agent: {},
        command: {},
      };

      await plugin.config(config);

      // Agents registered
      expect(Object.keys(config.agent)).toContain("reskin");
      expect(Object.keys(config.agent)).toContain("style-analyzer");
      expect(Object.keys(config.agent)).toContain("component-scanner");

      // Command registered
      expect(config.command.skin).toBeDefined();
      expect(config.command.skin.agent).toBe("reskin");
    });
  });

  describe("Skin JSON injection end-to-end", () => {
    it("should inject skin JSON via two-phase hook flow", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      // Phase 1: chat.message extracts skin name
      const messageInput = { sessionID: "test-session" };
      const messageOutput = {
        parts: [{ type: "text", text: "/skin nof1" }],
      };
      await plugin["chat.message"](messageInput, messageOutput);

      // Phase 2: experimental.chat.messages.transform injects skin JSON
      const transformOutput = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "/skin nof1" }],
          },
        ],
      };
      await plugin["experimental.chat.messages.transform"]({}, transformOutput);

      // Skin JSON should be injected into the last user message
      expect(transformOutput.messages[0].parts.length).toBe(2);
      expect(transformOutput.messages[0].parts[1].text).toContain("<skin-definition");
      expect(transformOutput.messages[0].parts[1].text).toContain('"name": "nof1"');
      expect(transformOutput.messages[0].parts[1].text).toContain("#111111");
    });

    it("should show available skins when /skin command has no argument", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      // Phase 1: chat.message extracts null skin
      const messageInput = { sessionID: "test-session-2" };
      const messageOutput = {
        parts: [{ type: "text", text: "/skin" }],
      };
      await plugin["chat.message"](messageInput, messageOutput);

      // Phase 2: experimental.chat.messages.transform injects available skins message
      const transformOutput = {
        messages: [
          {
            info: { role: "user" },
            parts: [{ type: "text", text: "/skin" }],
          },
        ],
      };
      await plugin["experimental.chat.messages.transform"]({}, transformOutput);

      // Should show available skins message
      expect(transformOutput.messages[0].parts.length).toBe(2);
      expect(transformOutput.messages[0].parts[1].text).toContain("No skin specified");
      expect(transformOutput.messages[0].parts[1].text).toContain("nof1");
    });
  });
});
