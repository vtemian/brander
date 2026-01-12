import { getSkinJson, listSkins } from "@/skins";

const SKIN_PLACEHOLDER = "$SKIN_JSON";

interface SkinInjectorHook {
  "chat.message": (
    input: { sessionID: string },
    output: { parts: Array<{ type: string; text?: string }> },
  ) => Promise<void>;
  "chat.params": (
    input: { sessionID: string },
    output: { options?: Record<string, unknown>; system?: string },
  ) => Promise<void>;
  setCurrentSkinRequest: (sessionID: string, skin: string | null) => void;
  getCurrentSkinRequest: (sessionID: string) => string | null | undefined;
}

export function createSkinInjectorHook(): SkinInjectorHook {
  // Track skin request per session using a Map
  // undefined = not set, null = explicitly no skin, string = skin name
  const skinRequests = new Map<string, string | null>();

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
      // Not a skin request, remove placeholder gracefully
      return "";
    }

    if (skinName === null) {
      // No skin specified, show available skins
      const available = listSkins();
      return `No skin specified. Available skins:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to specify a skin.`;
    }

    // Try to get the skin JSON
    const json = getSkinJson(skinName);
    if (json) {
      return json;
    }

    // Skin not found
    const available = listSkins();
    return `Skin '${skinName}' not found. Available skins:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to choose from the available skins.`;
  }

  return {
    "chat.message": async (input: { sessionID: string }, output: { parts: Array<{ type: string; text?: string }> }) => {
      // Extract text from message parts
      const text = output.parts
        .filter((p) => p.type === "text" && "text" in p)
        .map((p) => p.text || "")
        .join(" ");

      // Check if this is a /skin command
      const skinRequest = extractSkinFromMessage(text);
      console.warn(
        `[opencode-reskin] chat.message: sessionID=${input.sessionID}, text="${text.slice(0, 100)}...", extracted=${skinRequest}`,
      );
      if (skinRequest !== undefined) {
        skinRequests.set(input.sessionID, skinRequest);
        console.warn(`[opencode-reskin] Stored skin request: ${skinRequest} for session ${input.sessionID}`);
      }
    },

    "chat.params": async (
      input: { sessionID: string },
      output: { options?: Record<string, unknown>; system?: string },
    ) => {
      console.warn(
        `[opencode-reskin] chat.params: sessionID=${input.sessionID}, hasSystem=${!!output.system}, hasPlaceholder=${output.system?.includes(SKIN_PLACEHOLDER)}`,
      );

      if (!output.system || !output.system.includes(SKIN_PLACEHOLDER)) {
        return;
      }

      const currentSkinRequest = skinRequests.get(input.sessionID);
      console.warn(`[opencode-reskin] Found skin request: ${currentSkinRequest} for session ${input.sessionID}`);

      const skinContent = generateSkinContent(currentSkinRequest);
      console.warn(`[opencode-reskin] Generated content length: ${skinContent.length}`);

      output.system = output.system.replaceAll(SKIN_PLACEHOLDER, skinContent);

      // Clean up session state after injection to prevent memory leak
      skinRequests.delete(input.sessionID);
    },

    // Test helpers
    setCurrentSkinRequest: (sessionID: string, skin: string | null) => {
      skinRequests.set(sessionID, skin);
    },

    getCurrentSkinRequest: (sessionID: string) => {
      return skinRequests.get(sessionID);
    },
  };
}
