import * as v from "valibot";

import { AGENTS } from "@/agents";

export const AgentOverrideSchema = v.partial(
  v.object({
    model: v.string(),
    temperature: v.pipe(v.number(), v.minValue(0), v.maxValue(2)),
    maxSteps: v.pipe(v.number(), v.integer(), v.minValue(1)),
  }),
);

export const ReskinConfigSchema = v.object({
  agents: v.optional(v.record(v.enum(AGENTS), AgentOverrideSchema)),
});

export type AgentOverride = v.InferOutput<typeof AgentOverrideSchema>;
export type ReskinConfig = v.InferOutput<typeof ReskinConfigSchema>;
