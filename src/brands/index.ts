import { readdirSync, readFileSync } from "node:fs";
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

  // Brand JSONs live in top-level brands/ directory
  // From src/brands/ or dist/, go up to project root
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
