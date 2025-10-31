import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getConsultationPack } from "../../../services/consultationPackService";

const SendApplicationToConsultee: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const consultationId = searchParams.get("consultationId") || "";
  const applicationId = searchParams.get("applicationId") || "";

  const [consultationName, setConsultationName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [packSections, setPackSections] = useState<any[]>([]);
  const [packDocuments, setPackDocuments] = useState<any[]>([]);
  const [uploadedFiles, setPackUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getConsultationPack(consultationId, applicationId);
        setConsultationName(data?.consultation?.org_name || "Consultation name");
        setOrgEmail(data?.consultation?.default_email || "");
        setPackSections((data?.packSections || []).filter((s: any) => s.include));
        setPackDocuments((data?.packDocuments || []).filter((d: any) => d.include));
        setPackUploadedFiles(data?.uploadedFiles || []);
      } catch (err: any) {
        setError(err.message || "Failed to load consultation details");
      } finally {
        setLoading(false);
      }
    }
    if (consultationId && applicationId) fetchData();
  }, [consultationId, applicationId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="govuk-error-message">{error}</div>;

  return (
    <div className="govuk-width-container">
      {/* Breadcrumbs */}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`/task-list?id=${applicationId}`}
              className="govuk-breadcrumbs__link"
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Send selected application details
          </li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <h2 className="govuk-caption-l">{consultationName}</h2>
            <h1 className="govuk-heading-xl">Send selected application details</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Review the details and documents you're about to send.
            </p>
            <form className="govuk-!-margin-bottom-8">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="org-email">
                  Organisation email address
                </label>
                <span className="govuk-hint">Your consultation details will be sent to this address</span>
                <input
                  className="govuk-input"
                  id="org-email"
                  name="org-email"
                  type="email"
                  value={orgEmail}
                  readOnly
                  style={{ background: '#f3f2f1' }}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="subject">
                  Subject
                </label>
                <input className="govuk-input" id="subject" name="subject" type="text" />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="message">
                  Message
                </label>
                <textarea className="govuk-textarea" id="message" name="message" rows={5}></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <h2 className="govuk-heading-l govuk-!-margin-bottom-2">Attachments</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">Summary of your selected details and documents.</p>

            {/* Details Table - GOV.UK summary card style */}
            {packSections.length > 0 && (
              <div className="govuk-summary-card govuk-!-margin-bottom-6">
                <div className="govuk-summary-card__title-wrapper">
                  <h3 className="govuk-summary-card__title">Details</h3>
                  <div className="govuk-summary-card__actions">
                    <Link to={`/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`} className="govuk-link">Add or remove details</Link>
                  </div>
                </div>
                <div className="govuk-summary-card__content">
                  <table className="govuk-table govuk-!-margin-bottom-0">
                    <tbody className="govuk-table__body">
                      {packSections.filter((s: any) => s.include).map((section, idx) => (
                        <tr className="govuk-table__row" key={idx}>
                          <td className="govuk-table__cell">{section.sectionKey}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents Table - GOV.UK summary card style */}
            {packDocuments.length > 0 && (
              <div className="govuk-summary-card govuk-!-margin-bottom-6">
                <div className="govuk-summary-card__title-wrapper">
                  <h3 className="govuk-summary-card__title">Documents</h3>
                  <div className="govuk-summary-card__actions">
                    <Link to={`/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`} className="govuk-link">Add or remove documents</Link>
                  </div>
                </div>
                <div className="govuk-summary-card__content">
                  <table className="govuk-table govuk-!-margin-bottom-0">
                    <tbody className="govuk-table__body">
                      {packDocuments.filter((d: any) => d.include).map((doc, idx) => (
                        <tr className="govuk-table__row" key={idx}>
                          <td className="govuk-table__cell govuk-!-font-weight-bold">{doc.documentCategory || doc.document_category}</td>
                          <td className="govuk-table__cell">{doc.documentTitle || doc.document_title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Supporting Documents Table - GOV.UK summary card style */}
            {uploadedFiles.length > 0 && (
              <div className="govuk-summary-card govuk-!-margin-bottom-8">
                <div className="govuk-summary-card__title-wrapper">
                  <h3 className="govuk-summary-card__title">Additional supporting documents</h3>
                  <div className="govuk-summary-card__actions">
                    <Link to={`/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`} className="govuk-link">Add or remove documents</Link>
                  </div>
                </div>
                <div className="govuk-summary-card__content">
                  <table className="govuk-table govuk-!-margin-bottom-0">
                    <tbody className="govuk-table__body">
                      {uploadedFiles.map((file, idx) => (
                        <tr className="govuk-table__row" key={idx}>
                          <td className="govuk-table__cell">{ file.filename}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button type="button" className="govuk-button govuk-button--secondary">Save for later</button>
          <button type="submit" className="govuk-button" style={{ backgroundColor: '#00703c' }}>Send request</button>
        </div>
      </main>
    </div>
  );
};

export default SendApplicationToConsultee;
