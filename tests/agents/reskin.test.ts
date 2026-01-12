import { describe, expect, it } from "bun:test";

import { reskinAgent } from "../../src/agents/reskin";

describe("reskin agent", () => {
  it("should be configured as primary agent", () => {
    expect(reskinAgent.mode).toBe("primary");
  });

  it("should use claude-opus model", () => {
    expect(reskinAgent.model).toContain("opus");
  });

  it("should have write enabled but edit disabled", () => {
    expect(reskinAgent.tools?.write).toBe(true);
    expect(reskinAgent.tools?.edit).toBe(false);
  });

  it("should reference subagents in prompt", () => {
    expect(reskinAgent.prompt).toContain("style-analyzer");
    expect(reskinAgent.prompt).toContain("component-scanner");
  });

  it("should describe transformation plan output", () => {
    expect(reskinAgent.prompt).toContain("Transformation Plan");
  });

  it("should have brand context placeholder", () => {
    expect(reskinAgent.prompt).toContain("$BRAND_JSON");
  });
});
