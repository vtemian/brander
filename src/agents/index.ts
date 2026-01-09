import type { AgentConfig } from "@opencode-ai/sdk";
import { branderAgent } from "./brander";
import { styleAnalyzerAgent } from "./style-analyzer";
import { componentScannerAgent } from "./component-scanner";

export enum AGENTS {
  brander = "brander",
  styleAnalyzer = "style-analyzer",
  componentScanner = "component-scanner",
}

export const PRIMARY_AGENT_NAME = AGENTS.brander;

export const agents: Record<AGENTS, AgentConfig> = {
  [AGENTS.brander]: branderAgent,
  [AGENTS.styleAnalyzer]: styleAnalyzerAgent,
  [AGENTS.componentScanner]: componentScannerAgent,
};

export { branderAgent, styleAnalyzerAgent, componentScannerAgent };
