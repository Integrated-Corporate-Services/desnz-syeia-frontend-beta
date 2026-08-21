import React from 'react';
import { useParams } from 'react-router-dom';
import { useReviewRequest, useReviewRequestNavigation } from '../../../hooks';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import {
  ApplicantDetails,
  RejectionReasonForm,
  ActionButtons,
} from '../../../components/shared/ReviewRequestComponents';
import PageTitle from '../../../components/PageTitle';

const ReviewRequestPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  // Debug logging handled by logger utility in useReviewRequest hook
  const {
    requestData,
    loading,
    processing,
    errors,
    showRejectReason,
    rejectReason,
    getFieldError,
    approveRequest,
    rejectRequest,
    cancelRejection,
    updateRejectReason,
    setShowRejectReason
  } = useReviewRequest(requestId || '');

  const {
    navigateToDashboard,
    navigateToAccessApproved,
    navigateToAccessDenied
  } = useReviewRequestNavigation();

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToDashboard();
  };

  const handleApprove = () => {
    if (requestData) {
      const fullName = `${requestData.first_name} ${requestData.last_name}`;
      const userEmail = requestData.email;
      
      approveRequest(() => navigateToAccessApproved({
        userName: fullName,
        userEmail: userEmail
      }));
    }
  };

  const handleReject = () => {
    if (requestData) {
      const fullName = `${requestData.first_name} ${requestData.last_name}`;
      const userEmail = requestData.email;
      
      rejectRequest(() => navigateToAccessDenied({
        userName: fullName,
        userEmail: userEmail
      }));
    }
  };

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
                  <a href="#" className="govuk-back-link" onClick={handleBackClick}>
            Back
          </a>
          <div className="govuk-body">
            <p>Loading request details...</p>
          </div>
              </div>
      </>
    );
  }

  if (!requestData) {
    return (
      <>
                <div className="govuk-width-container">
                      <a href="#" className="govuk-back-link" onClick={handleBackClick}>
              Back
            </a>
            <h1 className="govuk-heading-l">Request not found</h1>
            <p className="govuk-body">The requested access request could not be found.</p>
                  </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Review access request" />
            <div className="govuk-width-container">
                <a href="#" className="govuk-back-link" onClick={handleBackClick}>
          Back
        </a>

        {errors.length > 0 && (
          <ErrorSummary errors={errors} />
        )}

        <h1 className="govuk-heading-l">Review access request</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              Review the applicant's details before deciding whether to approve or reject this request.
            </p>

            <ApplicantDetails requestData={requestData} />

            {showRejectReason ? (
              <RejectionReasonForm
                rejectReason={rejectReason}
                onReasonChange={updateRejectReason}
                onSubmit={handleReject}
                onCancel={cancelRejection}
                processing={processing}
                error={getFieldError('reject-reason')}
              />
            ) : (
              <ActionButtons
                onApprove={handleApprove}
                onReject={() => setShowRejectReason(true)}
                processing={processing}
                showRejectReason={false}
                onCancel={() => { }}
              />
            )}
          </div>

          {/* <div className="govuk-grid-column-one-third">
            <RelatedContentSidebar />
          </div> */}
        </div>
          </div>
    </>
  );
};

export default ReviewRequestPage;
