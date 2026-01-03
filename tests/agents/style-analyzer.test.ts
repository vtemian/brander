import { describe, it, expect } from "bun:test";
import { styleAnalyzerAgent } from "../../src/agents/style-analyzer";

describe("style-analyzer agent", () => {
  it("should be configured as subagent", () => {
    expect(styleAnalyzerAgent.mode).toBe("subagent");
  });

  it("should have read-only tools", () => {
    expect(styleAnalyzerAgent.tools?.write).toBe(false);
    expect(styleAnalyzerAgent.tools?.edit).toBe(false);
  });

  it("should have prompt for CSS/Tailwind analysis", () => {
    expect(styleAnalyzerAgent.prompt).toContain("CSS");
    expect(styleAnalyzerAgent.prompt).toContain("Tailwind");
  });

  it("should focus on extracting design tokens", () => {
    expect(styleAnalyzerAgent.prompt).toContain("color");
    expect(styleAnalyzerAgent.prompt).toContain("font");
    expect(styleAnalyzerAgent.prompt).toContain("spacing");
  });
});
