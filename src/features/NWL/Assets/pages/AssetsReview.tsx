import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { AssetsBreadcrumbs, AssetSummaryCard, FormActions } from '../components';
import { useApplicationId } from '../hooks';
import { LABELS, HINTS, MESSAGES } from '../constants';
import nwlAssetService, { AssetOutput } from '../services/nwlAssetService';

const AssetsReview: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  
  const [assets, setAssets] = useState<AssetOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assets on mount
  useEffect(() => {
    if (applicationId) {
      fetchAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await nwlAssetService.getAssetsByApplicationId(applicationId);
      setAssets(response.assets || []);
    } catch {
      // Error logging is handled in the service layer
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assetId: string) => {
    if (!assetId || !applicationId) return;
    
    if (!window.confirm(MESSAGES.CONFIRM_DELETE)) {
      return;
    }

    try {
      await nwlAssetService.deleteAsset(assetId);
      
      // Remove from local state immediately for responsive UI
      setAssets(prev => prev.filter(asset => asset.asset_id !== assetId));
      
      // Asset deletion is logged in the service layer
    } catch {
      // Error logging is handled in the service layer
      setError('Failed to delete asset. Please try again.');
      
      // Refresh to get current state
      await fetchAssets();
    }
  };

  const handleChange = (assetId: string) => {
    // Navigate to edit mode (will be implemented)
    navigate(`${NWL_BASE_URL}/${applicationId}/information-about-lines?edit=${assetId}`);
  };

  const handleContinue = () => {
    navigate(`${NWL_BASE_URL}/${applicationId}/application-plan`);
  };

  // Map backend line type codes to display labels
  const lineTypeLabelMap: Record<string, string> = {
    'overhead_line': 'Overhead line',
    'overhead_line_wooden_pole': 'Overhead line and wooden pole(s)',
    'overhead_line_wooden_pole_stay': 'Overhead line and wooden pole(s) and stay(s)',
    'overhead_line_steel_tower': 'Overhead line and steel tower(s)',
    'wooden_pole': 'Wooden pole(s)',
    'stay': 'Stay(s)',
    'steel_tower': 'Steel tower(s)',
    'underground_cable': 'Underground cable',
    'earth_wire_apparatus': 'Earth wire and any other associated apparatus',
    'other': 'Other',
  };

  // Transform AssetOutput to format expected by AssetSummaryCard
  const transformAssetForDisplay = (asset: AssetOutput) => {
    // Build typeOfLine string from line_types and descriptions
    const typeOfLine = asset.line_types
      .map(code => {
        const label = lineTypeLabelMap[code] || code;
        const description = asset.component_descriptions[code] || '';
        return description ? `${label}: ${description}` : label;
      })
      .join('\n\n');

    return {
      assetId: asset.asset_id,
      lineVoltage: asset.line_voltage,
      typeOfLine: typeOfLine,
      // Add required fields for AssetDetails interface
      assetReference: '',
      standardSpecificationReferenceNumber: '',
      lineLength: 0,
      tori_noi: '',
      excavationWorks: null,
    };
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <AssetsBreadcrumbs applicationId={applicationId} currentPage="review" />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            {LABELS.REVIEW_ASSETS_TITLE} {assets.length} asset{assets.length !== 1 ? 's' : ''}
          </h1>

          <p className="govuk-body">{HINTS.REVIEW_INTRO}</p>

          {error && (
            <div className="govuk-error-summary" data-module="govuk-error-summary">
              <div className="govuk-error-summary__body">
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <p className="govuk-body">{MESSAGES.LOADING}</p>
          ) : assets.length === 0 ? (
            <p className="govuk-body">{MESSAGES.NO_ASSETS}</p>
          ) : (
            <>
              {assets.map((asset, index) => (
                <AssetSummaryCard
                  key={asset.asset_id}
                  asset={transformAssetForDisplay(asset)}
                  index={index}
                  onRemove={handleRemove}
                  onChange={handleChange}
                />
              ))}
            </>
          )}

          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={() => navigate(`${NWL_BASE_URL}/${applicationId}/information-about-lines`)}
            disabled={loading}
          >
            {LABELS.ADD_ANOTHER}
          </button>

          <FormActions
            onContinue={handleContinue}
            disabled={loading || assets.length === 0}
          />
        </div>
      </div>
    </main>
  );
};

export default AssetsReview;
