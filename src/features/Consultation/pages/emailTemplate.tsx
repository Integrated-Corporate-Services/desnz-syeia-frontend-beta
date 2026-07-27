import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { S37_BASE_URL } from "../../../constants/s37";
import { getConsultationDetailsById, saveConsultationMessage } from "../../../services/consultationService";
import SkipLink from '../../../components/SkipLink';

const EmailTemplate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { applicationId, consultationId } = useParams();
  const orgname = searchParams.get("orgname") || "";
  const { user } = useAuthUser();
  const userId = user?.email || "";
  const navigate = useNavigate();

  const [consultationDetails, setConsultationDetails] = useState<any>(null);
  const [message, setMessage] = useState(
    "An application has been sent to the Secretary of State under s37 of the Electricity Act 1989 seeking consent to install or keep installed an electric line above ground.\n\n" +
    "The views of your authority are required to inform a decision as to whether to grant this consent. Application details, including associated documents, can be viewed in this email."
  );
  const [consulteeEmailAddress, setConsulteeEmailAddress] = useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchConsultationDetails() {
      if (!consultationId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getConsultationDetailsById(consultationId);
        setConsultationDetails(data);
        if (data.consulteeEmailMessage) setMessage(data.consulteeEmailMessage);
        if (data.consulteeEmailAddress) setConsulteeEmailAddress(data.consulteeEmailAddress);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConsultationDetails();
  }, [consultationId]);

  // Expand textarea to fit content on initial load and when message changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // GOV.UK email validation regex
  const govUkEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const handleSaveMessage = async (e: React.FormEvent, action: "save" | "continue") => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Email validation for Save and continue
    if (action === "continue") {
      if (!consulteeEmailAddress) {
        setError("Consultee email address is required.");
        setLoading(false);
        return;
      }
      if (!govUkEmailRegex.test(consulteeEmailAddress)) {
        setError("Enter a valid email address in the correct format, like name@example.com");
        setLoading(false);
        return;
      }
    }
    try {
      await saveConsultationMessage(consultationId!, message, consulteeEmailAddress);
      if (action === "save") {
        navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
      } else if (action === "continue") {
        navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/send-application-to-consultee`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
              <li className="govuk-breadcrumbs__list-item">
                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</Link>
              </li>
              <li className="govuk-breadcrumbs__list-item">
                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Manage consultation</Link>
              </li>
              <li className="govuk-breadcrumbs__list-item" aria-current="page">Create email to consultee</li>
            </ol>
          </nav>
          <h1 className="govuk-hint govuk-!-margin-top-6">{orgname}</h1>
          <h1 className="govuk-heading-l">Create email to consultee</h1>
          <p className="govuk-body">Review the details you're about to send.</p>
          {error && <div className="govuk-error-summary govuk-!-width-two-thirds">{error}</div>}
          <form>
            <div className="govuk-form-group">
              <h1 className="govuk-heading-s" >Applicant email address</h1>
              <input className="govuk-input" id="applicant-email" name="applicant-email" type="email" defaultValue={userId} />
            </div>
            <div className="govuk-form-group">
              <h1 className="govuk-heading-s">Consultee email address</h1>
              <span className="govuk-hint">For example: john.smith@example.com</span>
              <input
                className="govuk-input"
                id="consultee-email"
                name="consultee-email"
                type="email"
                value={consulteeEmailAddress}
                onChange={e => setConsulteeEmailAddress(e.target.value)}
              />
            </div>
            <div className="govuk-form-group">
              <h1 className="govuk-heading-s" >Subject</h1>
              <input className="govuk-input" id="subject" name="subject" readOnly type="text" defaultValue="Consultation request for overhead lines (Electricity Act 1989)" />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="message">Message</label>
              <textarea
                ref={textareaRef}
                className="govuk-textarea"
                id="message"
                name="message"
                rows={6}
                style={{ width: '100%', resize: 'vertical', minHeight: '120px', overflow: 'hidden' }}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onInput={e => {
                  const textarea = e.target as HTMLTextAreaElement;
                  textarea.style.height = 'auto';
                  textarea.style.height = textarea.scrollHeight + 'px';
                }}
                disabled={loading}
              />
            </div>
            <div className="govuk-button-group govuk-!-margin-top-6">
              <button type="button" className="govuk-button govuk-button--secondary" onClick={e => handleSaveMessage(e, "save")}>Save for later</button>
              <button
                type="button"
                className="govuk-button"
                onClick={e => handleSaveMessage(e, "continue")}
                disabled={loading}
              >
                Save and continue
              </button>
            </div>
          </form>
        </div>
      </div>
      </main>
    </div>
    </>
  );
};

export default EmailTemplate;
