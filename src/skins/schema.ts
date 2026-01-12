import * as v from "valibot";

// Color definitions
export const PaletteColorSchema = v.object({
  name: v.string(),
  value: v.string(),
  description: v.optional(v.string()),
});

export const SemanticColorSchema = v.object({
  name: v.string(),
  value: v.string(),
});

export const StateColorSchema = v.object({
  name: v.string(),
  value: v.string(),
});

export const DataVizColorSchema = v.object({
  name: v.string(),
  value: v.string(),
});

export const DataVizSchema = v.object({
  categorical: v.array(DataVizColorSchema),
  notes: v.optional(v.string()),
});

export const ColorModesSchema = v.object({
  supportsDarkMode: v.optional(v.string()),
});

export const SkinColorsSchema = v.object({
  palette: v.array(PaletteColorSchema),
  semantic: v.array(SemanticColorSchema),
  dataViz: v.optional(DataVizSchema),
  states: v.optional(v.array(StateColorSchema)),
  modes: v.optional(ColorModesSchema),
});

// Typography definitions
export const FontDefinitionSchema = v.object({
  role: v.string(),
  family: v.string(),
  fallback: v.string(),
  usage: v.optional(v.string()),
});

export const TypeScaleSchema = v.object({
  name: v.string(),
  size: v.string(),
  lineHeight: v.string(),
});

export const SkinTypographySchema = v.object({
  fonts: v.array(FontDefinitionSchema),
  scale: v.array(TypeScaleSchema),
});

// Spacing
export const SkinSpacingSchema = v.object({
  unit: v.string(),
});

// Border radius
export const RadiusSizeSchema = v.object({
  name: v.string(),
  value: v.string(),
});

export const SkinRadiusSchema = v.object({
  sizes: v.array(RadiusSizeSchema),
  notes: v.optional(v.string()),
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

export const SkinComponentsSchema = v.object({
  buttons: v.array(ButtonComponentSchema),
  cards: v.array(CardComponentSchema),
});

// Optional: Voice
export const SkinVoiceSchema = v.object({
  tone: v.string(),
  principles: v.array(v.string()),
});

// Optional: Guidelines
export const SkinGuidelinesSchema = v.object({
  dos: v.array(v.string()),
  donts: v.array(v.string()),
});

// Meta confidence levels
export const ConfidenceSchema = v.object({
  high: v.optional(v.array(v.string())),
  medium: v.optional(v.array(v.string())),
  unknown: v.optional(v.array(v.string())),
});

// Meta
export const SkinMetaSchema = v.object({
  description: v.optional(v.string()),
  target: v.picklist(["web", "mobile", "all"]),
  confidence: v.optional(ConfidenceSchema),
});

// Main Skin schema
export const SkinSchema = v.object({
  name: v.string(),
  version: v.string(),
  meta: SkinMetaSchema,
  colors: SkinColorsSchema,
  typography: SkinTypographySchema,
  spacing: SkinSpacingSchema,
  radius: SkinRadiusSchema,
  components: v.optional(SkinComponentsSchema),
  voice: v.optional(SkinVoiceSchema),
  guidelines: v.optional(SkinGuidelinesSchema),
});

// Infer TypeScript types from schemas
export type PaletteColor = v.InferOutput<typeof PaletteColorSchema>;
export type SemanticColor = v.InferOutput<typeof SemanticColorSchema>;
export type StateColor = v.InferOutput<typeof StateColorSchema>;
export type DataVizColor = v.InferOutput<typeof DataVizColorSchema>;
export type DataViz = v.InferOutput<typeof DataVizSchema>;
export type ColorModes = v.InferOutput<typeof ColorModesSchema>;
export type SkinColors = v.InferOutput<typeof SkinColorsSchema>;
export type FontDefinition = v.InferOutput<typeof FontDefinitionSchema>;
export type TypeScale = v.InferOutput<typeof TypeScaleSchema>;
export type SkinTypography = v.InferOutput<typeof SkinTypographySchema>;
export type SkinSpacing = v.InferOutput<typeof SkinSpacingSchema>;
export type RadiusSize = v.InferOutput<typeof RadiusSizeSchema>;
export type SkinRadius = v.InferOutput<typeof SkinRadiusSchema>;
export type ButtonComponent = v.InferOutput<typeof ButtonComponentSchema>;
export type CardComponent = v.InferOutput<typeof CardComponentSchema>;
export type SkinComponents = v.InferOutput<typeof SkinComponentsSchema>;
export type SkinVoice = v.InferOutput<typeof SkinVoiceSchema>;
export type SkinGuidelines = v.InferOutput<typeof SkinGuidelinesSchema>;
export type Confidence = v.InferOutput<typeof ConfidenceSchema>;
export type SkinMeta = v.InferOutput<typeof SkinMetaSchema>;
export type Skin = v.InferOutput<typeof SkinSchema>;
