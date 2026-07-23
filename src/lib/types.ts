export type PromptMode = "template" | "static";

export type VisibilityIntent =
  | { kind: "private" }
  | { kind: "public" }
  | { kind: "timed"; hours: number };

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

/** Field types that use the `options` array. */
export const OPTION_FIELD_TYPES: FieldType[] = ["select", "radio", "checkbox"];

export function usesOptions(type: FieldType): boolean {
  return OPTION_FIELD_TYPES.includes(type);
}

export type PromptFieldInput = {
  field_key: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options?: string[] | null;
  sort_order: number;
  placeholder?: string | null;
};
