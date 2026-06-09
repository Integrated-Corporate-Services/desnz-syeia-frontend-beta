/**
 * Constants for NWL Assets feature
 */

import type { LineTypeOption } from '../types';

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  INFORMATION_ABOUT_LINES: "Information about lines",
  REVIEW_ASSETS: "Review assets",
  ASSETS: "Assets",
} as const;

export const LABELS = {
  ADD_ASSET_TITLE: "Add an asset",
  EDIT_ASSET_TITLE: "Edit asset",
  REVIEW_ASSETS_TITLE: "You have added",
  LINE_VOLTAGE: "Line voltage",
  LINE_TYPE: "Line type",
  DESCRIPTION_LABEL: "Add any helpful information (optional)",
  COMMENTS: "Comments",
  ASSET: "Asset",
  CONTINUE: "Save and continue",
  SAVE_FOR_LATER: "Save for later",
  ADD_ANOTHER: "Add another asset",
  REMOVE: "Remove",
  CHANGE: "Change",
  // Application Plan page
  APPLICATION_PLAN_TITLE: "Provide an application plan",
  UPLOAD_SECTION_TITLE: "Upload an application plan",
  // Assets Match Plan page
  ASSETS_MATCH_PLAN_TITLE: "Do the assets listed match those shown on the application plan?",
  YES: "Yes",
  NO: "No",
  EXPLAIN_MISMATCH_LABEL: "Explain why the assets listed do not match those shown on the application plan",
} as const;

export const HINTS = {
  ADD_ASSET_INTRO: "Tell us about every electrical asset that is or will be on the land specified in this application. You can only add one asset per page and can add another one on the next page.",
  EDIT_ASSET_INTRO: "Update the details for this asset. Changes will be reflected in your asset review page.",
  SELECT_VOLTAGE: "Select the voltage for this asset",
  SELECT_LINE_TYPES: "Select all items for this asset. You can add a Comment for each item you select.",
  REVIEW_INTRO: "Review the assets you have added. You can change them at any time before you submit this application.",
  // Application Plan page
  APPLICATION_PLAN_INTRO: "We recommend using an Ordnance Survey plan showing the whole property and the closely surrounding area.",
  APPLICATION_PLAN_MUST_SHOW_HEADING: "The plan must clearly show the:",
  APPLICATION_PLAN_BULLETS: [
    "electric line",
    "voltage types, overhead lines and underground cables",
    "pole numbers",
    "property boundary",
    "date, key and scale"
  ],
  APPLICATION_PLAN_GUIDANCE_LINK_TEXT: "See the full guidance (opens in a new tab)",
  APPLICATION_PLAN_GUIDANCE_LINK_URL: "https://assets.publishing.service.gov.uk/media/5a756afae5274a3edd9a4c25/wayleave_guidance.pdf",
  // Assets Match Plan page
  EXPLAIN_MISMATCH_HINT: "You can enter up to 4,000 characters saurav",
} as const;

export const LINE_TYPE_OPTIONS: LineTypeOption[] = [
  { value: "overhead-line", label: "Overhead line" },
  { value: "overhead-line-wooden-poles", label: "Overhead line and wooden poles" },
  { value: "overhead-line-wooden-poles-stays", label: "Overhead line and wooden poles and stays" },
  { value: "overhead-line-steel-towers", label: "Overhead line and steel towers" },
  { value: "wooden-poles", label: "Wooden poles" },
  { value: "stays", label: "Stay" },
  { value: "steel-towers", label: "Steel tower" },
  { value: "underground-cable", label: "Underground cable" },
  { value: "earth-wire", label: "Earth wire and any other associated apparatus" },
  { value: "other", label: "Other" },
];

export const FORM_ERRORS = {
  MISSING_VOLTAGE: "Select a line voltage for this asset",
  MISSING_LINE_TYPE: "Select at least one line type",
  MISSING_DESCRIPTION: "Enter a description for this item",
  SAVE_FAILED: "Failed to save asset. Please try again.",
  DELETE_FAILED: "Failed to remove asset. Please try again.",
  // Application Plan page
  MISSING_FILE: "Upload an application plan",
  FILE_UPLOAD_FAILED: "Failed to upload file. Please try again.",
  // Assets Match Plan page
  MISSING_ASSETS_MATCH: "Select yes if the assets listed match those shown on the application plan",
  MISSING_EXPLANATION: "Enter an explanation for why the assets do not match",
} as const;

export const CHARACTER_LIMITS = {
  MAX_DESCRIPTION: 4000,
} as const;

export const MESSAGES = {
  LOADING: "Loading assets...",
  NO_ASSETS: "No assets have been added yet.",
  CONFIRM_DELETE: "Are you sure you want to remove this asset?",
  DOCUMENTS_UPLOADED: "Documents uploaded",
  CHARACTER_REMAINING: (remaining: number) => {
    if (remaining === 0) return 'You have 0 characters remaining';
    if (remaining < 0) return `You have ${Math.abs(remaining)} characters too many`;
    if (remaining === 1) return 'You have 1 character remaining';
    return `You can enter up to ${remaining.toLocaleString()} characters`;
  },
} as const;
