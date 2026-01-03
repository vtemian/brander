import type { AgentConfig } from "@opencode-ai/sdk";
import { branderAgent } from "./brander";
import { styleAnalyzerAgent } from "./style-analyzer";
import { componentScannerAgent } from "./component-scanner";

export const PRIMARY_AGENT_NAME = "brander";

export const agents: Record<string, AgentConfig> = {
  [PRIMARY_AGENT_NAME]: branderAgent,
  "style-analyzer": styleAnalyzerAgent,
  "component-scanner": componentScannerAgent,
};

export { branderAgent, styleAnalyzerAgent, componentScannerAgent };
