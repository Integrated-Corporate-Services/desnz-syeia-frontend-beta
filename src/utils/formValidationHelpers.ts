export function getRelatedFieldAnchorIds(fieldName: string): string[] {
  const anchorIds = new Set<string>([fieldName]);
  if (fieldName.endsWith('-inputValue')) {
    anchorIds.add(fieldName.replace(/-inputValue$/, ''));
  } else {
    anchorIds.add(`${fieldName}-inputValue`);
  }
  return [...anchorIds];
}

export function filterErrorLinksByAnchors(errors: string[], anchorIds: string[]): string[] {
  return errors.filter((error) => !anchorIds.some((id) => error.includes(`#${id}`)));
}

export function clearRecordFieldErrors<T extends Record<string, unknown>>(
  prev: T,
  fields: (keyof T)[]
): T {
  const hasFieldError = fields.some((field) => prev[field]);
  if (!hasFieldError) return prev;

  const next = { ...prev };
  fields.forEach((field) => delete next[field]);
  return next;
}

export function clearKeyedErrors<T extends { key: string }>(errors: T[], keys: string[]): T[] {
  const keySet = new Set(keys);
  return errors.filter((error) => !keySet.has(error.key));
}

export function clearObjectFieldErrors<T extends Record<string, string | undefined>>(
  prev: T,
  field: keyof T
): T {
  if (!prev[field]) return prev;
  const next = { ...prev };
  delete next[field];
  return next;
}
