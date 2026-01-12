import type { AgentConfig } from "@opencode-ai/sdk";

import { branderAgent } from "./brander";
import { componentScannerAgent } from "./component-scanner";
import { styleAnalyzerAgent } from "./style-analyzer";

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
