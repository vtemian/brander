import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseSkinJson } from "./parser";
import type { Skin } from "./schema";

export { parseSkinJson } from "./parser";
// Re-export types
export * from "./schema";

// Skin storage
const skins = new Map<string, Skin>();
const skinJson = new Map<string, string>();

// Get the directory where skin JSON files are located
function getSkinsDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // When bundled: skins/ is copied to dist/skins/
  // The bundle is at dist/index.js, so skins/ is at dist/skins/
  const bundledPath = join(currentDir, "skins");
  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  // When running from source (dev/tests): go up to project root
  // From src/skins/, go up two levels to project root
  const projectRoot = join(currentDir, "..", "..");
  return join(projectRoot, "skins");
}

export async function loadSkins(): Promise<void> {
  skins.clear();
  skinJson.clear();

  const skinsDir = getSkinsDir();

  try {
    const files = readdirSync(skinsDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const filePath = join(skinsDir, file);
      const json = readFileSync(filePath, "utf-8");

      try {
        const skin = parseSkinJson(json);
        skins.set(skin.name, skin);
        skinJson.set(skin.name, json);
      } catch (err) {
        console.warn(`[opencode-reskin] Failed to parse ${file}:`, err);
      }
    }
  } catch (err) {
    console.warn(`[opencode-reskin] Failed to load skins from ${skinsDir}:`, err);
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
