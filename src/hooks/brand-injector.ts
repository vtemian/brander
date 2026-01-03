import { getBrandXml, listBrands } from "../brands";

const BRAND_PLACEHOLDER = "$BRAND_XML";

interface BrandInjectorHook {
  "chat.message": (
    input: { sessionID: string },
    output: { parts: Array<{ type: string; text?: string }> },
  ) => Promise<void>;
  "chat.params": (
    input: { sessionID: string },
    output: { options?: Record<string, unknown>; system?: string },
  ) => Promise<void>;
  setCurrentBrandRequest: (sessionID: string, brand: string | null) => void;
  getCurrentBrandRequest: (sessionID: string) => string | null | undefined;
}

export function createBrandInjectorHook(): BrandInjectorHook {
  // Track brand request per session using a Map
  // undefined = not set, null = explicitly no brand, string = brand name
  const brandRequests = new Map<string, string | null>();

  function extractBrandFromMessage(text: string): string | null | undefined {
    // Look for /brand command pattern at start of message only
    const brandMatch = text.match(/^\/brand\s*(\S*)/);
    if (!brandMatch) {
      return undefined; // Not a /brand command
    }

    const brandArg = brandMatch[1]?.trim();
    return brandArg || null; // null if no argument, string if argument present
  }

  function generateBrandContent(brandName: string | null | undefined): string {
    if (brandName === undefined) {
      // Not a brand request, remove placeholder gracefully
      return "";
    }

    if (brandName === null) {
      // No brand specified, show available brands
      const available = listBrands();
      return `No brand specified. Available brands:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to specify a brand.`;
    }

    // Try to get the brand XML
    const xml = getBrandXml(brandName);
    if (xml) {
      return xml;
    }

    // Brand not found
    const available = listBrands();
    return `Brand '${brandName}' not found. Available brands:\n${available.map((b) => `- ${b}`).join("\n")}\n\nPlease ask the user to choose from the available brands.`;
  }

  return {
    "chat.message": async (
      input: { sessionID: string },
      output: { parts: Array<{ type: string; text?: string }> },
    ) => {
      // Extract text from message parts
      const text = output.parts
        .filter((p) => p.type === "text" && "text" in p)
        .map((p) => p.text || "")
        .join(" ");

      // Check if this is a /brand command
      const brandRequest = extractBrandFromMessage(text);
      if (brandRequest !== undefined) {
        brandRequests.set(input.sessionID, brandRequest);
      }
    },

    "chat.params": async (
      input: { sessionID: string },
      output: { options?: Record<string, unknown>; system?: string },
    ) => {
      if (!output.system || !output.system.includes(BRAND_PLACEHOLDER)) {
        return;
      }

      const currentBrandRequest = brandRequests.get(input.sessionID);
      const brandContent = generateBrandContent(currentBrandRequest);
      output.system = output.system.replaceAll(BRAND_PLACEHOLDER, brandContent);
    },

    // Test helpers
    setCurrentBrandRequest: (sessionID: string, brand: string | null) => {
      brandRequests.set(sessionID, brand);
    },

    getCurrentBrandRequest: (sessionID: string) => {
      return brandRequests.get(sessionID);
    },
  };
}
