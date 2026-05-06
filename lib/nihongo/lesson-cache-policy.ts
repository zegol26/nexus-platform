export type TemplateVariant = 1 | 2 | 3;

export function normalizeRequestedVariant(input: unknown): TemplateVariant {
  const value = Number(input);
  if (value === 1 || value === 2 || value === 3) return value;
  const rotated = ((Math.max(1, Math.floor(value || 1)) - 1) % 3) + 1;
  return rotated as TemplateVariant;
}

export function selectLessonTemplateVariant({
  cachedVariants,
  requestedVariant,
}: {
  cachedVariants: number[];
  requestedVariant: TemplateVariant;
}): TemplateVariant {
  const cached = new Set(cachedVariants);

  if (cached.size < 3 && !cached.has(requestedVariant)) {
    return requestedVariant;
  }

  if (cached.size < 3) {
    return [1, 2, 3].find((candidate) => !cached.has(candidate)) as TemplateVariant;
  }

  return requestedVariant;
}
