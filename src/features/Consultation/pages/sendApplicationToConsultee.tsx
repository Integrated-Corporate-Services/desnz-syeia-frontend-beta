import React, { useEffect, useState } from "react";
import { S37_BASE_URL } from '../../../constants/s37';
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { getConsultationPack } from "../../../services/consultationPackService";
import { sendNotificationEmail } from '../../../services/notifyService';
import SummaryCard from '../../../components/SummaryCard';
import Accordion from '../../../components/Accordion';
import { useAuthUser } from "../../../hooks/useAuthUser";

const SendApplicationToConsultee: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const consultationId = params.consultationId || searchParams.get("consultationId") || "";
  const applicationId = params.applicationId || searchParams.get("applicationId") || "";

  const [consultationName, setConsultationName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [packSections, setPackSections] = useState<any[]>([]);
  const [packDocuments, setPackDocuments] = useState<any[]>([]);
  const [uploadedFiles, setPackUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const { user } = useAuthUser();
  const userId = user?.email || "";
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getConsultationPack(consultationId, applicationId);
        setConsultationName(data?.consultation?.org_name || "Consultation name");
        setOrgEmail(data?.consultation?.consultee_email_address || "");
        setPackSections((data?.packSections || []).filter((s: any) => s.include));
        setPackDocuments((data?.packDocuments || []).filter((d: any) => d.include));
        setPackUploadedFiles(data?.uploadedFiles || []);
        setEmailMessage(data?.consultation?.consultee_email_message || "");
      } catch (err: any) {
        setError(err.message || "Failed to load consultation details");
      } finally {
        setLoading(false);
      }
    }
    if (consultationId && applicationId) fetchData();
  }, [consultationId, applicationId]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    setSendSuccess(false);
    try {
         await sendNotificationEmail({
        to: orgEmail,
        subject: 'Consultation request for overhead lines (Electricity Act 1989)',
        message: emailMessage,
        consultationId,
        applicationId,
        sections: packSections,
        documents: packDocuments,
        uploadedFiles,
      });
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-request-sent`);
    } catch (err: any) {
      // Check for 400 error and specific message in err.error property
      const errorMsg = err?.error || err?.message;
      if (errorMsg === 'Request failed with status code 500') {
        setSendError('Consultee email address is invalid');
      } else {
        setSendError(errorMsg || 'Failed to send email');
      }
    } finally {
      setSending(false);
    }
  };

  const handleSaveForLater = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="govuk-error-message">{error}</div>;

  // Prepare summary card sections
  const summarySections = [];
  if (packSections.length > 0) {
    summarySections.push({
      title: 'Details',
      items: packSections.map((section: any) => ({ label: section.sectionKey, value: '' })),
      changeUrl: `${S37_BASE_URL}/${applicationId}/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`,
    });
  }
  if (packDocuments.length > 0) {
    summarySections.push({
      title: 'Documents',
      items: packDocuments.map((doc: any) => ({
        label: doc.documentCategory || doc.document_category,
        value: doc.documentTitle || doc.document_title
      })),
      changeUrl: `${S37_BASE_URL}/${applicationId}/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`,
    });
  }
  if (uploadedFiles.length > 0) {
    summarySections.push({
      title: 'Additional supporting documents',
      items: uploadedFiles.map((file: any) => ({ label: file.filename, value: '' })),
      changeUrl: `/consultation/consultee-application-details?consultationId=${consultationId}&applicationId=${applicationId}`,
    });
  }

  const consulteeid = searchParams.get("consulteeid") || "";
  const orgname = searchParams.get("orgname") || "";
  const queryParams = `?consulteeid=${encodeURIComponent(consulteeid)}&orgname=${encodeURIComponent(orgname)}`;
  const emailDetailsSection = {
    title: 'Email details',
    items: [
      { label: 'Applicant email address', value: userId },
      { label: 'Consultee email address', value: orgEmail },
      { label: 'Subject', value: 'Consultation request for overhead lines (Electricity Act 1989)' },
      { label: 'Message', value: emailMessage },
    ],
    changeUrl: `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/email-consultee${queryParams}`,
  };

  return (
    <div className="govuk-width-container">
     <div className="govuk-grid-row">
             <div className="govuk-grid-column-two-thirds">
               <nav className="govuk-breadcrumbs" aria-label="Breadcrumbs">
                 <ol className="govuk-breadcrumbs__list">
                   <li className="govuk-breadcrumbs__list-item">
                     <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</Link>
                   </li>
                   <li className="govuk-breadcrumbs__list-item">
                     <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Consultations</Link>
                   </li>
                   <li className="govuk-breadcrumbs__list-item">Summary of consultation request</li>
                 </ol>
               </nav> 
    
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-xl">Summary of consultation request</h1>
        {/* Build accordation sections array without nulls */}
        {(() => {
          const accordionSections = [];
          if (summarySections.length > 0) {
              accordionSections.push({
                heading: 'Application details',
                id: 'application-details',
                children: <>
                  <SummaryCard sections={summarySections} />
                </>,
              });
          }
          accordionSections.push({
            heading: 'Email to consultee',
            id: 'email-details',
              children: <SummaryCard sections={[emailDetailsSection]} />,
          });
          return <Accordion sections={accordionSections} />;
        })()}
        <form className="govuk-!-margin-bottom-8" onSubmit={handleSendRequest}>
          {sendError && <div className="govuk-error-message">{sendError}</div>}
          {sendSuccess && <div className="govuk-notification-banner govuk-notification-banner--success"><div className="govuk-notification-banner__content">Email sent successfully!</div></div>}
          <div className="govuk-checkboxes govuk-!-margin-bottom-6">
            <div className="govuk-checkboxes__item">
              <input className="govuk-checkboxes__input" id="confirm-send" type="checkbox" required onChange={e => setIsConfirmed(e.target.checked)} />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-send">
                Confirm that you want to send this request.
              </label>
            </div>
          </div>
          <div className="govuk-button-group govuk-!-margin-bottom-6">
            <button type="button" className="govuk-button govuk-button--secondary" onClick={handleSaveForLater}>Save for later</button>
            <button type="submit" className="govuk-button" style={{ backgroundColor: '#00703c' }} disabled={sending || !isConfirmed}>
              {sending ? 'Sending...' : 'Send request'}
            </button>
          </div>
        </form>
      </main>
      </div>
      </div>
    </div>
  );
};

export default SendApplicationToConsultee;
