import { describe, expect, it } from "bun:test";

import { componentScannerAgent } from "../../src/agents/component-scanner";

describe("component-scanner agent", () => {
  it("should be configured as subagent", () => {
    expect(componentScannerAgent.mode).toBe("subagent");
  });

  it("should have read-only tools", () => {
    expect(componentScannerAgent.tools?.write).toBe(false);
    expect(componentScannerAgent.tools?.edit).toBe(false);
  });

  it("should have prompt for component analysis", () => {
    expect(componentScannerAgent.prompt).toContain("component");
    expect(componentScannerAgent.prompt).toContain("Button");
  });

  it("should identify component libraries", () => {
    expect(componentScannerAgent.prompt).toContain("library");
  });
});
