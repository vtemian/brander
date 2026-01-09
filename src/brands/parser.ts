import * as v from "valibot";

import { type Brand, BrandSchema } from "./schema";

export function parseBrandJson(json: string): Brand {
  const data = JSON.parse(json);
  const result = v.safeParse(BrandSchema, data);

  if (!result.success) {
    const issues = v.flatten(result.issues);
    const errorMessages = Object.entries(issues.nested || {})
      .map(([path, errors]) => `${path}: ${errors?.join(", ")}`)
      .join("; ");
    throw new Error(`Invalid brand JSON: ${errorMessages || "validation failed"}`);
  }

  return result.output;
}
