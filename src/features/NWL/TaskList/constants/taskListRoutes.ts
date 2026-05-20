export const NWL_TASK_LIST_ROUTES = {
  APPLICANT_DETAILS: '/nwl/:applicationId/applicant-details',
  NETWORK_OPERATOR_CONTACT_DETAILS: '/nwl/:applicationId/network-operator-contact-details',
  
  TYPE_OF_USE: '/nwl/:applicationId/type-of-use',
  WAYLEAVE_OFFER: '/nwl/:applicationId/wayleave-offer',
  GROUNDS_FOR_APPLICATION: '/nwl/:applicationId/grounds-for-application',
  
  OBJECTOR_DETAILS_INTRODUCTION: '/nwl/:applicationId/objector-details-introduction',
  OBJECTOR_DETAILS: '/nwl/:applicationId/objector-details',
  
  SITE_ADDRESS: '/nwl/:applicationId/site-address',
  LAND_REGISTRY: '/nwl/:applicationId/land-registry',
  OS_GRID_REFERENCE: '/nwl/:applicationId/os-grid-reference',
  IDENTIFYING_INFORMATION: '/nwl/:applicationId/identifying-information',
  
  INFORMATION_ABOUT_LINES: '/nwl/:applicationId/information-about-lines',
  APPLICATION_PLAN: '/nwl/:applicationId/application-plan',
  PLAN_VERIFICATION: '/nwl/:applicationId/plan-verification',
  
  EXISTING_NEGOTIATIONS: '/nwl/:applicationId/existing-negotiations',
  EVIDENCE_OF_NEGOTIATIONS: '/nwl/:applicationId/evidence-of-negotiations',
  
  RELATED_APPLICATIONS: '/nwl/:applicationId/related-applications',
  
  CHECK_YOUR_ANSWERS: '/nwl/:applicationId/check-your-answers',
  PAY_AND_SUBMIT: '/nwl/:applicationId/pay-and-submit',
};

export const buildNwlRoute = (routeTemplate: string, applicationId: string | undefined): string => {
  if (!applicationId) {
    return routeTemplate;
  }
  return routeTemplate.replace(':applicationId', applicationId);
};
