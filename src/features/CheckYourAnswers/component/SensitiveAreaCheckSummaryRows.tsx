import React from 'react';
import { SENSITIVE_AREA_LABELS } from '../../../constants/sensitiveAreaLabels';
import {
  getPassedLayerNames,
  yesNoFromBoolean,
  type ReviewSummaryForLayers,
} from '../utils/sensitiveAreaSummaryUtils';

interface SensitiveAreaCheckSummaryRowsProps {
  toleranceRequired?: boolean | null;
  toleranceValue?: number | null;
  layers?: string[];
  reviewSummary?: ReviewSummaryForLayers | null;
}

const SensitiveAreaCheckSummaryRows: React.FC<SensitiveAreaCheckSummaryRowsProps> = ({
  toleranceRequired,
  toleranceValue,
  layers,
  reviewSummary,
}) => {
  const layerNames = getPassedLayerNames(layers, reviewSummary);

  return (
    <>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {SENSITIVE_AREA_LABELS.ROUTE_TOLERANCE_QUESTION}
        </dt>
        <dd className="govuk-summary-list__value">{yesNoFromBoolean(toleranceRequired)}</dd>
      </div>
      {toleranceRequired === true && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{SENSITIVE_AREA_LABELS.TOLERANCE_METRES}</dt>
          <dd className="govuk-summary-list__value">
            {typeof toleranceValue === 'number' ? `${toleranceValue}m` : '-'}
          </dd>
        </div>
      )}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{SENSITIVE_AREA_LABELS.SENSITIVE_AREAS_PASSED}</dt>
        <dd className="govuk-summary-list__value">
          <ul className="govuk-list govuk-list--bullet">
            {layerNames.length > 0 ? (
              layerNames.map((layerName) => <li key={layerName}>{layerName}</li>)
            ) : (
              <li>-</li>
            )}
          </ul>
        </dd>
      </div>
    </>
  );
};

export default SensitiveAreaCheckSummaryRows;
