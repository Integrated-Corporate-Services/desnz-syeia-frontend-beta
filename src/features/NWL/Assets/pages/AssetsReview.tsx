import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAssetStore } from '../../../../store/useAssetStore';
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { AssetsBreadcrumbs, AssetSummaryCard, FormActions } from '../components';
import { useApplicationId } from '../hooks';
import { LABELS, HINTS, MESSAGES } from '../constants';

const AssetsReview: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  const { assets: dbAssets, loading, fetchAssets } = useAssetStore();

  useEffect(() => {
    if (applicationId) {
      fetchAssets(applicationId);
    }
  }, [applicationId, fetchAssets]);

  const handleRemove = async (assetId: string) => {
    if (!assetId || !applicationId) return;
    
    if (window.confirm(MESSAGES.CONFIRM_DELETE)) {
      try {
        const { deleteAsset } = await import('../../../../services/asset-service');
        await deleteAsset(applicationId, assetId);
        await fetchAssets(applicationId);
      } catch (error) {
        // Error handled silently - could be logged to monitoring service
        await fetchAssets(applicationId);
      }
    }
  };

  const handleChange = (assetId: string) => {
    // Navigate back to the add asset page with the asset ID to edit
    navigate(`${NWL_BASE_URL}/${applicationId}/information-about-lines?edit=${assetId}`);
  };

  const handleContinue = () => {
    navigate(`${NWL_BASE_URL}/${applicationId}/task-list`);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <AssetsBreadcrumbs applicationId={applicationId} currentPage="review" />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            {LABELS.REVIEW_ASSETS_TITLE} {dbAssets.length} asset{dbAssets.length !== 1 ? 's' : ''}
          </h1>

          <p className="govuk-body">{HINTS.REVIEW_INTRO}</p>

          {loading ? (
            <p className="govuk-body">{MESSAGES.LOADING}</p>
          ) : dbAssets.length === 0 ? (
            <p className="govuk-body">{MESSAGES.NO_ASSETS}</p>
          ) : (
            <>
              {dbAssets.map((asset, index) => (
                <AssetSummaryCard
                  key={asset.assetId || index}
                  asset={asset}
                  index={index}
                  onRemove={handleRemove}
                  onChange={handleChange}
                />
              ))}
            </>
          )}

          <p className="govuk-body">
            <Link
              to={`${NWL_BASE_URL}/${applicationId}/information-about-lines`}
              className="govuk-link"
            >
              {LABELS.ADD_ANOTHER}
            </Link>
          </p>

          <FormActions
            onContinue={handleContinue}
          />
        </div>
      </div>
    </main>
  );
};

export default AssetsReview;
