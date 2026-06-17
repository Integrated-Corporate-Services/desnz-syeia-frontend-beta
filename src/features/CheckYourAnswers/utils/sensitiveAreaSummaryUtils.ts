import { FIELD_LABELS } from '../constants/applicationSummaryLabels';

type PassedLayer = { layerName?: string; layer_name?: string; name?: string };

export type ReviewSummaryForLayers = {
  checks?: {
    automated?: {
      passed?: {
        screeningRequired?: PassedLayer[];
        noScreening?: PassedLayer[];
      };
    };
    manual?: {
      selected?: PassedLayer[];
      customAdded?: PassedLayer[];
    };
  };
};

export const yesNoFromBoolean = (value?: boolean | null): string => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '-';
};

export const getPassedLayerNames = (
  layers?: string[],
  reviewSummary?: ReviewSummaryForLayers | null,
): string[] => {
  if (Array.isArray(layers) && layers.length > 0) {
    return Array.from(new Set(layers.filter(Boolean)));
  }

  if (!reviewSummary?.checks?.automated?.passed) return [];

  const { screeningRequired = [], noScreening = [] } = reviewSummary.checks.automated.passed;
  const layerNames = [...screeningRequired, ...noScreening]
    .map((layer) => layer.layerName)
    .filter(Boolean) as string[];

  return Array.from(new Set(layerNames));
};

export const getManualLayerNames = (manual?: {
  selected?: PassedLayer[];
  customAdded?: PassedLayer[];
}): string[] => {
  const selectedLayers = manual?.selected || [];
  const customAddedLayers = manual?.customAdded || [];

  const selectedLayerNames = selectedLayers
    .map((layer) => layer.layerName)
    .filter((name): name is string => Boolean(name));
  const customLayerNames = customAddedLayers
    .map((layer) => layer.layerName || layer.layer_name || layer.name)
    .filter((name): name is string => Boolean(name));

  return Array.from(new Set([...selectedLayerNames, ...customLayerNames]));
};

export const getManualLayerNamesFromReviewSummary = (
  reviewSummary?: ReviewSummaryForLayers | null,
): string[] => {
  const manual = reviewSummary?.checks?.manual;
  return getManualLayerNames(
    manual
      ? {
          selected: manual.selected,
          customAdded: manual.customAdded,
        }
      : undefined,
  );
};

export const getAssetPresenceDisplayText = (optionId?: number): string => {
  switch (optionId) {
    case 1:
      return FIELD_LABELS.POLES_WITHIN_SENSITIVE_AREAS;
    case 2:
      return FIELD_LABELS.POLES_OUTSIDE_SENSITIVE_AREAS;
    case 3:
      return FIELD_LABELS.NO_POLES_SENSITIVE_AREAS;
    default:
      return '-';
  }
};
