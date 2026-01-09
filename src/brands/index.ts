import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseBrandJson } from "./parser";
import type { Brand } from "./schema";

export { parseBrandJson } from "./parser";
// Re-export types
export * from "./schema";

// Brand storage
const brands = new Map<string, Brand>();
const brandJson = new Map<string, string>();

// Get the directory where brand JSON files are located
function getBrandsDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // When bundled: brands/ is copied to dist/brands/
  // The bundle is at dist/index.js, so brands/ is at dist/brands/
  const bundledPath = join(currentDir, "brands");
  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  // When running from source (dev/tests): go up to project root
  // From src/brands/, go up two levels to project root
  const projectRoot = join(currentDir, "..", "..");
  return join(projectRoot, "brands");
}

export async function loadBrands(): Promise<void> {
  brands.clear();
  brandJson.clear();

  const brandsDir = getBrandsDir();

  try {
    const files = readdirSync(brandsDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const filePath = join(brandsDir, file);
      const json = readFileSync(filePath, "utf-8");

      try {
        const brand = parseBrandJson(json);
        brands.set(brand.name, brand);
        brandJson.set(brand.name, json);
      } catch (err) {
        console.warn(`[brander] Failed to parse ${file}:`, err);
      }
    }
  } catch (err) {
    console.warn(`[brander] Failed to load brands from ${brandsDir}:`, err);
  }
}

export function getBrand(name: string): Brand | undefined {
  return brands.get(name);
}

export function getBrandJson(name: string): string | undefined {
  return brandJson.get(name);
}

export function listBrands(): string[] {
  return Array.from(brands.keys());
}
