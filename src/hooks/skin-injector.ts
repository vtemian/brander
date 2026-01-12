import { getSkinJson, listSkins } from "@/skins";

interface SkinInjectorHook {
  "chat.message": (
    input: { sessionID: string },
    output: {
      parts: Array<{ type: string; text?: string }>;
      message?: { parts?: Array<{ type: string; text?: string }> };
    },
  ) => Promise<void>;
  "experimental.chat.messages.transform": (
    input: Record<string, unknown>,
    output: { messages: Array<{ info: { role: string }; parts: Array<{ type: string; text?: string }> }> },
  ) => Promise<void>;
  getLastSkinRequest: () => string | null | undefined;
  setLastSkinRequest: (skin: string | null | undefined) => void;
}

export function createSkinInjectorHook(): SkinInjectorHook {
  // Track skin requests across hooks
  // pendingSkinRequest: set by chat.message, consumed once by transform (for "no skin" errors)
  // activeSkin: the skin to inject on EVERY transform call (persists for session)
  let pendingSkinRequest: string | null | undefined;
  let activeSkin: string | undefined;

  function extractSkinFromMessage(text: string): string | null | undefined {
    // Look for /skin command pattern at start of message
    const skinMatch = text.match(/^\/skin\s*(\S*)/);
    if (skinMatch) {
      const skinArg = skinMatch[1]?.trim();
      return skinArg || null;
    }

    // Also check for expanded command template with "User request:" pattern
    const userRequestMatch = text.match(/User request:\s*(\S+)/);
    if (userRequestMatch) {
      const skinArg = userRequestMatch[1]?.trim();
      return skinArg || null;
    }

    return undefined;
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
    // Extract skin request from message
    "chat.message": async (
      _input: { sessionID: string },
      output: {
        parts: Array<{ type: string; text?: string }>;
        message?: { parts?: Array<{ type: string; text?: string }> };
      },
    ) => {
      const parts = output.parts || output.message?.parts || [];
      const text = parts
        .filter((p) => p.type === "text" && "text" in p)
        .map((p) => p.text || "")
        .join(" ");

      const skinRequest = extractSkinFromMessage(text);

      if (skinRequest !== undefined) {
        pendingSkinRequest = skinRequest;
        if (skinRequest !== null) {
          activeSkin = skinRequest;
        }
      }
    },

    // Inject skin JSON into messages before LLM call (ephemeral, not persisted)
    "experimental.chat.messages.transform": async (
      _input: Record<string, unknown>,
      output: { messages: Array<{ info: { role: string }; parts: Array<{ type: string; text?: string }> }> },
    ) => {
      // Handle pending "no skin specified" request (one-time)
      if (pendingSkinRequest === null) {
        const content = generateSkinContent(null);
        const lastUserMsg = output.messages?.findLast(
          (m: { info: { role: string }; parts: Array<{ type: string; text?: string }> }) => m.info.role === "user",
        );
        if (lastUserMsg) {
          lastUserMsg.parts.push({ type: "text", text: `\n\n${content}` });
        }
        pendingSkinRequest = undefined;
        return;
      }

      // Clear pending request
      pendingSkinRequest = undefined;

      // If we have an active skin, always inject into last user message
      if (activeSkin) {
        const skinContent = generateSkinContent(activeSkin);
        const lastUserMsg = output.messages?.findLast(
          (m: { info: { role: string }; parts: Array<{ type: string; text?: string }> }) => m.info.role === "user",
        );

        if (lastUserMsg && skinContent) {
          lastUserMsg.parts.push({
            type: "text",
            text: `\n\n<skin-definition name="${activeSkin}">\n${skinContent}\n</skin-definition>`,
          });
        }
      }
    },

    // Test helpers
    getLastSkinRequest: () => pendingSkinRequest ?? activeSkin ?? null,
    setLastSkinRequest: (skin: string | null | undefined) => {
      pendingSkinRequest = skin;
      if (skin && skin !== null) {
        activeSkin = skin;
      }
    },
  };
}
