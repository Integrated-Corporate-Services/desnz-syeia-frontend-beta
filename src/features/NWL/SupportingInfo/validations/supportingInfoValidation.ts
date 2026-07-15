/**
 * NWL Supporting Information Form - Validation Helpers
 */

export interface ValidationError {
    message: string;
    anchor: string;
}

export function filterErrorLinksByAnchors(errors: ValidationError[], anchorIds: string[]): ValidationError[] {
    return errors.filter((error) => !anchorIds.some((id) => error.anchor === id));
}
