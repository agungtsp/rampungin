export function interpolateTemplate(
  body: string,
  values: Record<string, string>,
): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return values[key] ?? "";
  });
}

export type MissingRequiredField = { key: string; label: string };

export function getMissingRequiredFields(
  fields: { field_key: string; label: string; required: boolean }[],
  values: Record<string, string>,
): MissingRequiredField[] {
  return fields
    .filter((f) => f.required)
    .filter((f) => !(values[f.field_key] ?? "").trim())
    .map((f) => ({ key: f.field_key, label: f.label }));
}

export function missingRequiredFields(
  fields: { field_key: string; label: string; required: boolean }[],
  values: Record<string, string>,
): string[] {
  return getMissingRequiredFields(fields, values).map((f) => f.label);
}
