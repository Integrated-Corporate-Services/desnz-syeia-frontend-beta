import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useReviewRequest, useReviewRequestNavigation } from '../../../hooks';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import {
  ApplicantDetails,
  RejectionReasonForm,
  ActionButtons,
} from '../../../components/shared/ReviewRequestComponents';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { REVIEW_REQUEST_PAGE_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

const ReviewRequestPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchParams] = useSearchParams();
  const organisationId = searchParams.get('organisationId') || undefined;
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
  } = useReviewRequest(requestId || '', organisationId);

  const {
    navigateToPendingRequests,
    navigateToAccessApproved,
    navigateToAccessDenied
  } = useReviewRequestNavigation();

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToPendingRequests();
  };

  useBreadcrumb(
    <a href="#" className="govuk-back-link" onClick={handleBackClick}>
      {ADMIN_COMMON_CONSTANTS.BACK}
    </a>
  );

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
      }, rejectReason.trim()));
    }
  };

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
          <div className="govuk-body">
            <p>{REVIEW_REQUEST_PAGE_CONSTANTS.LOADING}</p>
          </div>
              </div>
      </>
    );
  }

  if (!requestData) {
    return (
      <>
                <div className="govuk-width-container">
            {errors.length > 0 && <ErrorSummary errors={errors} />}
            <h1 className="govuk-heading-l">{REVIEW_REQUEST_PAGE_CONSTANTS.NOT_FOUND_TITLE}</h1>
            <p className="govuk-body">{REVIEW_REQUEST_PAGE_CONSTANTS.NOT_FOUND_MESSAGE}</p>
                  </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={REVIEW_REQUEST_PAGE_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
        {errors.length > 0 && (
          <ErrorSummary errors={errors} />
        )}

        <h1 className="govuk-heading-l">{REVIEW_REQUEST_PAGE_CONSTANTS.TITLE}</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              {REVIEW_REQUEST_PAGE_CONSTANTS.INTRO}
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
