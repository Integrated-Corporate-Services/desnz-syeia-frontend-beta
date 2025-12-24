import { useState, useEffect } from 'react';
import accessRequestAdminService from '../services/accessRequestAdminService';
import { createLogger } from '../utils/logger';

const logger = createLogger('useReviewRequest');

interface RequestData {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
  status: string;
}

interface ValidationError {
  fieldId: string;
  message: string;
}

export const useReviewRequest = (requestId: string) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    logger.debug('Hook mounted, requestId:', requestId);
    if (requestId) {
      fetchRequestDetails();
    } else {
      logger.warn('No requestId provided');
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      logger.debug('Fetching request details for:', requestId);
      setLoading(true);
      const response = await accessRequestAdminService.getRequestById(requestId);
      if (response.success && response.data) {
        setRequestData(response.data);
        logger.debug('Request data loaded successfully');
      } else {
        logger.warn('Response not successful or no data');
      }
    } catch (err) {
      logger.error('Error fetching request:', err);
      setErrors([{
        fieldId: 'general',
        message: err instanceof Error ? err.message : 'Failed to fetch request details'
      }]);
    } finally {
      setLoading(false);
    }
  };

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

  const approveRequest = async (onSuccess: () => void) => {
    try {
      setProcessing(true);
      setErrors([]);
      const response = await accessRequestAdminService.approveRequest(requestId);
      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      setErrors([{
        fieldId: 'general',
        message: err instanceof Error ? err.message : 'Failed to approve request'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const rejectRequest = async (onSuccess: () => void) => {
    if (!validateRejectReason()) {
      return;
    }

    try {
      setProcessing(true);
      setErrors([]);
      const response = await accessRequestAdminService.rejectRequest(requestId, rejectReason);
      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      setErrors([{
        fieldId: 'general',
        message: err instanceof Error ? err.message : 'Failed to reject request'
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
