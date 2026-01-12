import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
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
  // Strategy 1: Use createRequire to find the package location (works for npm installs)
  // This is the most reliable method when installed as a dependency
  try {
    const require = createRequire(import.meta.url);
    const packageJsonPath = require.resolve("opencode-reskin/package.json");
    const packageRoot = dirname(packageJsonPath);
    const npmSkinsPath = join(packageRoot, "skins");
    if (existsSync(npmSkinsPath)) {
      return npmSkinsPath;
    }
    // Also check dist/skins for bundled package
    const npmDistSkinsPath = join(packageRoot, "dist", "skins");
    if (existsSync(npmDistSkinsPath)) {
      return npmDistSkinsPath;
    }
  } catch {
    // Package not found via require.resolve, try other methods
  }

  // Strategy 2: Resolve from import.meta.url (works for local development/tests)
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // When running from source (src/skins/index.ts), go up to project root
  const projectRoot = join(currentDir, "..", "..");
  const devPath = join(projectRoot, "skins");
  if (existsSync(devPath)) {
    return devPath;
  }

  // When running from dist/index.js, check sibling skins folder
  const distSkinsPath = join(currentDir, "skins");
  if (existsSync(distSkinsPath)) {
    return distSkinsPath;
  }

  // When running from dist/, check parent's skins folder
  const packageRootSkins = join(currentDir, "..", "skins");
  if (existsSync(packageRootSkins)) {
    return packageRootSkins;
  }

  // Fallback - return a path that will give a useful error message
  return devPath;
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
