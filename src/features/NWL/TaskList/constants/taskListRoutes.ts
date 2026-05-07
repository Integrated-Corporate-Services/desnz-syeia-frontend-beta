export const NWL_TASK_LIST_ROUTES = {
  APPLICANT_DETAILS: '/frontend/nwl/:applicationId/applicant-details',
  NETWORK_OPERATOR_CONTACT_DETAILS: '/frontend/nwl/:applicationId/network-operator-contact-details',
  
  TYPE_OF_USE: '/frontend/nwl/:applicationId/type-of-use',
  GROUNDS_FOR_APPLICATION: '/frontend/nwl/:applicationId/grounds-for-application',
  
  OBJECTOR_DETAILS_INTRODUCTION: '/frontend/nwl/:applicationId/objector-details-introduction',
  OBJECTOR_DETAILS: '/frontend/nwl/:applicationId/objector-details',
  
  SITE_ADDRESS: '/frontend/nwl/:applicationId/site-address',
  LAND_REGISTRY: '/frontend/nwl/:applicationId/land-registry',
  OS_GRID_REFERENCE: '/frontend/nwl/:applicationId/os-grid-reference',
  IDENTIFYING_INFORMATION: '/frontend/nwl/:applicationId/identifying-information',
  
  INFORMATION_ABOUT_LINES: '/frontend/nwl/:applicationId/information-about-lines',
  APPLICATION_PLAN: '/frontend/nwl/:applicationId/application-plan',
  PLAN_VERIFICATION: '/frontend/nwl/:applicationId/plan-verification',
  
  EXISTING_NEGOTIATIONS: '/frontend/nwl/:applicationId/existing-negotiations',
  EVIDENCE_OF_NEGOTIATIONS: '/frontend/nwl/:applicationId/evidence-of-negotiations',
  
  RELATED_APPLICATIONS: '/frontend/nwl/:applicationId/related-applications',
  OTHER_IMPORTANT_INFORMATION: '/frontend/nwl/:applicationId/other-important-information',
  
  CHECK_YOUR_ANSWERS: '/frontend/nwl/:applicationId/check-your-answers',
  PAY_AND_SUBMIT: '/frontend/nwl/:applicationId/pay-and-submit',
};

export const buildNwlRoute = (routeTemplate: string, applicationId: string): string => {
  return routeTemplate.replace(':applicationId', applicationId);
};
