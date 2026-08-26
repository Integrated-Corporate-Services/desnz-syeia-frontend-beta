/**
 * Project Overview Form - Validation Helpers
 */

export function getRelatedFieldAnchorIds(fieldName: string): string[] {
    const anchorIds = new Set<string>([fieldName]);
    
    // Handle date fields - clear both month and year when either is cleared
    if (fieldName.includes('WorkStartDate')) {
        const baseFieldName = fieldName.replace(/-month|-year/, '');
        anchorIds.add(baseFieldName);
        anchorIds.add(`${baseFieldName}-month`);
        anchorIds.add(`${baseFieldName}-year`);
    }
    
    // Handle regular input fields with -inputValue suffix
    if (fieldName.endsWith('-inputValue')) {
        anchorIds.add(fieldName.replace(/-inputValue$/, ''));
    } else if (!fieldName.includes('-month') && !fieldName.includes('-year')) {
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
