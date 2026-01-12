# Reskin Code Style Guide

## Naming Conventions

### Files and Directories

| Type | Convention | Examples |
|------|------------|----------|
| Source files | kebab-case | `brand-injector.ts`, `component-scanner.ts` |
| Test files | `.test.ts` suffix | `parser.test.ts`, `reskin.test.ts` |
| Barrel exports | `index.ts` | `src/agents/index.ts` |
| XML data files | kebab-case | `nof1.xml` |

### Code Identifiers

| Type | Convention | Examples |
|------|------------|----------|
| Functions | camelCase, verb-first | `getBrand()`, `parseColors()`, `loadBrands()` |
| Interfaces/Types | PascalCase | `Brand`, `BrandColors`, `XmlElement` |
| Variables | camelCase | `brands`, `brandXml`, `availableBrands` |
| Constants | SCREAMING_SNAKE_CASE | `VALID_TARGETS`, `PRIMARY_AGENT_NAME` |
| Agent configs | camelCase + `Agent` suffix | `reskinAgent`, `styleAnalyzerAgent` |
| Agent registry keys | kebab-case strings | `"style-analyzer"`, `"component-scanner"` |

### Function Naming Patterns

```typescript
// Getters - retrieve existing data
getBrand(name)
getBrandXml(name)

// Loaders - read from external source
loadBrands()

// Listers - return collections
listBrands()

// Parsers - transform data
parseBrandXml(xml)
parseColors(element)

// Finders - search within data
findChild(element, tag)
findChildren(element, tag)

// Requirers - find or throw
requireChild(element, tag)

// Creators/Factories - construct new objects
createBrandInjectorHook()
createBrandTemplate(brands)

// Extractors - pull specific data
extractBrandFromMessage(text)

// Generators - produce output
generateBrandContent(brandName)
```

## File Organization

### Module Structure

Each module follows this pattern:
```
src/[module]/
├── index.ts      # Public API exports
├── schema.ts     # Type definitions (if needed)
├── [impl].ts     # Implementation files
└── [data].xml    # Data files (if needed)
```

### Import Order

```typescript
// 1. External packages
import type { Plugin } from "@opencode-ai/plugin";

// 2. Internal modules (absolute paths from src/)
import { agents, PRIMARY_AGENT_NAME } from "./agents";
import { loadBrands, listBrands } from "./brands";

// 3. Local files
import { createBrandInjectorHook } from "./hooks/brand-injector";
```

### Export Patterns

```typescript
// Barrel exports in index.ts
export { reskinAgent, styleAnalyzerAgent, componentScannerAgent };
export const PRIMARY_AGENT_NAME = "reskin";
export const agents: Record<string, AgentConfig> = { ... };

// Type exports use 'export interface' directly
export interface Brand { ... }

// Default export for plugin entry point only
export default ReskinPlugin;
```

## Code Patterns

### Factory Functions

```typescript
export function createBrandInjectorHook(): BrandInjectorHook {
  // Private state
  const brandRequests = new Map<string, string | null>();

  // Private helpers
  function extractBrandFromMessage(text: string): string | null | undefined {
    // ...
  }

  // Return public interface
  return {
    "chat.message": async (input, output) => { /* ... */ },
    "chat.params": async (input, output) => { /* ... */ },
  };
}
```

### Module-Level State

```typescript
// Private Maps for storage
const brands = new Map<string, Brand>();
const brandXml = new Map<string, string>();

// Public functions to access
export function getBrand(name: string): Brand | undefined {
  return brands.get(name);
}
```

### Error Handling

```typescript
// Throw with descriptive messages
if (!child) {
  throw new Error(`Missing required element: <${tag}>`);
}

// Include context in error messages
throw new Error(
  `Invalid target "${target}" in meta. Must be one of: ${VALID_TARGETS.join(", ")}`
);

// Log warnings for non-fatal issues, don't throw
console.warn(`[reskin] Failed to parse ${file}: ${error.message}`);
```

### Type Definitions

```typescript
// Domain-prefixed interfaces
export interface BrandColors {
  palette: PaletteColor[];
  semantic: SemanticColor[];
}

// Descriptive suffixes
export interface FontDefinition { ... }
export interface ButtonComponent { ... }

// Union types for constrained values
role: "sans" | "mono" | "serif";
target: "web" | "mobile" | "all";

// Optional properties with ?
description?: string;
components?: BrandComponents;
```

## Testing Patterns

### Test File Structure

```typescript
import { describe, it, expect } from "bun:test";
import { parseBrandXml } from "../../src/brands/parser";

// Test fixtures as constants
const MINIMAL_BRAND_XML = `...`;

describe("parseBrandXml", () => {
  it("should parse minimal brand XML", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);
    expect(brand.name).toBe("test");
  });

  it("should throw on invalid XML with helpful error message", () => {
    expect(() => parseBrandXml("not xml")).toThrow(/not xml/);
  });
});
```

### Test Naming

- `describe()` - Function or module name
- `it()` - "should [verb] [expected behavior]"

```typescript
describe("parseBrandXml", () => {
  it("should parse minimal brand XML", () => { ... });
  it("should parse colors section", () => { ... });
  it("should throw on missing required sections", () => { ... });
  it("should throw when brand element is missing name attribute", () => { ... });
});
```

### Assertion Patterns

```typescript
// Value assertions
expect(brand.name).toBe("test");
expect(brand.colors.palette).toHaveLength(1);

// Error assertions with regex
expect(() => parseBrandXml("invalid")).toThrow(/pattern/);
expect(() => fn()).toThrow(/name.*attribute.*required/i);
```

## Formatting (Biome)

| Setting | Value |
|---------|-------|
| Indent | 2 spaces |
| Line width | 120 |
| Quote style | Double quotes |
| Semicolons | Required (default) |

### Linter Rules

- Recommended rules enabled
- `noExplicitAny`: off
- `noNonNullAssertion`: off

## Do's and Don'ts

### Do

- Use descriptive function names with verb prefixes
- Export types/interfaces directly (no `I` prefix)
- Use Maps for module-level storage
- Include context in error messages
- Mirror source structure in tests
- Use barrel exports (`index.ts`) for public APIs
- Log warnings for non-fatal errors

### Don't

- Don't use `I` prefix for interfaces
- Don't use `any` without good reason (linter allows it but avoid)
- Don't throw on non-fatal errors (log warnings instead)
- Don't use default exports except for plugin entry point
- Don't mix kebab-case and camelCase in the same category
- Don't put implementation details in barrel exports
