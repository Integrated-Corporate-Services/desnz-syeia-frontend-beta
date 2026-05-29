// Route error validation messages for S37
// Centralizes all error messages for route validation

export const ROUTE_ERROR_MESSAGES = {
  // General
  missingEastingNorthing: (routeName: string, pointIdx: number) => `${routeName} Point ${pointIdx + 1} -> Enter an Easting and a Northing`,
  missingEasting: (routeName: string, pointIdx: number) => `${routeName} Point ${pointIdx + 1} Easting -> Enter an Easting`,
  missingNorthing: (routeName: string, pointIdx: number) => `${routeName} Point ${pointIdx + 1} Northing -> Enter a Northing`,
  invalidEastingNorthing: 'Enter a number between 000001 and 999999',
  addAnotherRoute: `Select 'Yes' or 'No'`,
  disconnectedRouteJustification: 'Enter a justification for the additional route not requiring a separate s37 application',
};
