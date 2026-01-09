import { describe, it, expect } from "bun:test";
import { branderAgent } from "../../src/agents/brander";

describe("brander agent", () => {
  it("should be configured as primary agent", () => {
    expect(branderAgent.mode).toBe("primary");
  });

  it("should use claude-opus model", () => {
    expect(branderAgent.model).toContain("opus");
  });

  it("should have read-only tools", () => {
    expect(branderAgent.tools?.write).toBe(false);
    expect(branderAgent.tools?.edit).toBe(false);
  });

  it("should reference subagents in prompt", () => {
    expect(branderAgent.prompt).toContain("style-analyzer");
    expect(branderAgent.prompt).toContain("component-scanner");
  });

  it("should describe transformation plan output", () => {
    expect(branderAgent.prompt).toContain("Transformation Plan");
  });

  it("should have brand context placeholder", () => {
    expect(branderAgent.prompt).toContain("$BRAND_XML");
  });
});
