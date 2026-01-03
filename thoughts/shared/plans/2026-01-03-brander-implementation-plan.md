# Brander Plugin Implementation Plan

**Goal:** Build an OpenCode plugin that analyzes web projects and generates brand transformation plans.

**Architecture:** Plugin with primary brander agent, two subagents (style-analyzer, component-scanner), bundled XML brand definitions, and a `/brand` command.

**Design:** [thoughts/shared/designs/2026-01-03-brander-design.md](../designs/2026-01-03-brander-design.md)

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `biome.json`
- Create: `.gitignore`
- Create: `src/index.ts` (minimal placeholder)

**Step 1: Create package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "brander",
  "version": "0.1.0",
  "description": "OpenCode plugin for brand transformation planning",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --target bun --format esm && tsc --emitDeclarationOnly",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run clean && bun run build",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "format": "biome format --write .",
    "lint": "biome lint .",
    "check": "biome check ."
  },
  "keywords": [
    "opencode",
    "plugin",
    "branding",
    "design-system"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@opencode-ai/plugin": "^1.0.224"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.3.10",
    "bun-types": "latest",
    "typescript": "^5.7.3"
  }
}
EOF
```

**Step 2: Create tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
```

**Step 3: Create biome.json**

```bash
cat > biome.json << 'EOF'
{
  "$schema": "https://biomejs.dev/schemas/2.3.10/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "includes": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 120
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "off"
      },
      "style": {
        "noNonNullAssertion": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
EOF
```

**Step 4: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
bun.lock
EOF
```

**Step 5: Create minimal src/index.ts placeholder**

```bash
mkdir -p src
cat > src/index.ts << 'EOF'
import type { Plugin } from "@opencode-ai/plugin";

const BranderPlugin: Plugin = async (_ctx) => {
  return {};
};

export default BranderPlugin;
EOF
```

**Step 6: Install dependencies**

Run: `bun install`
Expected: Dependencies installed, bun.lock created

**Step 7: Verify build works**

Run: `bun run build`
Expected: dist/index.js and dist/index.d.ts created

**Step 8: Commit**

```bash
git add package.json tsconfig.json biome.json .gitignore src/index.ts
git commit -m "chore: scaffold brander plugin project"
```

---

## Task 2: Brand Schema Types

**Files:**
- Create: `src/brands/schema.ts`
- Create: `tests/brands/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/brands/schema.test.ts
import { describe, it, expect } from "bun:test";
import type { Brand, BrandColors, BrandTypography, BrandSpacing, BrandRadius } from "../../src/brands/schema";

describe("Brand schema types", () => {
  it("should define Brand interface with required sections", () => {
    const brand: Brand = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test brand",
        target: "web",
      },
      colors: {
        palette: [{ name: "primary", value: "#000000" }],
        semantic: [],
      },
      typography: {
        fonts: [{ role: "sans", family: "Inter", fallback: "sans-serif" }],
        scale: [{ name: "base", size: "14px", lineHeight: "1.5" }],
      },
      spacing: {
        unit: "0.25rem",
      },
      radius: {
        sizes: [{ name: "md", value: "0.375rem" }],
      },
    };

    expect(brand.name).toBe("test");
    expect(brand.meta.target).toBe("web");
  });

  it("should allow optional sections", () => {
    const brand: Brand = {
      name: "test",
      version: "1.0",
      meta: {
        description: "Test brand",
        target: "web",
      },
      colors: {
        palette: [],
        semantic: [],
      },
      typography: {
        fonts: [],
        scale: [],
      },
      spacing: {
        unit: "0.25rem",
      },
      radius: {
        sizes: [],
      },
      components: {
        buttons: [],
        cards: [],
      },
      voice: {
        tone: "Direct",
        principles: [],
      },
      guidelines: {
        dos: [],
        donts: [],
      },
    };

    expect(brand.components).toBeDefined();
    expect(brand.voice).toBeDefined();
    expect(brand.guidelines).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/brands/schema.test.ts`
Expected: FAIL with "Cannot find module" or type errors

**Step 3: Create tests directory**

```bash
mkdir -p tests/brands
```

**Step 4: Write the schema types**

```typescript
// src/brands/schema.ts

// Color definitions
export interface PaletteColor {
  name: string;
  value: string;
  description?: string;
}

export interface SemanticColor {
  name: string;
  light: string;
  dark: string;
}

export interface BrandColors {
  palette: PaletteColor[];
  semantic: SemanticColor[];
}

// Typography definitions
export interface FontDefinition {
  role: "sans" | "mono" | "serif";
  family: string;
  fallback: string;
}

export interface TypeScale {
  name: string;
  size: string;
  lineHeight: string;
}

export interface BrandTypography {
  fonts: FontDefinition[];
  scale: TypeScale[];
}

// Spacing
export interface BrandSpacing {
  unit: string;
}

// Border radius
export interface RadiusSize {
  name: string;
  value: string;
}

export interface BrandRadius {
  sizes: RadiusSize[];
}

// Optional: Components
export interface ButtonComponent {
  variant: string;
  bg: string;
  text: string;
  radius?: string;
  border?: string;
}

export interface CardComponent {
  bg: string;
  border: string;
  radius: string;
  padding: string;
}

export interface BrandComponents {
  buttons: ButtonComponent[];
  cards: CardComponent[];
}

// Optional: Voice
export interface BrandVoice {
  tone: string;
  principles: string[];
}

// Optional: Guidelines
export interface BrandGuidelines {
  dos: string[];
  donts: string[];
}

// Meta
export interface BrandMeta {
  description: string;
  target: "web" | "mobile" | "all";
}

// Main Brand interface
export interface Brand {
  name: string;
  version: string;
  meta: BrandMeta;
  colors: BrandColors;
  typography: BrandTypography;
  spacing: BrandSpacing;
  radius: BrandRadius;
  components?: BrandComponents;
  voice?: BrandVoice;
  guidelines?: BrandGuidelines;
}
```

**Step 5: Run test to verify it passes**

Run: `bun test tests/brands/schema.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/brands/schema.ts tests/brands/schema.test.ts
git commit -m "feat(brands): add TypeScript types for brand schema"
```

---

## Task 3: XML Parser for Brand Definitions

**Files:**
- Create: `src/brands/parser.ts`
- Create: `tests/brands/parser.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/brands/parser.test.ts
import { describe, it, expect } from "bun:test";
import { parseBrandXml } from "../../src/brands/parser";

const MINIMAL_BRAND_XML = `<?xml version="1.0" encoding="UTF-8"?>
<brand name="test" version="1.0">
  <meta>
    <description>Test brand</description>
    <target>web</target>
  </meta>
  <colors>
    <palette name="primary" value="#dcde8d" description="Primary color"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
  </colors>
  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <scale name="base" size="14px" line-height="1.5"/>
  </typography>
  <spacing unit="0.25rem"/>
  <radius>
    <size name="md" value="0.375rem"/>
  </radius>
</brand>`;

describe("parseBrandXml", () => {
  it("should parse minimal brand XML", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.name).toBe("test");
    expect(brand.version).toBe("1.0");
    expect(brand.meta.description).toBe("Test brand");
    expect(brand.meta.target).toBe("web");
  });

  it("should parse colors section", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.colors.palette).toHaveLength(1);
    expect(brand.colors.palette[0].name).toBe("primary");
    expect(brand.colors.palette[0].value).toBe("#dcde8d");
    expect(brand.colors.palette[0].description).toBe("Primary color");

    expect(brand.colors.semantic).toHaveLength(1);
    expect(brand.colors.semantic[0].name).toBe("background");
    expect(brand.colors.semantic[0].light).toBe("#ffffff");
    expect(brand.colors.semantic[0].dark).toBe("#1a1a1a");
  });

  it("should parse typography section", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.typography.fonts).toHaveLength(1);
    expect(brand.typography.fonts[0].role).toBe("sans");
    expect(brand.typography.fonts[0].family).toBe("Inter");

    expect(brand.typography.scale).toHaveLength(1);
    expect(brand.typography.scale[0].name).toBe("base");
    expect(brand.typography.scale[0].size).toBe("14px");
  });

  it("should parse spacing and radius", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.spacing.unit).toBe("0.25rem");
    expect(brand.radius.sizes).toHaveLength(1);
    expect(brand.radius.sizes[0].name).toBe("md");
  });

  it("should throw on invalid XML", () => {
    expect(() => parseBrandXml("not xml")).toThrow();
  });

  it("should throw on missing required sections", () => {
    const invalidXml = `<brand name="test" version="1.0"><meta><description>Test</description><target>web</target></meta></brand>`;
    expect(() => parseBrandXml(invalidXml)).toThrow(/colors/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/brands/parser.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write the XML parser**

```typescript
// src/brands/parser.ts
import type {
  Brand,
  BrandColors,
  BrandTypography,
  BrandSpacing,
  BrandRadius,
  BrandMeta,
  PaletteColor,
  SemanticColor,
  FontDefinition,
  TypeScale,
  RadiusSize,
  BrandComponents,
  ButtonComponent,
  CardComponent,
  BrandVoice,
  BrandGuidelines,
} from "./schema";

// Simple XML parser using regex (no external dependencies)
// This is sufficient for our well-structured brand XML files

interface XmlElement {
  tag: string;
  attrs: Record<string, string>;
  children: XmlElement[];
  text: string;
}

function parseXmlElement(xml: string): XmlElement {
  const tagMatch = xml.match(/^<(\w+)([^>]*)>/);
  if (!tagMatch) {
    throw new Error("Invalid XML: no opening tag found");
  }

  const tag = tagMatch[1];
  const attrString = tagMatch[2];
  const attrs: Record<string, string> = {};

  // Parse attributes
  const attrRegex = /(\w+(?:-\w+)?)="([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrString)) !== null) {
    attrs[attrMatch[1]] = attrMatch[2];
  }

  // Find closing tag
  const closingTag = `</${tag}>`;
  const closingIndex = xml.lastIndexOf(closingTag);
  if (closingIndex === -1) {
    throw new Error(`Invalid XML: no closing tag for <${tag}>`);
  }

  const innerContent = xml.slice(tagMatch[0].length, closingIndex).trim();

  // Parse children
  const children: XmlElement[] = [];
  let text = "";

  if (innerContent) {
    // Check if content is text or elements
    if (!innerContent.startsWith("<")) {
      text = innerContent;
    } else {
      // Parse child elements
      let remaining = innerContent;
      while (remaining.trim()) {
        remaining = remaining.trim();
        if (!remaining.startsWith("<")) break;

        // Find the tag name
        const childTagMatch = remaining.match(/^<(\w+)/);
        if (!childTagMatch) break;

        const childTag = childTagMatch[1];

        // Handle self-closing tags
        const selfClosingMatch = remaining.match(new RegExp(`^<${childTag}[^>]*/>`));
        if (selfClosingMatch) {
          const attrStr = selfClosingMatch[0];
          const childAttrs: Record<string, string> = {};
          let childAttrMatch;
          while ((childAttrMatch = attrRegex.exec(attrStr)) !== null) {
            childAttrs[childAttrMatch[1]] = childAttrMatch[2];
          }
          children.push({ tag: childTag, attrs: childAttrs, children: [], text: "" });
          remaining = remaining.slice(selfClosingMatch[0].length);
          continue;
        }

        // Find matching closing tag (handle nesting)
        let depth = 0;
        let endIndex = 0;
        const openRegex = new RegExp(`<${childTag}[^>]*>`, "g");
        const closeRegex = new RegExp(`</${childTag}>`, "g");

        for (let i = 0; i < remaining.length; i++) {
          const substr = remaining.slice(i);
          if (substr.match(new RegExp(`^<${childTag}[^>]*(?<!/)>`))) {
            depth++;
          } else if (substr.startsWith(`</${childTag}>`)) {
            depth--;
            if (depth === 0) {
              endIndex = i + `</${childTag}>`.length;
              break;
            }
          }
        }

        if (endIndex === 0) {
          throw new Error(`Invalid XML: unclosed tag <${childTag}>`);
        }

        const childXml = remaining.slice(0, endIndex);
        children.push(parseXmlElement(childXml));
        remaining = remaining.slice(endIndex);
      }
    }
  }

  return { tag, attrs, children, text };
}

function findChild(element: XmlElement, tag: string): XmlElement | undefined {
  return element.children.find((c) => c.tag === tag);
}

function findChildren(element: XmlElement, tag: string): XmlElement[] {
  return element.children.filter((c) => c.tag === tag);
}

function requireChild(element: XmlElement, tag: string): XmlElement {
  const child = findChild(element, tag);
  if (!child) {
    throw new Error(`Missing required element: <${tag}>`);
  }
  return child;
}

function parseColors(element: XmlElement): BrandColors {
  const palette: PaletteColor[] = findChildren(element, "palette").map((p) => ({
    name: p.attrs.name,
    value: p.attrs.value,
    description: p.attrs.description,
  }));

  const semantic: SemanticColor[] = findChildren(element, "semantic").map((s) => ({
    name: s.attrs.name,
    light: s.attrs.light,
    dark: s.attrs.dark,
  }));

  return { palette, semantic };
}

function parseTypography(element: XmlElement): BrandTypography {
  const fonts: FontDefinition[] = findChildren(element, "font").map((f) => ({
    role: f.attrs.role as "sans" | "mono" | "serif",
    family: f.attrs.family,
    fallback: f.attrs.fallback,
  }));

  const scale: TypeScale[] = findChildren(element, "scale").map((s) => ({
    name: s.attrs.name,
    size: s.attrs.size,
    lineHeight: s.attrs["line-height"],
  }));

  return { fonts, scale };
}

function parseSpacing(element: XmlElement): BrandSpacing {
  return { unit: element.attrs.unit };
}

function parseRadius(element: XmlElement): BrandRadius {
  const sizes: RadiusSize[] = findChildren(element, "size").map((s) => ({
    name: s.attrs.name,
    value: s.attrs.value,
  }));

  return { sizes };
}

function parseComponents(element: XmlElement): BrandComponents {
  const buttons: ButtonComponent[] = findChildren(element, "button").map((b) => ({
    variant: b.attrs.variant,
    bg: b.attrs.bg,
    text: b.attrs.text,
    radius: b.attrs.radius,
    border: b.attrs.border,
  }));

  const cards: CardComponent[] = findChildren(element, "card").map((c) => ({
    bg: c.attrs.bg,
    border: c.attrs.border,
    radius: c.attrs.radius,
    padding: c.attrs.padding,
  }));

  return { buttons, cards };
}

function parseVoice(element: XmlElement): BrandVoice {
  const toneEl = findChild(element, "tone");
  const principlesEl = findChild(element, "principles");

  return {
    tone: toneEl?.text || "",
    principles: principlesEl ? findChildren(principlesEl, "principle").map((p) => p.text) : [],
  };
}

function parseGuidelines(element: XmlElement): BrandGuidelines {
  return {
    dos: findChildren(element, "do").map((d) => d.text),
    donts: findChildren(element, "dont").map((d) => d.text),
  };
}

function parseMeta(element: XmlElement): BrandMeta {
  const descEl = requireChild(element, "description");
  const targetEl = requireChild(element, "target");

  return {
    description: descEl.text,
    target: targetEl.text as "web" | "mobile" | "all",
  };
}

export function parseBrandXml(xml: string): Brand {
  // Remove XML declaration if present
  const cleanXml = xml.replace(/<\?xml[^?]*\?>\s*/, "").trim();

  const root = parseXmlElement(cleanXml);

  if (root.tag !== "brand") {
    throw new Error("Invalid brand XML: root element must be <brand>");
  }

  // Required sections
  const metaEl = requireChild(root, "meta");
  const colorsEl = findChild(root, "colors");
  if (!colorsEl) {
    throw new Error("Missing required section: colors");
  }
  const typographyEl = findChild(root, "typography");
  if (!typographyEl) {
    throw new Error("Missing required section: typography");
  }
  const spacingEl = findChild(root, "spacing");
  if (!spacingEl) {
    throw new Error("Missing required section: spacing");
  }
  const radiusEl = findChild(root, "radius");
  if (!radiusEl) {
    throw new Error("Missing required section: radius");
  }

  // Optional sections
  const componentsEl = findChild(root, "components");
  const voiceEl = findChild(root, "voice");
  const guidelinesEl = findChild(root, "guidelines");

  const brand: Brand = {
    name: root.attrs.name,
    version: root.attrs.version,
    meta: parseMeta(metaEl),
    colors: parseColors(colorsEl),
    typography: parseTypography(typographyEl),
    spacing: parseSpacing(spacingEl),
    radius: parseRadius(radiusEl),
  };

  if (componentsEl) {
    brand.components = parseComponents(componentsEl);
  }

  if (voiceEl) {
    brand.voice = parseVoice(voiceEl);
  }

  if (guidelinesEl) {
    brand.guidelines = parseGuidelines(guidelinesEl);
  }

  return brand;
}
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/brands/parser.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/brands/parser.ts tests/brands/parser.test.ts
git commit -m "feat(brands): add XML parser for brand definitions"
```

---

## Task 4: Brand Loader

**Files:**
- Create: `src/brands/index.ts`
- Create: `src/brands/nof1.xml`
- Create: `tests/brands/loader.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/brands/loader.test.ts
import { describe, it, expect } from "bun:test";
import { loadBrands, getBrand, listBrands, getBrandXml } from "../../src/brands";

describe("Brand loader", () => {
  it("should load bundled brands on init", async () => {
    await loadBrands();
    const brands = listBrands();

    expect(brands.length).toBeGreaterThan(0);
    expect(brands).toContain("nof1");
  });

  it("should get brand by name", async () => {
    await loadBrands();
    const brand = getBrand("nof1");

    expect(brand).toBeDefined();
    expect(brand!.name).toBe("nof1");
    expect(brand!.meta.description).toContain("OpenCode");
  });

  it("should return undefined for unknown brand", async () => {
    await loadBrands();
    const brand = getBrand("nonexistent");

    expect(brand).toBeUndefined();
  });

  it("should get raw XML for brand", async () => {
    await loadBrands();
    const xml = getBrandXml("nof1");

    expect(xml).toBeDefined();
    expect(xml).toContain("<brand");
    expect(xml).toContain('name="nof1"');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/brands/loader.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Create the nof1.xml brand definition**

```xml
<!-- src/brands/nof1.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<brand name="nof1" version="1.0">
  <meta>
    <description>OpenCode OC-1 design system</description>
    <target>web</target>
  </meta>

  <colors>
    <palette name="primary" value="#dcde8d" description="Yuzu yellow-green"/>
    <palette name="interactive" value="#034cff" description="Cobalt blue"/>
    <palette name="neutral" value="#8e8b8b"/>
    <palette name="success" value="#12c905"/>
    <palette name="warning" value="#ffdc17"/>
    <palette name="error" value="#fc533a"/>
    <palette name="info" value="#a753ae"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
    <semantic name="foreground" light="#1a1a1a" dark="#ffffff"/>
    <semantic name="border" light="#e5e5e5" dark="#333333"/>
  </colors>

  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <font role="mono" family="IBM Plex Mono" fallback="monospace"/>
    <scale name="base" size="14px" line-height="1.5"/>
    <scale name="sm" size="13px" line-height="1.4"/>
    <scale name="lg" size="16px" line-height="1.5"/>
  </typography>

  <spacing unit="0.25rem"/>

  <radius>
    <size name="xs" value="0.125rem"/>
    <size name="sm" value="0.25rem"/>
    <size name="md" value="0.375rem"/>
    <size name="lg" value="0.5rem"/>
    <size name="xl" value="0.625rem"/>
  </radius>

  <components>
    <button variant="primary" bg="interactive" text="white" radius="md"/>
    <button variant="secondary" bg="transparent" text="interactive" border="interactive"/>
    <card bg="background" border="border" radius="lg" padding="4"/>
  </components>

  <voice>
    <tone>Direct, technical, no fluff</tone>
    <principles>
      <principle>Be concise</principle>
      <principle>Use active voice</principle>
    </principles>
  </voice>

  <guidelines>
    <do>Use consistent spacing multiples</do>
    <do>Prefer semantic color names over raw values</do>
    <dont>Mix font families within body text</dont>
    <dont>Use more than 3 levels of elevation</dont>
  </guidelines>
</brand>
```

**Step 4: Write the brand loader**

```typescript
// src/brands/index.ts
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
```

**Step 5: Run test to verify it passes**

Run: `bun test tests/brands/loader.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/brands/index.ts src/brands/nof1.xml tests/brands/loader.test.ts
git commit -m "feat(brands): add brand loader with nof1 brand definition"
```

---

## Task 5: Style Analyzer Subagent

**Files:**
- Create: `src/agents/style-analyzer.ts`
- Create: `tests/agents/style-analyzer.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/agents/style-analyzer.test.ts
import { describe, it, expect } from "bun:test";
import { styleAnalyzerAgent } from "../../src/agents/style-analyzer";

describe("style-analyzer agent", () => {
  it("should be configured as subagent", () => {
    expect(styleAnalyzerAgent.mode).toBe("subagent");
  });

  it("should have read-only tools", () => {
    expect(styleAnalyzerAgent.tools?.write).toBe(false);
    expect(styleAnalyzerAgent.tools?.edit).toBe(false);
  });

  it("should have prompt for CSS/Tailwind analysis", () => {
    expect(styleAnalyzerAgent.prompt).toContain("CSS");
    expect(styleAnalyzerAgent.prompt).toContain("Tailwind");
  });

  it("should focus on extracting design tokens", () => {
    expect(styleAnalyzerAgent.prompt).toContain("color");
    expect(styleAnalyzerAgent.prompt).toContain("font");
    expect(styleAnalyzerAgent.prompt).toContain("spacing");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/agents/style-analyzer.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Create the agents directory**

```bash
mkdir -p src/agents tests/agents
```

**Step 4: Write the style-analyzer agent**

```typescript
// src/agents/style-analyzer.ts
import type { AgentConfig } from "@opencode-ai/sdk";

export const styleAnalyzerAgent: AgentConfig = {
  description: "Analyzes CSS, Tailwind, and design token patterns in web projects",
  mode: "subagent",
  model: "anthropic/claude-sonnet-4-20250514",
  temperature: 0.1,
  tools: {
    write: false,
    edit: false,
    bash: false,
    task: false,
  },
  prompt: `<purpose>
Analyze the project's current styling implementation to extract design tokens and patterns.
Return structured findings for comparison against a target brand.
</purpose>

<focus-areas>
<area name="CSS Variables">
  <find>:root or :host CSS custom properties</find>
  <find>--color-*, --font-*, --spacing-*, --radius-* patterns</find>
  <find>Theme switching mechanisms (data-theme, .dark class)</find>
</area>

<area name="Tailwind Configuration">
  <find>tailwind.config.js or tailwind.config.ts</find>
  <find>Custom theme extensions (colors, fonts, spacing)</find>
  <find>Plugin usage</find>
</area>

<area name="Color Palette">
  <find>All color definitions (hex, rgb, hsl, oklch)</find>
  <find>Semantic color naming patterns</find>
  <find>Dark mode color variants</find>
</area>

<area name="Typography">
  <find>Font family declarations</find>
  <find>Font size scale</find>
  <find>Line height patterns</find>
  <find>Font weight usage</find>
</area>

<area name="Spacing">
  <find>Spacing scale (margin, padding patterns)</find>
  <find>Gap usage in flex/grid</find>
  <find>Consistent spacing units</find>
</area>

<area name="Border Radius">
  <find>Border radius values in use</find>
  <find>Radius scale patterns</find>
</area>
</focus-areas>

<search-strategy>
<step>Glob for CSS files: **/*.css, **/*.scss, **/*.less</step>
<step>Glob for Tailwind config: tailwind.config.*</step>
<step>Grep for CSS variable definitions: --[a-z]+-</step>
<step>Grep for @apply directives</step>
<step>Read and analyze found files</step>
</search-strategy>

<output-format>
## Current Styling Analysis

### CSS Variables
- List all custom properties found
- Group by category (colors, fonts, spacing, etc.)

### Tailwind Configuration
- Theme customizations
- Extended values

### Color Palette
| Name | Value | Usage |
|------|-------|-------|
| ... | ... | ... |

### Typography
| Property | Value |
|----------|-------|
| Font families | ... |
| Base size | ... |
| Scale | ... |

### Spacing
- Base unit: ...
- Scale: ...

### Border Radius
- Values in use: ...

### Patterns Identified
- List any consistent patterns
- Note any inconsistencies
</output-format>

<rules>
<rule>Be exhaustive - find ALL style definitions</rule>
<rule>Report raw values, not interpretations</rule>
<rule>Note file paths for each finding</rule>
<rule>Identify both explicit and implicit patterns</rule>
</rules>`,
};
```

**Step 5: Run test to verify it passes**

Run: `bun test tests/agents/style-analyzer.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/agents/style-analyzer.ts tests/agents/style-analyzer.test.ts
git commit -m "feat(agents): add style-analyzer subagent"
```

---

## Task 6: Component Scanner Subagent

**Files:**
- Create: `src/agents/component-scanner.ts`
- Create: `tests/agents/component-scanner.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/agents/component-scanner.test.ts
import { describe, it, expect } from "bun:test";
import { componentScannerAgent } from "../../src/agents/component-scanner";

describe("component-scanner agent", () => {
  it("should be configured as subagent", () => {
    expect(componentScannerAgent.mode).toBe("subagent");
  });

  it("should have read-only tools", () => {
    expect(componentScannerAgent.tools?.write).toBe(false);
    expect(componentScannerAgent.tools?.edit).toBe(false);
  });

  it("should have prompt for component analysis", () => {
    expect(componentScannerAgent.prompt).toContain("component");
    expect(componentScannerAgent.prompt).toContain("Button");
  });

  it("should identify component libraries", () => {
    expect(componentScannerAgent.prompt).toContain("library");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/agents/component-scanner.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write the component-scanner agent**

```typescript
// src/agents/component-scanner.ts
import type { AgentConfig } from "@opencode-ai/sdk";

export const componentScannerAgent: AgentConfig = {
  description: "Scans UI components and identifies styling patterns",
  mode: "subagent",
  model: "anthropic/claude-sonnet-4-20250514",
  temperature: 0.1,
  tools: {
    write: false,
    edit: false,
    bash: false,
    task: false,
  },
  prompt: `<purpose>
Scan the project for UI components and identify their current styling patterns.
Focus on common components that brands typically customize.
</purpose>

<target-components>
<component name="Button">
  <variants>primary, secondary, ghost, destructive</variants>
  <properties>background, text color, border, radius, padding</properties>
</component>

<component name="Card">
  <properties>background, border, radius, shadow, padding</properties>
</component>

<component name="Input">
  <properties>border, radius, focus ring, placeholder color</properties>
</component>

<component name="Badge">
  <properties>background, text color, radius, padding</properties>
</component>

<component name="Alert">
  <variants>info, success, warning, error</variants>
  <properties>background, border, icon color</properties>
</component>

<component name="Modal/Dialog">
  <properties>background, border, radius, shadow, overlay</properties>
</component>
</target-components>

<search-strategy>
<step>Identify framework: React, Vue, Angular, Svelte</step>
<step>Check for component libraries: shadcn/ui, Radix, Chakra, MUI, etc.</step>
<step>Glob for component files: **/components/**/*.{tsx,jsx,vue,svelte}</step>
<step>Search for component definitions by name</step>
<step>Extract styling approach: CSS modules, Tailwind, styled-components, etc.</step>
</search-strategy>

<output-format>
## Component Analysis

### Framework & Libraries
- Framework: React/Vue/Angular/Svelte
- Component library: shadcn/ui, custom, etc.
- Styling approach: Tailwind, CSS modules, etc.

### Button Components
| Variant | Location | Styling |
|---------|----------|---------|
| primary | src/components/Button.tsx | bg-blue-500, text-white, rounded-md |
| ... | ... | ... |

### Card Components
| Location | Styling |
|----------|---------|
| ... | ... |

### Input Components
| Location | Styling |
|----------|---------|
| ... | ... |

### Other Components
- List any other branded components found

### Patterns Identified
- Common styling patterns across components
- Inconsistencies noted
</output-format>

<rules>
<rule>Report actual class names and styles used</rule>
<rule>Note file paths for each component</rule>
<rule>Identify variant patterns</rule>
<rule>Flag any inline styles</rule>
</rules>`,
};
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/agents/component-scanner.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/agents/component-scanner.ts tests/agents/component-scanner.test.ts
git commit -m "feat(agents): add component-scanner subagent"
```

---

## Task 7: Brander Primary Agent

**Files:**
- Create: `src/agents/brander.ts`
- Create: `tests/agents/brander.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/agents/brander.test.ts
import { describe, it, expect } from "bun:test";
import { branderAgent } from "../../src/agents/brander";

describe("brander agent", () => {
  it("should be configured as primary agent", () => {
    expect(branderAgent.mode).toBe("primary");
  });

  it("should use claude-sonnet model", () => {
    expect(branderAgent.model).toContain("sonnet");
  });

  it("should have read-only tools", () => {
    expect(branderAgent.tools?.write).toBe(false);
    expect(branderAgent.tools?.edit).toBe(false);
  });

  it("should reference subagents in prompt", () => {
    expect(branderAgent.prompt).toContain("style-analyzer");
    expect(branderAgent.prompt).toContain("component-scanner");
  });

  it("should describe transformation plan output", () => {
    expect(branderAgent.prompt).toContain("Transformation Plan");
  });

  it("should have brand context placeholder", () => {
    expect(branderAgent.prompt).toContain("$BRAND_XML");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/agents/brander.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write the brander agent**

```typescript
// src/agents/brander.ts
import type { AgentConfig } from "@opencode-ai/sdk";

export const branderAgent: AgentConfig = {
  description: "Analyzes projects and generates brand transformation plans",
  mode: "primary",
  model: "anthropic/claude-sonnet-4-20250514",
  temperature: 0.1,
  tools: {
    write: false,
    edit: false,
  },
  prompt: `<purpose>
Analyze the current project's styling and generate a transformation plan to match the target brand.
You orchestrate subagents to gather information, then synthesize findings into an actionable plan.
</purpose>

<brand-context>
$BRAND_XML
</brand-context>

<workflow>
<phase name="analyze">
  <action>Spawn subagents in PARALLEL to analyze the project:</action>
  <spawn agent="style-analyzer">Analyze CSS, Tailwind, and design tokens</spawn>
  <spawn agent="component-scanner">Scan UI components and their styling</spawn>
  <action>Wait for both to complete</action>
</phase>

<phase name="compare">
  <action>Compare current state against target brand definition</action>
  <action>Identify gaps and required changes</action>
  <action>Group changes by category</action>
</phase>

<phase name="plan">
  <action>Generate transformation plan with specific, actionable items</action>
  <action>Include file paths and exact changes needed</action>
  <action>Estimate scope (files affected, number of changes)</action>
</phase>
</workflow>

<subagents>
<agent name="style-analyzer">
  Finds CSS files, CSS variables, Tailwind config.
  Extracts current color palette, fonts, spacing.
  Identifies design token patterns.
</agent>

<agent name="component-scanner">
  Finds UI components (buttons, cards, forms).
  Identifies component library in use.
  Extracts current component styling patterns.
</agent>
</subagents>

<output-format>
# Brand Transformation Plan: {brand-name}

## Summary
- **Current state**: [Brief description of current styling]
- **Target brand**: {brand-name} ({brand-description})
- **Estimated scope**: X files, ~Y changes

## 1. Colors

### CSS Variables ({file-path})
- [ ] Add \`--color-primary: {value}\`
- [ ] Add \`--color-interactive: {value}\`
- [ ] Replace \`{old-var}\` references with \`{new-var}\`

### Tailwind Config ({file-path})
- [ ] Add \`colors.primary: '{value}'\`
- [ ] Update \`colors.gray\` to match neutral palette

## 2. Typography

### Font Setup
- [ ] Add {font-family} font (Google Fonts or local)
- [ ] Update \`--font-sans\` to \`'{family}', {fallback}\`

### Font Sizes
- [ ] Set base font size to {size}
- [ ] Adjust scale: {scale-details}

## 3. Spacing & Radius

- [ ] Verify spacing unit is {unit}
- [ ] Update border-radius scale: {radius-details}

## 4. Components

### Buttons ({file-path})
- [ ] Primary: {styling-details}
- [ ] Secondary: {styling-details}

### Cards ({file-path})
- [ ] Apply {styling-details}

## 5. Optional: Voice & Tone

- [ ] Review button labels for {tone} tone
- [ ] Check error messages match {tone} style

---
Generated by brander | Brand: {brand-name} v{version}
</output-format>

<error-handling>
<case condition="no style files found">
  Report "No CSS/Tailwind files found in project"
  Suggest checking if this is a web project
</case>

<case condition="project already matches brand">
  Report "Project already aligned with {brand-name}"
  List any minor discrepancies
</case>

<case condition="unknown component library">
  Note the library and provide generic guidance
  Suggest manual review for library-specific patterns
</case>
</error-handling>

<rules>
<rule>Be specific - include exact file paths and values</rule>
<rule>Be actionable - each item should be a clear task</rule>
<rule>Be complete - cover all brand aspects</rule>
<rule>Prioritize - put most impactful changes first</rule>
</rules>`,
};
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/agents/brander.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/agents/brander.ts tests/agents/brander.test.ts
git commit -m "feat(agents): add brander primary agent"
```

---

## Task 8: Agent Registry

**Files:**
- Create: `src/agents/index.ts`
- Create: `tests/agents/index.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/agents/index.test.ts
import { describe, it, expect } from "bun:test";
import { agents, PRIMARY_AGENT_NAME } from "../../src/agents";

describe("agents registry", () => {
  it("should export all agents", () => {
    expect(agents.brander).toBeDefined();
    expect(agents["style-analyzer"]).toBeDefined();
    expect(agents["component-scanner"]).toBeDefined();
  });

  it("should have brander as primary agent", () => {
    expect(PRIMARY_AGENT_NAME).toBe("brander");
    expect(agents[PRIMARY_AGENT_NAME].mode).toBe("primary");
  });

  it("should have subagents configured correctly", () => {
    expect(agents["style-analyzer"].mode).toBe("subagent");
    expect(agents["component-scanner"].mode).toBe("subagent");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/agents/index.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write the agent registry**

```typescript
// src/agents/index.ts
import type { AgentConfig } from "@opencode-ai/sdk";
import { branderAgent } from "./brander";
import { styleAnalyzerAgent } from "./style-analyzer";
import { componentScannerAgent } from "./component-scanner";

export const PRIMARY_AGENT_NAME = "brander";

export const agents: Record<string, AgentConfig> = {
  [PRIMARY_AGENT_NAME]: branderAgent,
  "style-analyzer": styleAnalyzerAgent,
  "component-scanner": componentScannerAgent,
};

export { branderAgent, styleAnalyzerAgent, componentScannerAgent };
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/agents/index.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/agents/index.ts tests/agents/index.test.ts
git commit -m "feat(agents): add agent registry"
```

---

## Task 9: Plugin Entry Point with /brand Command

**Files:**
- Modify: `src/index.ts`
- Create: `tests/index.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/index.test.ts
import { describe, it, expect, beforeAll } from "bun:test";

describe("Brander plugin", () => {
  let pluginModule: any;

  beforeAll(async () => {
    pluginModule = await import("../src/index");
  });

  it("should export a default plugin function", () => {
    expect(typeof pluginModule.default).toBe("function");
  });

  it("should return plugin configuration", async () => {
    const mockCtx = {
      cwd: () => "/test/project",
    };

    const plugin = await pluginModule.default(mockCtx);

    expect(plugin).toBeDefined();
    expect(typeof plugin.config).toBe("function");
  });
});

describe("Plugin config", () => {
  it("should register /brand command", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    const config: any = {
      agent: {},
      command: {},
    };

    await plugin.config(config);

    expect(config.command.brand).toBeDefined();
    expect(config.command.brand.agent).toBe("brander");
  });

  it("should register all agents", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    const config: any = {
      agent: {},
      command: {},
    };

    await plugin.config(config);

    expect(config.agent.brander).toBeDefined();
    expect(config.agent["style-analyzer"]).toBeDefined();
    expect(config.agent["component-scanner"]).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/index.test.ts`
Expected: FAIL (current index.ts is minimal placeholder)

**Step 3: Write the full plugin entry point**

```typescript
// src/index.ts
import type { Plugin } from "@opencode-ai/plugin";
import { agents, PRIMARY_AGENT_NAME } from "./agents";
import { loadBrands, listBrands, getBrandXml } from "./brands";

const BranderPlugin: Plugin = async (_ctx) => {
  // Load bundled brand definitions at startup
  await loadBrands();
  const availableBrands = listBrands();

  if (availableBrands.length === 0) {
    console.warn("[brander] No brand definitions found");
  } else {
    console.log(`[brander] Loaded brands: ${availableBrands.join(", ")}`);
  }

  return {
    config: async (config) => {
      // Register all agents
      config.agent = {
        ...config.agent,
        ...agents,
      };

      // Register /brand command
      config.command = {
        ...config.command,
        brand: {
          description: "Generate brand transformation plan. Usage: /brand [brand-name]",
          agent: PRIMARY_AGENT_NAME,
          template: createBrandTemplate(availableBrands),
        },
      };
    },
  };
};

function createBrandTemplate(availableBrands: string[]): string {
  const brandList = availableBrands.map((b) => `- ${b}`).join("\n");

  return `Analyze this project and generate a brand transformation plan.

Available brands:
${brandList}

User request: $ARGUMENTS

If no brand is specified, ask the user to choose from the available brands.
If a brand is specified, load its definition and proceed with analysis.`;
}

export default BranderPlugin;
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/index.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/index.ts tests/index.test.ts
git commit -m "feat: implement plugin entry point with /brand command"
```

---

## Task 10: Brand Context Injection

**Files:**
- Modify: `src/index.ts`
- Create: `tests/brand-injection.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/brand-injection.test.ts
import { describe, it, expect, beforeAll } from "bun:test";
import { loadBrands, getBrandXml } from "../src/brands";

describe("Brand context injection", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  it("should inject brand XML into agent prompt", async () => {
    const pluginModule = await import("../src/index");
    const mockCtx = { cwd: () => "/test/project" };
    const plugin = await pluginModule.default(mockCtx);

    // Get the brander agent config
    const config: any = {
      agent: {},
      command: {},
    };
    await plugin.config(config);

    const branderConfig = config.agent.brander;

    // The prompt should have the $BRAND_XML placeholder
    expect(branderConfig.prompt).toContain("$BRAND_XML");
  });

  it("should have nof1 brand XML available", () => {
    const xml = getBrandXml("nof1");

    expect(xml).toBeDefined();
    expect(xml).toContain('name="nof1"');
    expect(xml).toContain("#dcde8d"); // primary color
  });
});
```

**Step 2: Run test to verify it passes**

Run: `bun test tests/brand-injection.test.ts`
Expected: PASS (placeholder is already in the agent prompt)

**Step 3: Commit**

```bash
git add tests/brand-injection.test.ts
git commit -m "test: add brand context injection tests"
```

---

## Task 11: Integration Test

**Files:**
- Create: `tests/integration.test.ts`

**Step 1: Write the integration test**

```typescript
// tests/integration.test.ts
import { describe, it, expect, beforeAll } from "bun:test";
import { loadBrands, getBrand, listBrands, getBrandXml } from "../src/brands";
import { agents, PRIMARY_AGENT_NAME } from "../src/agents";

describe("Brander plugin integration", () => {
  beforeAll(async () => {
    await loadBrands();
  });

  describe("Brand loading", () => {
    it("should load nof1 brand with all required sections", () => {
      const brand = getBrand("nof1");

      expect(brand).toBeDefined();
      expect(brand!.name).toBe("nof1");
      expect(brand!.version).toBe("1.0");

      // Required sections
      expect(brand!.meta).toBeDefined();
      expect(brand!.colors).toBeDefined();
      expect(brand!.typography).toBeDefined();
      expect(brand!.spacing).toBeDefined();
      expect(brand!.radius).toBeDefined();

      // Optional sections
      expect(brand!.components).toBeDefined();
      expect(brand!.voice).toBeDefined();
      expect(brand!.guidelines).toBeDefined();
    });

    it("should have correct nof1 color palette", () => {
      const brand = getBrand("nof1");
      const primary = brand!.colors.palette.find((c) => c.name === "primary");
      const interactive = brand!.colors.palette.find((c) => c.name === "interactive");

      expect(primary?.value).toBe("#dcde8d");
      expect(interactive?.value).toBe("#034cff");
    });

    it("should have correct nof1 typography", () => {
      const brand = getBrand("nof1");
      const sansFont = brand!.typography.fonts.find((f) => f.role === "sans");
      const monoFont = brand!.typography.fonts.find((f) => f.role === "mono");

      expect(sansFont?.family).toBe("Inter");
      expect(monoFont?.family).toBe("IBM Plex Mono");
    });
  });

  describe("Agent configuration", () => {
    it("should have brander as primary agent", () => {
      expect(PRIMARY_AGENT_NAME).toBe("brander");
      expect(agents.brander.mode).toBe("primary");
    });

    it("should have subagents with read-only tools", () => {
      expect(agents["style-analyzer"].tools?.write).toBe(false);
      expect(agents["style-analyzer"].tools?.edit).toBe(false);
      expect(agents["component-scanner"].tools?.write).toBe(false);
      expect(agents["component-scanner"].tools?.edit).toBe(false);
    });

    it("should have brander with read-only tools", () => {
      expect(agents.brander.tools?.write).toBe(false);
      expect(agents.brander.tools?.edit).toBe(false);
    });
  });

  describe("Full plugin initialization", () => {
    it("should initialize without errors", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };

      const plugin = await pluginModule.default(mockCtx);

      expect(plugin).toBeDefined();
      expect(plugin.config).toBeDefined();
    });

    it("should configure all components", async () => {
      const pluginModule = await import("../src/index");
      const mockCtx = { cwd: () => "/test/project" };
      const plugin = await pluginModule.default(mockCtx);

      const config: any = {
        agent: {},
        command: {},
      };

      await plugin.config(config);

      // Agents registered
      expect(Object.keys(config.agent)).toContain("brander");
      expect(Object.keys(config.agent)).toContain("style-analyzer");
      expect(Object.keys(config.agent)).toContain("component-scanner");

      // Command registered
      expect(config.command.brand).toBeDefined();
      expect(config.command.brand.agent).toBe("brander");
    });
  });
});
```

**Step 2: Run all tests**

Run: `bun test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add tests/integration.test.ts
git commit -m "test: add integration tests for full plugin"
```

---

## Task 12: Build and Verify

**Step 1: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

**Step 2: Run linter**

Run: `bun run lint`
Expected: No errors (or fix any issues)

**Step 3: Run formatter**

Run: `bun run format`
Expected: Files formatted

**Step 4: Run full test suite**

Run: `bun test`
Expected: All tests PASS

**Step 5: Build the plugin**

Run: `bun run build`
Expected: dist/index.js and dist/index.d.ts created

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify build and all tests pass"
```

---

## Summary

This plan implements the brander plugin in 12 incremental tasks:

1. **Project Scaffolding** - package.json, tsconfig, biome, minimal index.ts
2. **Brand Schema Types** - TypeScript interfaces for brand structure
3. **XML Parser** - Parse brand XML files into typed objects
4. **Brand Loader** - Load bundled brands at startup
5. **Style Analyzer** - Subagent for CSS/Tailwind analysis
6. **Component Scanner** - Subagent for UI component analysis
7. **Brander Agent** - Primary orchestrator agent
8. **Agent Registry** - Export all agents
9. **Plugin Entry Point** - Full plugin with /brand command
10. **Brand Context Injection** - Tests for XML injection
11. **Integration Tests** - End-to-end verification
12. **Build and Verify** - Final checks

Each task follows TDD: write failing test, implement, verify pass, commit.

Total estimated time: 2-3 hours for experienced developer.
