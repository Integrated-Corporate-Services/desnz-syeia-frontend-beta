import React, { useState, useEffect } from "react";
import { useAssetStore } from '../../../../store/useAssetStore';
import { createAsset } from '../../../../services/asset-service';
import { useParams, useNavigate } from 'react-router-dom';
import { VOLTAGE_CLASS_OPTIONS } from '../../../../constants/asset';

const lineTypeOptions: string[] = [
  "High voltage overhead line",
  "Low voltage overhead line",
  "High voltage overhead line and wooden pole(s)",
  "Low voltage overhead line and wooden pole(s)",
  "High voltage overhead line, wooden pole(s) and stay(s)",
  "Low voltage overhead line, wooden pole(s) and stay(s)",
  "High voltage overhead line and steel tower(s)",
  "Low voltage overhead line and steel tower(s)",
  "High voltage underground cable",
  "Low voltage underground cable",
  "High voltage underground cable and wooden pole(s)",
  "Low voltage underground cable and wooden pole(s)",
  "High voltage underground cable, wooden pole(s) and stay(s)",
  "Low voltage underground cable, wooden pole(s) and stay(s)",
  "Wooden pole(s)",
  "Steel tower(s)",
  "Stay(s)"
];

const voltageOptions: string[] = Array.isArray(VOLTAGE_CLASS_OPTIONS)
  ? VOLTAGE_CLASS_OPTIONS.map((opt: { label: string }) => opt.label)
  : [];

type AssetRow = {
  lineType: string;
  voltage: string;
  description: string;
};

const Asset: React.FC = () => {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [lineType, setLineType] = useState("select");
  const [voltage, setVoltage] = useState("select");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ lineType?: string; voltage?: string; description?: string }>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const { assets: dbAssets, fetchAssets } = useAssetStore();
  // Removed unused location variable
  const params = useParams();
  const navigate = useNavigate();
  // Get applicationId from params or query string
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();

  useEffect(() => {
    if (applicationId) {
      fetchAssets(applicationId);
    }
  }, [applicationId, fetchAssets]);

  useEffect(() => {
    if (dbAssets && dbAssets.length > 0) {
      function hasCodeProperty(obj: unknown): obj is { code: string } {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          Object.prototype.hasOwnProperty.call(obj, 'code') &&
          typeof (obj as { code?: unknown }).code === 'string'
        );
      }
      const mappedAssets: AssetRow[] = dbAssets.map((asset: any) => {
        let voltageStr = '';
        if (Array.isArray(asset.lineVoltage)) {
          voltageStr = asset.lineVoltage.join(', ');
        } else if (typeof asset.lineVoltage === 'string') {
          voltageStr = asset.lineVoltage;
        } else if (hasCodeProperty(asset.lineVoltage)) {
          voltageStr = asset.lineVoltage.code;
        }
        return {
          lineType: asset.typeOfLine || '',
          voltage: voltageStr,
          description: asset.description || asset.standardSpecificationReferenceNumber || '-',
        };
      });
      setAssets(mappedAssets);
    }
  }, [dbAssets]);

  const handleAddAsset = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (lineType === "select") newErrors.lineType = "Select a line type";
    if (voltage === "select") newErrors.voltage = "Select a line voltage";
    if (!description.trim()) newErrors.description = "Enter a description";
    setErrors(newErrors);
    setShowErrorSummary(Object.keys(newErrors).length > 0);
    if (Object.keys(newErrors).length === 0) {
      // Generate a valid UUID for assetId
      const newAssetId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
      const assetPayload = {
        applicationId,
        assets: [
          {
            assetId: newAssetId,
            assetType: 's37',
            typeOfLine: lineType,
            lineVoltage: voltage,
            lineLength: 0,
            description,
            standardSpecificationReferenceNumber: description,
            assetReference: description,
            poles: { hasAddOrReplace: false, add: 0, replace: 0, description: '' },
            overheadLines: { hasAddOrReplace: false, description: '' },
            equipmentRemoval: { isRemoving: false, description: '' },
            isExistingAsset: false,
          }
        ]
      };
      try {
        await createAsset(assetPayload);
        await fetchAssets(applicationId);
        setLineType("select");
        setVoltage("select");
        setDescription("");
        setErrors({});
        setShowErrorSummary(false);
        // No redirect after successful POST
      } catch {
        setErrors({ description: "Failed to add asset. Please try again." });
        setShowErrorSummary(true);
      }
    }
  };

  const handleDeleteAsset = async (index: number) => {
    const assetToDelete = dbAssets[index];
    if (!assetToDelete || !assetToDelete.assetId) return;
    try {
      const { deleteAsset } = await import('../../../../services/asset-service');
      await deleteAsset(applicationId, assetToDelete.assetId);
      // Remove from local assets state for instant UI feedback
      setAssets(prev => prev.filter((_, i) => i !== index));
      await fetchAssets(applicationId); // Also refetch from store for consistency
    } catch {
      setErrors({ description: "Failed to delete asset. Please try again." });
      setShowErrorSummary(true);
    }
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="applications.html">Applications</a>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="application-overview.html">Application overview</a>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="form-assets.html">Trees and vegetation</a>
          </li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Trees and vegetation</h1>
          <div className="govuk-hint govuk-!-margin-bottom-7">Add or edit the trees/vegetation for your application.</div>
          {showErrorSummary && (
            <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}><a href="#">{err}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <form noValidate>
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--m">List of current Assets</caption>
              <thead>
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header app-custom-class">Line type</th>
                  <th scope="col" className="govuk-table__header app-custom-class">Line voltage</th>
                  <th scope="col" className="govuk-table__header app-custom-class">Description</th>
                  <th scope="col" className="govuk-table__header app-custom-class">Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, idx) => (
                  <tr className="govuk-table__row" key={idx}>
                    <td className="govuk-table__header" scope="row">{asset.lineType}</td>
                    <td className="govuk-table__cell">{asset.voltage}</td>
                    <td className="govuk-table__cell">{asset.description}</td>
                    <td className="govuk-table__cell">
                      <a
                        href="#"
                        className="govuk-link"
                        onClick={e => { e.preventDefault(); handleDeleteAsset(idx); }}
                      >
                        Delete
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 className="govuk-heading-m">Add a new asset</h2>
            <div className="govuk-form-group" id="linetype-group">
              <label className="govuk-label govuk-label--s" htmlFor="linetype">Line type</label>
              {errors.lineType && (
                <p id="linetype-error" className="govuk-error-message">{errors.lineType}</p>
              )}
              <select className="govuk-select" id="linetype" name="lineType" value={lineType} onChange={e => setLineType(e.target.value)}>
                <option value="select">Select an option</option>
                {lineTypeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="application-type">Line voltage</label>
              {errors.voltage && (
                <p className="govuk-error-message">{errors.voltage}</p>
              )}
              <select className="govuk-select" id="application-type" name="ApplicationType" value={voltage} onChange={e => setVoltage(e.target.value)}>
                <option value="select">Select an option</option>
                {voltageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="govuk-form-group" id="description-group">
              <label className="govuk-label govuk-label--s" htmlFor="description">Description</label>
              {errors.description && (
                <p id="description-error" className="govuk-error-message">{errors.description}</p>
              )}
              <input className="govuk-input" id="description" name="description" type="text" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <a href="#" className="govuk-button govuk-button--secondary" onClick={handleAddAsset} style={{ marginBottom: "1rem" }}>
              Add asset
            </a>
            <div className="govuk-!-static-margin-top-6">
              <a href="application-overview.html" className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2">
                Save for later
              </a>
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={() => navigate(`/tlp/task-list?id=${applicationId}`)}
              >
                Save and continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Asset;
