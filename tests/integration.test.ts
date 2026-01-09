import { beforeAll, describe, expect, it } from "bun:test";

import { agents, PRIMARY_AGENT_NAME } from "../src/agents";
import { getBrand, loadBrands } from "../src/brands";

describe("Brander plugin integration", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  describe("Brand loading", () => {
    it("should load nof1 brand with all required sections", () => {
      const brand = getBrand("nof1");

      expect(brand).toBeDefined();
      expect(brand!.name).toBe("nof1");
      expect(brand!.version).toBe("1.0");

      // Required sections
      expect(brand!.meta).toBeDefined();
      expect(brand!.colors).toBeDefined();
      expect(brand!.typography).toBeDefined();
      expect(brand!.spacing).toBeDefined();
      expect(brand!.radius).toBeDefined();

      // Optional sections (present in nof1)
      expect(brand!.voice).toBeDefined();
      expect(brand!.guidelines).toBeDefined();
    });

    it("should have correct nof1 color palette", () => {
      const brand = getBrand("nof1");
      const primary = brand!.colors.palette.find((c) => c.name === "primary");
      const secondary = brand!.colors.palette.find((c) => c.name === "secondary");

      expect(primary?.value).toBe("#0000ff");
      expect(secondary?.value).toBe("#8b5cf6");
    });

    it("should have correct nof1 typography", () => {
      const brand = getBrand("nof1");
      const monoFont = brand!.typography.fonts.find((f) => f.role === "mono");

      expect(monoFont?.family).toBe("IBM Plex Mono");
    });
  });

  describe("Agent configuration", () => {
    it("should have brander as primary agent", () => {
      expect(PRIMARY_AGENT_NAME).toBe("brander");
      expect(agents.brander.mode).toBe("primary");
    });

    it("should have subagents with read-only tools", () => {
      expect(agents["style-analyzer"].tools?.write).toBe(false);
      expect(agents["style-analyzer"].tools?.edit).toBe(false);
      expect(agents["component-scanner"].tools?.write).toBe(false);
      expect(agents["component-scanner"].tools?.edit).toBe(false);
    });

    it("should have brander with read-only tools", () => {
      expect(agents.brander.tools?.write).toBe(false);
      expect(agents.brander.tools?.edit).toBe(false);
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
      expect(Object.keys(config.agent)).toContain("brander");
      expect(Object.keys(config.agent)).toContain("style-analyzer");
      expect(Object.keys(config.agent)).toContain("component-scanner");

      // Command registered
      expect(config.command.brand).toBeDefined();
      expect(config.command.brand.agent).toBe("brander");
    });
  });

  describe("Brand JSON injection end-to-end", () => {
    it("should inject brand JSON when /brand command is used with brand name", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      // Simulate /brand nof1 command message
      const messageInput = { sessionID: "test-session" };
      const messageOutput = {
        parts: [{ type: "text", text: "/brand nof1" }],
      };
      await plugin["chat.message"](messageInput, messageOutput);

      // Simulate chat.params with brander agent prompt
      const paramsInput = { sessionID: "test-session" };
      const paramsOutput = {
        system: "Test prompt with $BRAND_XML placeholder",
        options: {},
      };
      await plugin["chat.params"](paramsInput, paramsOutput);

      // Brand JSON should be injected
      expect(paramsOutput.system).not.toContain("$BRAND_XML");
      expect(paramsOutput.system).toContain('"name": "nof1"');
      expect(paramsOutput.system).toContain("#0000ff");
    });

    it("should show available brands when /brand command has no argument", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      // Simulate /brand command without argument
      const messageInput = { sessionID: "test-session-2" };
      const messageOutput = {
        parts: [{ type: "text", text: "/brand" }],
      };
      await plugin["chat.message"](messageInput, messageOutput);

      // Simulate chat.params
      const paramsInput = { sessionID: "test-session-2" };
      const paramsOutput = {
        system: "Test prompt with $BRAND_XML placeholder",
        options: {},
      };
      await plugin["chat.params"](paramsInput, paramsOutput);

      // Should show available brands message
      expect(paramsOutput.system).not.toContain("$BRAND_XML");
      expect(paramsOutput.system).toContain("No brand specified");
      expect(paramsOutput.system).toContain("nof1");
    });
  });
});
