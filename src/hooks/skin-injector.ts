import { getSkinJson, listSkins } from "@/skins";

interface SkinInjectorHook {
  "chat.message": (
    input: { sessionID: string },
    output: { parts: Array<{ type: string; text?: string }> },
  ) => Promise<void>;
  "chat.params": (
    input: { sessionID: string },
    output: { options?: Record<string, unknown>; system?: string },
  ) => Promise<void>;
}

export function createSkinInjectorHook(): SkinInjectorHook {
  function extractSkinFromMessage(text: string): string | null | undefined {
    // Look for /skin command pattern at start of message
    const skinMatch = text.match(/^\/skin\s*(\S*)/);
    if (skinMatch) {
      const skinArg = skinMatch[1]?.trim();
      return skinArg || null; // null if no argument, string if argument present
    }

    // Also check for expanded command template with "User request:" pattern
    // This handles the case where OpenCode expands the command template before the hook runs
    const userRequestMatch = text.match(/User request:\s*(\S+)/);
    if (userRequestMatch) {
      const skinArg = userRequestMatch[1]?.trim();
      return skinArg || null;
    }

    return undefined; // Not a skin command
  }

  function generateSkinContent(skinName: string | null | undefined): string {
    if (skinName === undefined) {
      return "";
    }

    if (skinName === null) {
      const available = listSkins();
      return `No skin specified. Available skins:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to specify a skin.`;
    }

    const json = getSkinJson(skinName);
    if (json) {
      return json;
    }

    const available = listSkins();
    return `Skin '${skinName}' not found. Available skins:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to choose from the available skins.`;
  }

  return {
    "chat.message": async (
      _input: { sessionID: string },
      output: { parts: Array<{ type: string; text?: string }> },
    ) => {
      // Extract text from message parts
      const text = output.parts
        .filter((p) => p.type === "text" && "text" in p)
        .map((p) => p.text || "")
        .join(" ");

      // Check if this is a /skin command
      const skinRequest = extractSkinFromMessage(text);

      if (skinRequest !== undefined) {
        // Inject skin JSON directly into the message
        const skinContent = generateSkinContent(skinRequest);

        if (skinContent && skinRequest !== null) {
          // Append skin JSON to the message for the agent to use
          output.parts.push({
            type: "text",
            text: `\n\n<skin-definition name="${skinRequest}">\n${skinContent}\n</skin-definition>`,
          });
        } else if (skinRequest === null) {
          // No skin specified - add available skins message
          output.parts.push({
            type: "text",
            text: `\n\n${skinContent}`,
          });
        } else {
          // Skin not found - add error message
          output.parts.push({
            type: "text",
            text: `\n\n${skinContent}`,
          });
        }
      }
    },

    "chat.params": async (
      _input: { sessionID: string },
      _output: { options?: Record<string, unknown>; system?: string },
    ) => {
      // No longer used for injection - kept for backward compatibility
    },
  };
}
