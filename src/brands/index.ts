import { parseBrandXml } from "./parser";
import type { Brand } from "./schema";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Re-export types
export * from "./schema";
export { parseBrandXml } from "./parser";

// Brand storage
const brands = new Map<string, Brand>();
const brandXml = new Map<string, string>();

// Get the directory where this module is located
function getBrandsDir(): string {
  // In bundled code, __dirname might not work, so we use import.meta.url
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // When running from dist/, brands are in src/brands/
  // When running from src/, brands are in the same directory
  // We need to handle both cases

  // Try src/brands first (development)
  const srcBrandsDir = join(currentDir, "..", "src", "brands");
  try {
    readdirSync(srcBrandsDir);
    return srcBrandsDir;
  } catch {
    // Fall back to same directory (if XML files are copied to dist)
    return currentDir;
  }
}

/**
 * Loads all brand XML files from the brands directory.
 * Parses each file and stores the brand data for later retrieval.
 * Invalid brand files are logged as warnings but do not prevent other brands from loading.
 */
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

/**
 * Retrieves a parsed brand by name.
 * @param name - The brand name to look up
 * @returns The parsed Brand object, or undefined if not found
 */
export function getBrand(name: string): Brand | undefined {
  return brands.get(name);
}

/**
 * Retrieves the raw XML content for a brand by name.
 * @param name - The brand name to look up
 * @returns The raw XML string, or undefined if not found
 */
export function getBrandXml(name: string): string | undefined {
  return brandXml.get(name);
}

/**
 * Lists all available brand names.
 * @returns An array of brand names that have been loaded
 */
export function listBrands(): string[] {
  return Array.from(brands.keys());
}
