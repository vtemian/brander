import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseBrandXml } from "./parser";
import type { Brand } from "./schema";

export { parseBrandXml } from "./parser";
// Re-export types
export * from "./schema";

// Brand storage
const brands = new Map<string, Brand>();
const brandXml = new Map<string, string>();

// Get the directory where brand XML files are located
function getBrandsDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // Brand XMLs live in top-level brands/ directory
  // From src/brands/ or dist/, go up to project root
  const projectRoot = join(currentDir, "..", "..");
  return join(projectRoot, "brands");
}

export async function loadBrands(): Promise<void> {
  brands.clear();
  brandXml.clear();

  const brandsDir = getBrandsDir();

  try {
    const files = readdirSync(brandsDir);
    const xmlFiles = files.filter((f) => f.endsWith(".xml"));

    for (const file of xmlFiles) {
      const filePath = join(brandsDir, file);
      const xml = readFileSync(filePath, "utf-8");

      try {
        const brand = parseBrandXml(xml);
        brands.set(brand.name, brand);
        brandXml.set(brand.name, xml);
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

export function getBrandXml(name: string): string | undefined {
  return brandXml.get(name);
}

export function listBrands(): string[] {
  return Array.from(brands.keys());
}
