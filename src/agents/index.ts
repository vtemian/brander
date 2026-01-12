import type { AgentConfig } from "@opencode-ai/sdk";

import { componentScannerAgent } from "./component-scanner";
import { reskinAgent } from "./reskin";
import { styleAnalyzerAgent } from "./style-analyzer";

export enum AGENTS {
  reskin = "reskin",
  styleAnalyzer = "style-analyzer",
  componentScanner = "component-scanner",
}

export const PRIMARY_AGENT_NAME = AGENTS.reskin;

export const agents: Record<AGENTS, AgentConfig> = {
  [AGENTS.reskin]: reskinAgent,
  [AGENTS.styleAnalyzer]: styleAnalyzerAgent,
  [AGENTS.componentScanner]: componentScannerAgent,
};

export { reskinAgent, styleAnalyzerAgent, componentScannerAgent };
