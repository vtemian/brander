import type { Plugin } from "@opencode-ai/plugin";

import { agents, PRIMARY_AGENT_NAME } from "@/agents";
import { listBrands, loadBrands } from "@/brands";
import { loadCustomConfig } from "@/config/loader";
import { createBrandInjectorHook } from "@/hooks/brand-injector";

const ReskinPlugin: Plugin = async (_ctx) => {
  await loadBrands();
  const availableBrands = listBrands();
  const customConfig = await loadCustomConfig(agents);

  // Create brand injector hook
  const brandInjectorHook = createBrandInjectorHook();

  return {
    config: async (config) => {
      // Register all agents with user overrides applied
      config.agent = {
        ...config.agent,
        ...customConfig,
      };

      // Register /brand command
      config.command = {
        ...config.command,
        brand: {
          description: "Generate brand transformation plan. Usage: /brand [brand-name]",
          agent: PRIMARY_AGENT_NAME,
          template: createBrandTemplate(availableBrands),
        },
      };
    },

    // Intercept messages to extract brand name from /brand command
    "chat.message": async (input, output) => {
      await brandInjectorHook["chat.message"](input, output);
    },

    // Inject brand XML into agent system prompt
    "chat.params": async (input, output) => {
      await brandInjectorHook["chat.params"](input, output);
    },
  };
};

function createBrandTemplate(availableBrands: string[]): string {
  const brandList = availableBrands.map((b) => `- ${b}`).join("\n");

  return `Analyze this project and generate a brand transformation plan.

Available brands:
${brandList}

User request: $ARGUMENTS

If no brand is specified, ask the user to choose from the available brands.
If a brand is specified, load its definition and proceed with analysis.`;
}

export default ReskinPlugin;
