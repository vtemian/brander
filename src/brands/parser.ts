import { XMLParser } from "fast-xml-parser";

import type {
  Brand,
  BrandColors,
  BrandComponents,
  BrandGuidelines,
  BrandMeta,
  BrandRadius,
  BrandSpacing,
  BrandTypography,
  BrandVoice,
  ButtonComponent,
  CardComponent,
  FontDefinition,
  PaletteColor,
  RadiusSize,
  SemanticColor,
  TypeScale,
} from "./schema";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "_text",
  isArray: (name, jPath) => {
    // Only treat as array when it's an element, not an attribute
    const arrayElements = ["palette", "semantic", "font", "scale", "button", "card", "principle", "do", "dont"];
    if (arrayElements.includes(name)) return true;
    // <size> elements under <radius>
    if (name === "size" && jPath.includes("radius")) return true;
    return false;
  },
});

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseColors(colors: Record<string, unknown>): BrandColors {
  const paletteRaw = ensureArray(colors.palette as Record<string, string>[]);
  const semanticRaw = ensureArray(colors.semantic as Record<string, string>[]);

  const palette: PaletteColor[] = paletteRaw.map((p) => ({
    name: p.name,
    value: p.value,
    description: p.description,
  }));

  const semantic: SemanticColor[] = semanticRaw.map((s) => ({
    name: s.name,
    light: s.light,
    dark: s.dark,
  }));

  return { palette, semantic };
}

function parseTypography(typography: Record<string, unknown>): BrandTypography {
  const fontsRaw = ensureArray(typography.font as Record<string, string>[]);
  const scaleRaw = ensureArray(typography.scale as Record<string, string>[]);

  const fonts: FontDefinition[] = fontsRaw.map((f) => ({
    role: f.role as "sans" | "mono" | "serif",
    family: f.family,
    fallback: f.fallback,
  }));

  const scale: TypeScale[] = scaleRaw.map((s) => ({
    name: s.name,
    size: s.size,
    lineHeight: s["line-height"],
  }));

  return { fonts, scale };
}

function parseSpacing(spacing: Record<string, string>): BrandSpacing {
  return { unit: spacing.unit };
}

function parseRadius(radius: Record<string, unknown>): BrandRadius {
  const sizesRaw = ensureArray(radius.size as Record<string, string>[]);

  const sizes: RadiusSize[] = sizesRaw.map((s) => ({
    name: s.name,
    value: s.value,
  }));

  return { sizes };
}

function parseComponents(components: Record<string, unknown>): BrandComponents {
  const buttonsRaw = ensureArray(components.button as Record<string, string>[]);
  const cardsRaw = ensureArray(components.card as Record<string, string>[]);

  const buttons: ButtonComponent[] = buttonsRaw.map((b) => ({
    variant: b.variant,
    bg: b.bg,
    text: b.text,
    radius: b.radius,
    border: b.border,
  }));

  const cards: CardComponent[] = cardsRaw.map((c) => ({
    bg: c.bg,
    border: c.border,
    radius: c.radius,
    padding: c.padding,
  }));

  return { buttons, cards };
}

function parseVoice(voice: Record<string, unknown>): BrandVoice {
  const tone = (voice.tone as Record<string, string>)?._text || (voice.tone as string) || "";
  const principlesEl = voice.principles as Record<string, unknown> | undefined;
  const principlesRaw = principlesEl ? ensureArray(principlesEl.principle as (string | Record<string, string>)[]) : [];

  return {
    tone,
    principles: principlesRaw.map((p) => (typeof p === "string" ? p : p._text || "")),
  };
}

function parseGuidelines(guidelines: Record<string, unknown>): BrandGuidelines {
  const dosRaw = ensureArray(guidelines.do as (string | Record<string, string>)[]);
  const dontsRaw = ensureArray(guidelines.dont as (string | Record<string, string>)[]);

  return {
    dos: dosRaw.map((d) => (typeof d === "string" ? d : d._text || "")),
    donts: dontsRaw.map((d) => (typeof d === "string" ? d : d._text || "")),
  };
}

function parseMeta(meta: Record<string, unknown>): BrandMeta {
  const description = (meta.description as Record<string, string>)?._text || (meta.description as string) || "";
  const target = (meta.target as Record<string, string>)?._text || (meta.target as string) || "";

  const VALID_TARGETS = ["web", "mobile", "all"] as const;
  if (!VALID_TARGETS.includes(target as (typeof VALID_TARGETS)[number])) {
    throw new Error(`Invalid target value "${target}". Must be one of: ${VALID_TARGETS.join(", ")}`);
  }

  return {
    description,
    target: target as "web" | "mobile" | "all",
  };
}

export function parseBrandXml(xml: string): Brand {
  const parsed = parser.parse(xml);
  const root = parsed.brand;

  if (!root) {
    throw new Error("Invalid brand XML: root element must be <brand>");
  }

  if (!root.name) {
    throw new Error("Invalid brand XML: name attribute is required on <brand>");
  }
  if (!root.version) {
    throw new Error("Invalid brand XML: version attribute is required on <brand>");
  }

  if (!root.meta) {
    throw new Error("Missing required section: meta");
  }
  if (!root.colors) {
    throw new Error("Missing required section: colors");
  }
  if (!root.typography) {
    throw new Error("Missing required section: typography");
  }
  if (!root.spacing) {
    throw new Error("Missing required section: spacing");
  }
  if (!root.radius) {
    throw new Error("Missing required section: radius");
  }

  const brand: Brand = {
    name: root.name,
    version: root.version,
    meta: parseMeta(root.meta),
    colors: parseColors(root.colors),
    typography: parseTypography(root.typography),
    spacing: parseSpacing(root.spacing),
    radius: parseRadius(root.radius),
  };

  if (root.components) {
    brand.components = parseComponents(root.components);
  }

  if (root.voice) {
    brand.voice = parseVoice(root.voice);
  }

  if (root.guidelines) {
    brand.guidelines = parseGuidelines(root.guidelines);
  }

  return brand;
}
