import type { Plugin } from "@opencode-ai/plugin";

import { agents, PRIMARY_AGENT_NAME } from "@/agents";
import { loadCustomConfig } from "@/config/loader";
import { createSkinInjectorHook } from "@/hooks/skin-injector";
import { listSkins, loadSkins } from "@/skins";

const ReskinPlugin: Plugin = async (_ctx) => {
  await loadSkins();
  const availableSkins = listSkins();
  const customConfig = await loadCustomConfig(agents);

  // Create skin injector hook
  const skinInjectorHook = createSkinInjectorHook();

  return {
    config: async (config) => {
      // Register all agents with user overrides applied
      config.agent = {
        ...config.agent,
        ...customConfig,
      };

      // Register /skin command
      config.command = {
        ...config.command,
        skin: {
          description: "Generate skin transformation plan. Usage: /skin [skin-name]",
          agent: PRIMARY_AGENT_NAME,
          template: createSkinTemplate(availableSkins),
        },
      };
    },

    // Intercept messages to extract skin name from /skin command
    "chat.message": async (input, output) => {
      await skinInjectorHook["chat.message"](input, output);
    },

    // Inject skin XML into agent system prompt
    "chat.params": async (input, output) => {
      await skinInjectorHook["chat.params"](input, output);
    },
  };
};

function createSkinTemplate(availableSkins: string[]): string {
  const skinList = availableSkins.map((b) => `- ${b}`).join("\n");

  return `Analyze this project and generate a skin transformation plan.

Available skins:
${skinList}

User request: $ARGUMENTS

The skin JSON is already injected into your system prompt - do not try to read skin files from disk.`;
}

export default ReskinPlugin;
