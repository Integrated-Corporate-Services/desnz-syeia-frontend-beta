import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getSensitiveAreas } from '../../../services/sensitiveAreaService';

const ReviewManualPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    getSensitiveAreas(applicationId)
      .then(d => setFailed(d.failed || d.failed_layers || d.checks?.failed || []))
      .catch(err => setError(err?.message || 'Failed to load failed layers'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleContinue = () => navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/add-question`);

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl">Manual review — flagged areas</h1>
      {loading && <div>Loading flagged areas…</div>}
      {error && <div className="govuk-error-message">{error}</div>}

      {!loading && !error && (
        <>
          {failed.length === 0 ? (
            <div className="govuk-inset-text">No flagged areas were returned from the automated checks.</div>
          ) : (
            <div>
              <p className="govuk-body">The following areas were flagged and should be reviewed manually:</p>
              <ul className="govuk-list govuk-list--bullet">
                {failed.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <p className="govuk-body">Use the links below to inspect each area in MAGIC or DataMapWales before deciding.</p>
              <ul>
                <li><a href="#">Open in MAGIC (external)</a></li>
                <li><a href="#">Open in DataMapWales (external)</a></li>
              </ul>
            </div>
          )}

          <div className="govuk-!-margin-top-4">
            <button className="govuk-button" onClick={handleContinue}>Save and continue</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewManualPage;
