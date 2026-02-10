import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getSensitiveAreas } from '../../../services/sensitiveAreaService';

type AreasResponse = any;

const ReviewResultsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AreasResponse | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    getSensitiveAreas(applicationId)
      .then(d => setData(d))
      .catch(err => setError(err?.message || 'Failed to load automated sensitive-area results'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const extractFailed = (resp: AreasResponse) => {
    if (!resp) return [];
    return resp.failed || resp.failed_layers || resp.checks?.failed || [];
  };

  const handleContinue = () => {
    const failed = extractFailed(data);
    if (Array.isArray(failed) && failed.length > 0) {
      navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/failed`);
    } else {
      navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/add-question`);
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Sensitive area review</li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-xl">Automated sensitive area results</h1>
        {loading && <div>Loading automated check results…</div>}
        {error && <div className="govuk-error-message">{error}</div>}

        {!loading && !error && data && (
          <>
            <div className="govuk-inset-text govuk-!-margin-bottom-4">
              This page summarises the automatic checks carried out against known sensitive areas. You can review any failed or borderline results manually.
            </div>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Total layers checked</dt>
                <dd className="govuk-summary-list__value">{data.totalChecked ?? data.total_checked ?? (data.totalLayers ? data.totalLayers.length : '—')}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Automatically flagged</dt>
                <dd className="govuk-summary-list__value">{(extractFailed(data) || []).length}</dd>
              </div>
            </dl>

            <div className="govuk-!-margin-top-4">
              <button className="govuk-button" onClick={handleContinue}>Save and continue</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ReviewResultsPage;
