/**
 * NWL Subsection names - must match backend constants
 */
export const NWL_SUBSECTIONS = {
  APPLICANT_DETAILS: 'Applicant details',
  CHECK_APPLICANT_CONTACT_DETAILS: 'Check applicant contact details',
  LANDOWNER_OR_OCCUPANT_DETAILS: 'Landowner or occupant details',
  APPLICATION_AND_LAND_DETAILS: 'Application and Land details',
  TYPE_OF_USE: 'Type of use',
  GROUNDS_FOR_APPLICATION: 'Grounds for application',
  ASSETS: 'Assets',
  SUPPORTING_INFORMATION: 'Supporting information',
  NEGOTIATIONS: 'Negotiations',
  APPLICATION_STATEMENT: 'Application statement',
  PAYMENT: 'Payment',
  PAY_AND_SUBMIT: 'Pay and submit',
  
};

/**
 * Get status class for a given status string
 */
export function getStatusClass(status: string): string {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'completed') return 'govuk-tag govuk-tag--turquoise';
  if (statusLower === 'in progress') return 'govuk-tag govuk-tag--blue';
  if (statusLower === 'not completed' || statusLower === 'incomplete') return 'govuk-tag govuk-tag--blue';
  if (statusLower === 'cannot start yet') return 'govuk-tag govuk-tag--grey';
  
  return 'govuk-tag govuk-tag--blue'; // default to not completed
}

/**
 * Get display status text for a given status string
 */
export function getStatusText(status: string): string {
  if (!status) return 'Not completed';
  // Map "Incomplete" and "Not started" to "Not completed" for NWL
  if (status.toLowerCase() === 'incomplete' || status.toLowerCase() === 'not started') return 'Not completed';
  return status;
}

/**
 * Check if a subsection's dependencies are met
 */
export function checkDependencies(
  progress: Array<{ subsection_name: string; status: string }> | null,
  subsectionName: string
): boolean {
  if (!progress || progress.length === 0) {
    return false;
  }
  
  // "Grounds for application" depends on "Type of use" being completed
  if (subsectionName === NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION) {
    const typeOfUse = progress.find(p => p.subsection_name === NWL_SUBSECTIONS.TYPE_OF_USE);
    return typeOfUse?.status?.toLowerCase() === 'completed';
  }
  
  // All other subsections after "Grounds for application" depend on it being completed
  const afterGroundsSubsections = [
    'Objector introduction', 
    'Objector details',
    'Site address',
    'Land registry',
    'OS Grid reference',
    'Identifying information',
    NWL_SUBSECTIONS.ASSETS,
    NWL_SUBSECTIONS.NEGOTIATIONS,
    NWL_SUBSECTIONS.SUPPORTING_INFORMATION,
    'Check your answers'
  ];
  
  if (afterGroundsSubsections.includes(subsectionName)) {
    const groundsForApplication = progress.find(p => p.subsection_name === NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION);
    return groundsForApplication?.status?.toLowerCase() === 'completed';
  }
  
  return true; // No dependencies
}

/**
 * Get progress status for a specific subsection name with dependency checking
 */
export function getSubsectionStatus(
  progress: Array<{ subsection_name: string; status: string }> | null,
  subsectionName: string
): string {
  if (!progress || progress.length === 0) {
    return 'Not completed';
  }
  
  // Check dependencies first
  if (!checkDependencies(progress, subsectionName)) {
    return 'Cannot start yet';
  }
  
  const item = progress.find(p => p.subsection_name === subsectionName);
  return item?.status || 'Not completed';
}
