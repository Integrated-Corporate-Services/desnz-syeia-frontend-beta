export const PROJECT_OVERVIEW_ERRORS = {
  PROJECT_NAME_REQUIRED: "Enter a project name",
  
  PROJECT_DESCRIPTION_REQUIRED: "Enter a project description",
  
  TALLEST_POLE_HEIGHT_REQUIRED: "Enter the tallest pole height",
  TALLEST_POLE_HEIGHT_INVALID_NUMBER: "Height must be a valid number",
  TALLEST_POLE_HEIGHT_NEGATIVE: "Height cannot be negative",
  TALLEST_POLE_HEIGHT_DECIMAL_PLACES: "Enter at most 2 decimal places for the pole height",
  
  PLAN_REFERENCE_REQUIRED: "Enter the plan reference",
  
  WORK_START_DATES_REQUIRED: "Select 'Yes' or 'No'",
  
  EARLIEST_DATE_REQUIRED: "Select the month of the earliest expected start date",
  EARLIEST_DATE_INVALID_YEAR: "Enter the year of the earliest expected start date",
  EARLIEST_DATE_MUST_BE_FUTURE: "Earliest expected start date must be in the future",
  
  LATEST_DATE_REQUIRED: "Select the month of the latest expected start date",
  LATEST_DATE_INVALID_YEAR: "Enter the year of the latest expected start date",
  LATEST_DATE_COMPARE_ERROR: "Latest expected start date must not be before the earliest expected start date",

  FILE_UPLOAD_REQUIRED: "Upload a plan information documents",
  
  RELATED_APPLICATIONS_REQUIRED: "Select 'Yes' or 'No'",
  RELATED_APPLICATIONS_ADD: "Select all associated DNO references",
  
  RELATED_CPO_REQUIRED: "Select 'Yes' or 'No'",
  RELATED_CPO_DETAILS_REQUIRED: "Enter the details of the related CPO",
};

export const createErrorLink = (href: string, message: string): string => {
  return `<a href="#${href}">${message}</a>`;
};

export const createMaxYearError = (maxYear: number): string => {
  return `Latest expected start date year must not be more than ${maxYear}`;
};