export const POST_CONSULTATION_CONSTANTS = {
  PAGE_TITLE: "Post consultation actions",
  BREADCRUMB_LABEL: "Post consultation actions",
  LOADING_MESSAGE: "Loading...",
  SAVE_SUCCESS_MESSAGE: "Saved successfully!",
  ERROR_MISSING_APP_ID: "Application ID is missing",
  ERROR_LOAD_FAILED: "Failed to load existing data",
  ERROR_SAVE_FAILED: "Failed to save consultation outcome",
} as const;

export const LPA_QUESTION_TEXT = {
  MAIN_QUESTION:
    "Was the Local Planning Authority's (LPA) agreement to the proposal subject to modifications or conditions being applied to the consent?",
  ACCEPTANCE_QUESTION: "Do you accept the modifications or conditions?",
  EXPLANATION_LABEL: "Please explain why",
  EXPLANATION_HINT:
    "Provide details about why you do not accept the conditions",
} as const;
