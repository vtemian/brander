import { beforeAll, describe, expect, it } from "bun:test";

describe("Reskin plugin", () => {
  let pluginModule: any;

  beforeAll(async () => {
    pluginModule = await import("../src/index");
  });

  it("should export a default plugin function", () => {
    expect(typeof pluginModule.default).toBe("function");
  });

  it("should return plugin configuration", async () => {
    const mockCtx = {
      cwd: () => "/test/project",
    };

    const plugin = await pluginModule.default(mockCtx);

    expect(plugin).toBeDefined();
    expect(typeof plugin.config).toBe("function");
  });
});

describe("Plugin config", () => {
  it("should register /skin command", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    const config: any = {
      agent: {},
      command: {},
    };

    await plugin.config(config);

    expect(config.command.skin).toBeDefined();
    expect(config.command.skin.agent).toBe("reskin");
  });

  it("should register all agents", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    const config: any = {
      agent: {},
      command: {},
    };

    await plugin.config(config);

    expect(config.agent.reskin).toBeDefined();
    expect(config.agent["style-analyzer"]).toBeDefined();
    expect(config.agent["component-scanner"]).toBeDefined();
  });
});
