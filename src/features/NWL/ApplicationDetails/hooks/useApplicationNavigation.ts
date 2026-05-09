import { useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

/**
 * Hook for handling navigation in Application Details flow
 * Provides centralized navigation methods for all ApplicationDetails pages
 */
export const useApplicationNavigation = (appId: string) => {
  const navigate = useNavigate();

  // Generic navigation
  const navigateToTaskList = () => {
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  const navigateToPage = (pagePath: string, state?: unknown) => {
    navigate(`${NWL_BASE_URL}/${appId}/${pagePath}`, state ? { state } : undefined);
  };

  const goBack = () => {
    navigate(-1);
  };

  // New Lines Flow
  const navigateToWayleaveOffer = () => {
    navigate(`${NWL_BASE_URL}/${appId}/wayleave-offer`);
  };

  // Existing Lines Flow - Entry Points
  const navigateToGroundsForApplication = () => {
    navigate(`${NWL_BASE_URL}/${appId}/grounds-for-application`);
  };

  const navigateToWayleaveType = (groundsForApplication?: string) => {
    navigate(`${NWL_BASE_URL}/${appId}/wayleave-type`, {
      state: groundsForApplication ? { grounds_for_application: groundsForApplication } : undefined,
    });
  };

  // Wayleave Expired Path
  const navigateToWayleaveExpiryDate = () => {
    navigate(`${NWL_BASE_URL}/${appId}/wayleave-expiry-date`);
  };

  // Wayleave Terminated Path - Upload Pages
  const navigateToUploadWrittenWayleave = () => {
    navigate(`${NWL_BASE_URL}/${appId}/upload-written-wayleave`);
  };

  const navigateToUploadImpliedWayleave = () => {
    navigate(`${NWL_BASE_URL}/${appId}/upload-implied-wayleave`);
  };

  const navigateToNoticeToTerminate = () => {
    navigate(`${NWL_BASE_URL}/${appId}/notice-to-terminate`);
  };

  const navigateToTerminationPeriodExpired = () => {
    navigate(`${NWL_BASE_URL}/${appId}/termination-period-expired`);
  };

  const navigateToCannotContinueApplication = () => {
    navigate(`${NWL_BASE_URL}/${appId}/cannot-continue-application`);
  };

  // Common Path - Notice to Remove
  const navigateToNoticeToRemove = () => {
    navigate(`${NWL_BASE_URL}/${appId}/notice-to-remove`);
  };

  const navigateToNoticeToRemoveClear = () => {
    navigate(`${NWL_BASE_URL}/${appId}/notice-to-remove-clear`);
  };

  const navigateToNoticeToRemoveUnclear = () => {
    navigate(`${NWL_BASE_URL}/${appId}/notice-to-remove-unclear`);
  };

  // Application Timing
  const navigateToApplicationWithinThreeMonths = () => {
    navigate(`${NWL_BASE_URL}/${appId}/application-within-three-months`);
  };

  const navigateToApplicationOutsideTimeframe = () => {
    navigate(`${NWL_BASE_URL}/${appId}/application-outside-timeframe`);
  };

  // Standard Term
  const navigateToStandardTerm = () => {
    navigate(`${NWL_BASE_URL}/${appId}/standard-term`);
  };

  return {
    // Generic
    navigateToTaskList,
    navigateToPage,
    goBack,
    
    // New Lines
    navigateToWayleaveOffer,
    
    // Existing Lines - Entry
    navigateToGroundsForApplication,
    navigateToWayleaveType,
    
    // Wayleave Expired Path
    navigateToWayleaveExpiryDate,
    
    // Wayleave Terminated Path
    navigateToUploadWrittenWayleave,
    navigateToUploadImpliedWayleave,
    navigateToNoticeToTerminate,
    navigateToTerminationPeriodExpired,
    navigateToCannotContinueApplication,
    
    // Common - Notice to Remove
    navigateToNoticeToRemove,
    navigateToNoticeToRemoveClear,
    navigateToNoticeToRemoveUnclear,
    
    // Application Timing
    navigateToApplicationWithinThreeMonths,
    navigateToApplicationOutsideTimeframe,
    
    // Standard Term
    navigateToStandardTerm,
  };
};
