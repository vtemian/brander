import { describe, expect, it } from "bun:test";

import { agents, PRIMARY_AGENT_NAME } from "../../src/agents";

describe("agents registry", () => {
  it("should export all agents", () => {
    expect(agents.reskin).toBeDefined();
    expect(agents["style-analyzer"]).toBeDefined();
    expect(agents["component-scanner"]).toBeDefined();
  });

  it("should have reskin as primary agent", () => {
    expect(PRIMARY_AGENT_NAME).toBe("reskin");
    expect(agents[PRIMARY_AGENT_NAME].mode).toBe("primary");
  });

  it("should have subagents configured correctly", () => {
    expect(agents["style-analyzer"].mode).toBe("subagent");
    expect(agents["component-scanner"].mode).toBe("subagent");
  });
});
