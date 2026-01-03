import type { Plugin } from "@opencode-ai/plugin";
import { agents, PRIMARY_AGENT_NAME } from "./agents";
import { loadBrands, listBrands } from "./brands";
import { createBrandInjectorHook } from "./hooks/brand-injector";

const BranderPlugin: Plugin = async (_ctx) => {
  // Load bundled brand definitions at startup
  await loadBrands();
  const availableBrands = listBrands();

  if (availableBrands.length === 0) {
    console.warn("[brander] No brand definitions found");
  } else {
    console.log(`[brander] Loaded brands: ${availableBrands.join(", ")}`);
  }

  // Create brand injector hook
  const brandInjectorHook = createBrandInjectorHook();

  return {
    config: async (config) => {
      // Register all agents
      config.agent = {
        ...config.agent,
        ...agents,
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

export default BranderPlugin;
