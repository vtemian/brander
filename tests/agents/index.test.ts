import { describe, it, expect } from "bun:test";
import { agents, PRIMARY_AGENT_NAME } from "../../src/agents";

describe("agents registry", () => {
  it("should export all agents", () => {
    expect(agents.brander).toBeDefined();
    expect(agents["style-analyzer"]).toBeDefined();
    expect(agents["component-scanner"]).toBeDefined();
  });

  it("should have brander as primary agent", () => {
    expect(PRIMARY_AGENT_NAME).toBe("brander");
    expect(agents[PRIMARY_AGENT_NAME].mode).toBe("primary");
  });

  it("should have subagents configured correctly", () => {
    expect(agents["style-analyzer"].mode).toBe("subagent");
    expect(agents["component-scanner"].mode).toBe("subagent");
  });
});
