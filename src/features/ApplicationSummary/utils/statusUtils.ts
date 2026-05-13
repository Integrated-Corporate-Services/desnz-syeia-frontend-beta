export const getStatusTagClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('submitted')) return 'govuk-tag--blue';
    if (statusLower.includes('approved')) return 'govuk-tag--green';
    if (statusLower.includes('rejected')) return 'govuk-tag--red';
    if (statusLower.includes('withdrawn')) return 'govuk-tag--grey';
    return 'govuk-tag--blue';
};
