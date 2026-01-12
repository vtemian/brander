import * as v from "valibot";

import { type Skin, SkinSchema } from "./schema";

export function parseSkinJson(json: string): Skin {
  const data = JSON.parse(json);
  const result = v.safeParse(SkinSchema, data);

  if (!result.success) {
    const issues = v.flatten(result.issues);
    const errorMessages = Object.entries(issues.nested || {})
      .map(([path, errors]) => `${path}: ${errors?.join(", ")}`)
      .join("; ");
    throw new Error(`Invalid skin JSON: ${errorMessages || "validation failed"}`);
  }

  return result.output;
}
