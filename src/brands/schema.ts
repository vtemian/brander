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
