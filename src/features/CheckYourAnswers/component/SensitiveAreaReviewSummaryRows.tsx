import React from 'react';
import { SENSITIVE_AREA_LABELS } from '../../../constants/sensitiveAreaLabels';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { createLogger } from '../../../utils/logger';
import { SensitiveAreaReviewDocument } from './ApplicationSubmit.types';
import {
  getAssetPresenceDisplayText,
  getManualLayerNames,
  getManualLayerNamesFromReviewSummary,
  type ReviewSummaryForLayers,
} from '../utils/sensitiveAreaSummaryUtils';

const logger = createLogger('SensitiveAreaReviewSummaryRows');

interface SensitiveAreaReviewSummaryRowsProps {
  assetPresenceOptionId?: number;
  applicationDocuments?: SensitiveAreaReviewDocument[];
  manual?: {
    selected?: { layerName?: string; layer_name?: string; name?: string }[];
    customAdded?: { layerName?: string; layer_name?: string; name?: string }[];
  };
  reviewSummary?: ReviewSummaryForLayers | null;
}

const SensitiveAreaReviewSummaryRows: React.FC<SensitiveAreaReviewSummaryRowsProps> = ({
  assetPresenceOptionId,
  applicationDocuments,
  manual,
  reviewSummary,
}) => {
  const manualLayerNames = manual
    ? getManualLayerNames(manual)
    : getManualLayerNamesFromReviewSummary(reviewSummary);

  return (
    <>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{SENSITIVE_AREA_LABELS.OTHER_AREAS}</dt>
        <dd className="govuk-summary-list__value">
          {manualLayerNames.length > 0 ? (
            <ul className="govuk-list govuk-list--bullet">
              {manualLayerNames.map((layerName) => (
                <li key={layerName}>{layerName}</li>
              ))}
            </ul>
          ) : (
            '-'
          )}
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{SENSITIVE_AREA_LABELS.ENV_ARCH_DOCS}</dt>
        <dd className="govuk-summary-list__value">
          <ul className="govuk-list">
            {applicationDocuments && applicationDocuments.length > 0 ? (
              applicationDocuments.map((doc) => (
                <li key={doc.document_id}>
                  <a
                    href="#"
                    className="govuk-link"
                    onClick={async (e) => {
                      e.preventDefault();
                      const key = doc.s3_key || doc.file_id;
                      if (key) {
                        try {
                          await downloadS3FileOnSameTab(key);
                        } catch (error) {
                          logger.error('Failed to download file:', { error });
                        }
                      }
                    }}
                  >
                    {doc.title}
                  </a>
                </li>
              ))
            ) : (
              <li>-</li>
            )}
          </ul>
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{SENSITIVE_AREA_LABELS.POLES_LINES_SENSITIVE}</dt>
        <dd className="govuk-summary-list__value">
          {getAssetPresenceDisplayText(assetPresenceOptionId)}
        </dd>
      </div>
    </>
  );
};

export default SensitiveAreaReviewSummaryRows;
