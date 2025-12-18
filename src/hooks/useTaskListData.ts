import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApplicationStore } from '../store/useApplicationStore';
import { useProgressStore } from '../store/useProgressStore';
import { getInitialSections, getSectionsWithProgress, updateSectionStatus } from '../utils/taskListUtils';

export function useTaskListData() {
  const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
  const application = useApplicationStore(state => state.application);
  const submitApplication = useApplicationStore(state => state.submitApplication);
  const { applicationId } = useParams();
  const { progress, loading: progressLoading, error: progressError, fetchProgress } = useProgressStore();
  const [sections, setSections] = useState(getInitialSections(application?.application_id || applicationId));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sensitiveAreaStatus, setSensitiveAreaStatus] = useState<{ inProgress: boolean; completed: number; total: number } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [deletedRouteName, setDeletedRouteName] = useState<string | null>(null);
  const [showSensitiveAreaPopup, setShowSensitiveAreaPopup] = useState(false);

  // Fetch application if not present in store but available in route params
  useEffect(() => {
    if (!application && applicationId) {
      fetchAndSetApplication(applicationId);
    }
  }, [application, applicationId, fetchAndSetApplication]);

  // Fetch progress when applicationId is available
  useEffect(() => {
    const effectiveId = application?.application_id || applicationId;
    if (typeof effectiveId === 'string' && effectiveId) {
      fetchProgress(effectiveId);
    }
  }, [application?.application_id, applicationId, fetchProgress]);

  // Update sections when progress or applicationId changes
  useEffect(() => {
    const effectiveId = application?.application_id || applicationId;
    setSections(getSectionsWithProgress(typeof effectiveId === 'string' ? effectiveId : undefined, progress));
  }, [progress, application?.application_id, applicationId]);

  // Handle location state for banners/popups
  useEffect(() => {
    if (location.state && (location.state as any).routeDeletedName) {
      setShowBanner(true);
      setDeletedRouteName((location.state as any).routeDeletedName);
      setTimeout(() => {
        navigate(location.pathname + location.search, { replace: true, state: undefined });
      }, 0);
    }
    if (location.state && (location.state as any).showSensitiveAreaPopup) {
      setShowSensitiveAreaPopup(true);
      setTimeout(() => {
        navigate(location.pathname + location.search, { replace: true, state: undefined });
      }, 0);
    }
  }, [location, navigate]);

  // Update status handler
  const handleStatusUpdate = (sectionIdx: number, itemIdx: number, newStatus: string) => {
    setSections(updateSectionStatus(sections, sectionIdx, itemIdx, newStatus));
  };

  // Submit handler
  const handleSubmit = async () => {
    const effectiveApplicationId = application?.application_id || applicationId;
    if (!effectiveApplicationId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitApplication(effectiveApplicationId);
      navigate(`/s37/${effectiveApplicationId}/application-submitted`);
    } catch (err) {
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status class helper
  const statusClass = (status: string) => {
    if (status === 'Completed') return 'govuk-tag govuk-tag--green';
    if (status === 'Incomplete') return 'govuk-tag govuk-tag--blue';
    if (status === 'Cannot start yet') return 'govuk-tag govuk-tag--grey';
    return '';
  };

  return {
    application,
    sections,
    submitting,
    submitError,
    handleSubmit,
    sensitiveAreaStatus,
    setSensitiveAreaStatus,
    showBanner,
    setShowBanner,
    deletedRouteName,
    setDeletedRouteName,
    showSensitiveAreaPopup,
    setShowSensitiveAreaPopup,
    handleStatusUpdate,
    statusClass,
    progressLoading,
    progressError,
  };
}
