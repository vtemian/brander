// Auto-generated skin imports - run `bun run generate-skins` to update
import { embeddedSkins } from "./embedded";
import { parseSkinJson } from "./parser";
import type { Skin } from "./schema";

export { parseSkinJson } from "./parser";
// Re-export types
export * from "./schema";

// Skin storage
const skins = new Map<string, Skin>();
const skinJson = new Map<string, string>();

export async function loadSkins(): Promise<void> {
  skins.clear();
  skinJson.clear();

  for (const [name, data] of Object.entries(embeddedSkins)) {
    try {
      const json = JSON.stringify(data, null, 2);
      const skin = parseSkinJson(json);
      skins.set(skin.name, skin);
      skinJson.set(skin.name, json);
    } catch (err) {
      console.warn(`[opencode-reskin] Failed to parse embedded skin ${name}:`, err);
    }
  }
}

export function getSkin(name: string): Skin | undefined {
  return skins.get(name);
}

export function getSkinJson(name: string): string | undefined {
  return skinJson.get(name);
}

export function listSkins(): string[] {
  return Array.from(skins.keys());
}
