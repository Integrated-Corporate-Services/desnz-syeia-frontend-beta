// Route error validation messages for S37
// Centralizes all error messages for route validation

export const DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH = 4000;

export const ROUTE_ERROR_MESSAGES = {
  // General
  missingEastingNorthing: `Enter an Easting and a Northing`,
  missingEasting: `Enter an Easting`,
  missingNorthing: `Enter a Northing`,
  invalidEastingNorthing: 'Enter a number between 000001 and 999999',
  addAnotherRoute: `Select 'Yes' or 'No'`,
  disconnectedRouteJustification: 'Enter a justification for the additional route not requiring a separate s37 application',
  disconnectedRouteJustificationTooLong: `Justification must be ${DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH} characters or fewer`,
};
