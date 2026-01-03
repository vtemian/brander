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
          const childAttrRegex = /(\w+(?:-\w+)?)="([^"]*)"/g;
          let childAttrMatch;
          while ((childAttrMatch = childAttrRegex.exec(attrStr)) !== null) {
            childAttrs[childAttrMatch[1]] = childAttrMatch[2];
          }
          children.push({ tag: childTag, attrs: childAttrs, children: [], text: "" });
          remaining = remaining.slice(selfClosingMatch[0].length);
          continue;
        }

        // Find matching closing tag (handle nesting)
        let depth = 0;
        let endIndex = 0;

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
