import { useState, useEffect } from 'react';
import accessRequestAdminService from '../services/accessRequestAdminService';
import { createLogger } from '../utils/logger';
import type { AccessRequest } from '../types/accessRequest';

const logger = createLogger('useReviewRequest');

interface ValidationError {
  fieldId: string;
  message: string;
}

export const useReviewRequest = (requestId: string, organisationId?: string) => {
  const [requestData, setRequestData] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let active = true;
    setRequestData(null);
    setErrors([]);
    setShowRejectReason(false);
    setRejectReason('');

    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await accessRequestAdminService.getRequestById(requestId, organisationId);
        if (active && response.success && response.data) {
          setRequestData(response.data);
        }
      } catch (err) {
        logger.error('Error fetching request:', err);
        if (active) {
          setErrors([{
            fieldId: 'general',
            message: err instanceof Error ? err.message : 'Failed to fetch request details'
          }]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (requestId) {
      void fetchRequestDetails();
    } else {
      setLoading(false);
    }
    // Ignore a previous organisation's response after navigating to a different row.
    return () => { active = false; };
  }, [requestId, organisationId]);

  const validateRejectReason = (): boolean => {
    if (!rejectReason.trim()) {
      setErrors([{
        fieldId: 'reject-reason',
        message: 'Enter a reason for rejection'
      }]);
      return false;
    }
    if (rejectReason.trim().length < 10) {
      setErrors([{
        fieldId: 'reject-reason',
        message: 'Reason must be at least 10 characters'
      }]);
      return false;
    }
    return true;
  };

  const approveRequest = async (onSuccess?: () => void) => {
    try {
      setProcessing(true);
      const targetOrganisationId = organisationId || requestData?.organisation_id;
      if (!targetOrganisationId) throw new Error('Select an organisation to review this access request');
      await accessRequestAdminService.approveRequest(requestId, targetOrganisationId);
      
      // Call the success callback (which navigates with user details)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logger.error('Failed to approve request:', error);
      setErrors([{
        fieldId: 'general',
        message: error instanceof Error ? error.message : 'Failed to approve request'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const rejectRequest = async (onSuccess?: () => void) => {
    if (!validateRejectReason()) {
      return;
    }

    try {
      setProcessing(true);
      const targetOrganisationId = organisationId || requestData?.organisation_id;
      if (!targetOrganisationId) throw new Error('Select an organisation to review this access request');
      await accessRequestAdminService.rejectRequest(requestId, rejectReason, targetOrganisationId);
      
      // Call the success callback (which navigates with user details)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logger.error('Failed to reject request:', error);
      setErrors([{
        fieldId: 'general',
        message: error instanceof Error ? error.message : 'Failed to reject request'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const cancelRejection = () => {
    setShowRejectReason(false);
    setRejectReason('');
    setErrors([]);
  };

  const updateRejectReason = (value: string) => {
    setRejectReason(value);
    if (errors.some(err => err.fieldId === 'reject-reason')) {
      setErrors([]);
    }
  };

  const getFieldError = (fieldId: string): string => {
    const error = errors.find(err => err.fieldId === fieldId);
    return error ? error.message : '';
  };

  return {
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
  };
};