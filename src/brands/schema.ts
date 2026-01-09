import * as v from "valibot";

// Color definitions
export const PaletteColorSchema = v.object({
  name: v.string(),
  value: v.string(),
  description: v.optional(v.string()),
});

export const SemanticColorSchema = v.object({
  name: v.string(),
  light: v.string(),
  dark: v.string(),
});

export const BrandColorsSchema = v.object({
  palette: v.array(PaletteColorSchema),
  semantic: v.array(SemanticColorSchema),
});

// Typography definitions
export const FontDefinitionSchema = v.object({
  role: v.picklist(["sans", "mono", "serif"]),
  family: v.string(),
  fallback: v.string(),
});

export const TypeScaleSchema = v.object({
  name: v.string(),
  size: v.string(),
  lineHeight: v.string(),
});

export const BrandTypographySchema = v.object({
  fonts: v.array(FontDefinitionSchema),
  scale: v.array(TypeScaleSchema),
});

// Spacing
export const BrandSpacingSchema = v.object({
  unit: v.string(),
});

// Border radius
export const RadiusSizeSchema = v.object({
  name: v.string(),
  value: v.string(),
});

export const BrandRadiusSchema = v.object({
  sizes: v.array(RadiusSizeSchema),
});

// Optional: Components
export const ButtonComponentSchema = v.object({
  variant: v.string(),
  bg: v.string(),
  text: v.string(),
  radius: v.optional(v.string()),
  border: v.optional(v.string()),
});

export const CardComponentSchema = v.object({
  bg: v.string(),
  border: v.string(),
  radius: v.string(),
  padding: v.string(),
});

export const BrandComponentsSchema = v.object({
  buttons: v.array(ButtonComponentSchema),
  cards: v.array(CardComponentSchema),
});

// Optional: Voice
export const BrandVoiceSchema = v.object({
  tone: v.string(),
  principles: v.array(v.string()),
});

// Optional: Guidelines
export const BrandGuidelinesSchema = v.object({
  dos: v.array(v.string()),
  donts: v.array(v.string()),
});

// Meta
export const BrandMetaSchema = v.object({
  description: v.optional(v.string()),
  target: v.picklist(["web", "mobile", "all"]),
});

// Main Brand schema
export const BrandSchema = v.object({
  name: v.string(),
  version: v.string(),
  meta: BrandMetaSchema,
  colors: BrandColorsSchema,
  typography: BrandTypographySchema,
  spacing: BrandSpacingSchema,
  radius: BrandRadiusSchema,
  components: v.optional(BrandComponentsSchema),
  voice: v.optional(BrandVoiceSchema),
  guidelines: v.optional(BrandGuidelinesSchema),
});

// Infer TypeScript types from schemas
export type PaletteColor = v.InferOutput<typeof PaletteColorSchema>;
export type SemanticColor = v.InferOutput<typeof SemanticColorSchema>;
export type BrandColors = v.InferOutput<typeof BrandColorsSchema>;
export type FontDefinition = v.InferOutput<typeof FontDefinitionSchema>;
export type TypeScale = v.InferOutput<typeof TypeScaleSchema>;
export type BrandTypography = v.InferOutput<typeof BrandTypographySchema>;
export type BrandSpacing = v.InferOutput<typeof BrandSpacingSchema>;
export type RadiusSize = v.InferOutput<typeof RadiusSizeSchema>;
export type BrandRadius = v.InferOutput<typeof BrandRadiusSchema>;
export type ButtonComponent = v.InferOutput<typeof ButtonComponentSchema>;
export type CardComponent = v.InferOutput<typeof CardComponentSchema>;
export type BrandComponents = v.InferOutput<typeof BrandComponentsSchema>;
export type BrandVoice = v.InferOutput<typeof BrandVoiceSchema>;
export type BrandGuidelines = v.InferOutput<typeof BrandGuidelinesSchema>;
export type BrandMeta = v.InferOutput<typeof BrandMetaSchema>;
export type Brand = v.InferOutput<typeof BrandSchema>;
