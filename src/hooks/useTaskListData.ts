import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApplication } from './useApplication';
import { useProgress } from './useProgress';
import { getInitialSections, getSectionsWithProgress, updateSectionStatus } from '../utils/taskListUtils';
import { getSensitiveAreaCheckStatus } from '../services/sensitiveAreaService';
import { S37_BASE_URL } from '../constants/s37';
import { createLogger } from '../utils/logger';

const logger = createLogger('useTaskListData');

export function useTaskListData() {
    const {
        application,
        fetchApplication,
        submitApplication: submitApp,
        accessDenied: applicationAccessDenied,
    } = useApplication();
    const { applicationId } = useParams();
    const {
        progress,
        loading: progressLoading,
        error: progressError,
        fetchProgress,
        accessDenied: progressAccessDenied,
    } = useProgress();
    const accessDenied = applicationAccessDenied || progressAccessDenied;
    const [assetInformationStatus, setAssetInformationStatus] = useState<string>('Incomplete');
    const [sections, setSections] = useState(getInitialSections(applicationId || application?.application_id, assetInformationStatus));
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [sensitiveAreaStatus, setSensitiveAreaStatus] = useState<{
        inProgress: boolean;
        completed: number;
        total: number;
        passed?: number;
        cleared?: number;
        failed?: number;
        runStatus?: 'in_progress' | 'completed' | 'partial' | 'failed';
    } | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [showBanner, setShowBanner] = useState(false);
    const [deletedRouteName, setDeletedRouteName] = useState<string | null>(null);
    const [showSensitiveAreaPopup, setShowSensitiveAreaPopup] = useState(false);
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const justStartedCheckRef = useRef<boolean>(false);

    // Fetch application if not present but available in route params
    useEffect(() => {
        if (applicationId) {
            if (!application || application.application_id !== applicationId) {
                fetchApplication(applicationId);
            }
        }
    }, [application, applicationId, fetchApplication]);

    // Fetch progress when applicationId is available
    useEffect(() => {
        const effectiveId = applicationId || application?.application_id;
        if (typeof effectiveId === 'string' && effectiveId) {
            fetchProgress(effectiveId);
        }
    }, [application?.application_id, applicationId, fetchProgress]);

    // Get asset information status from progress
    useEffect(() => {
        if (progress && progress.length > 0) {
            const assetStatus = progress.find((p: { subsection_name: string; status: string }) => p.subsection_name === 'Assets')?.status || 'Incomplete';
            setAssetInformationStatus(assetStatus);
        }
    }, [progress]);

    // Update sections when progress or assetInformationStatus changes
    useEffect(() => {
        const effectiveId = applicationId || application?.application_id;
        setSections(getSectionsWithProgress(typeof effectiveId === 'string' ? effectiveId : undefined, progress, assetInformationStatus, sensitiveAreaStatus?.inProgress));
    }, [progress, assetInformationStatus, application?.application_id, applicationId, sensitiveAreaStatus?.inProgress]);

    // Fetch sensitive area check status
    useEffect(() => {
        const effectiveId = applicationId || application?.application_id;
        if (!effectiveId) return;

        const fetchStatus = async () => {
            try {
                const status = await getSensitiveAreaCheckStatus(effectiveId);
                setSensitiveAreaStatus(status);

                if (status?.inProgress || justStartedCheckRef.current) {
                    justStartedCheckRef.current = false; // consume the flag
                    if (!pollingIntervalRef.current) {
                        pollingIntervalRef.current = setInterval(async () => {
                            try {
                                const updatedStatus = await getSensitiveAreaCheckStatus(effectiveId);
                                setSensitiveAreaStatus(updatedStatus);

                                // Stop polling when updatedStatus is null or not in progress
                                if (!updatedStatus?.inProgress && pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                    setShowSensitiveAreaPopup(false);
                                    fetchProgress(effectiveId);
                                }
                            } catch (err) {
                                logger.error('Failed to poll sensitive area status', err);
                            }
                        }, 1000);
                    }
                }
            } catch (err) {
                logger.error('Failed to fetch sensitive area status', err);
            }
        };

        fetchStatus();

        // Cleanup polling on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [applicationId, application?.application_id, fetchProgress]);

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
            justStartedCheckRef.current = true;
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
            await submitApp(effectiveApplicationId);
            navigate(`${S37_BASE_URL}/${effectiveApplicationId}/application-submitted`);
        } catch (err) {
            setSubmitError('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Status class helper
    const statusClass = (status: string) => {
        if (status === 'Completed') return 'govuk-tag govuk-tag--green';
        if (status === 'Not completed' || status === 'In progress') return 'govuk-tag govuk-tag--blue';
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
        accessDenied,
    };
}