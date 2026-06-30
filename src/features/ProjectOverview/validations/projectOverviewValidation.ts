/**
 * Project Overview Form - Validation Helpers
 */

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

export function clearFieldErrorsFromState(
    fieldName: string,
    fieldErrors: Record<string, string>,
    summaryErrors: string[]
): { fieldErrors: Record<string, string>; summaryErrors: string[] } {
    const anchorIds = getRelatedFieldAnchorIds(fieldName);
    const nextFieldErrors = { ...fieldErrors };
    anchorIds.forEach((id) => delete nextFieldErrors[id]);

    return {
        fieldErrors: nextFieldErrors,
        summaryErrors: filterErrorLinksByAnchors(summaryErrors, anchorIds),
    };
}
