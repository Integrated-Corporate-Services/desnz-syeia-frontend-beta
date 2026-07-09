/**
 * NWL Supporting Information Form - Validation Helpers
 */

export function filterErrorLinksByAnchors(errors: string[], anchorIds: string[]): string[] {
    return errors.filter((error) => !anchorIds.some((id) => error.includes(`#${id}`)));
}
