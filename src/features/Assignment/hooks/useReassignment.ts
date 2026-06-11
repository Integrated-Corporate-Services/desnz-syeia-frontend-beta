/**
 * useReassignment Hook
 * Manages state for application reassignment flow
 * Created: 2026-06-09
 * ✅ PRODUCTION-READY with error handling and loading states
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assignmentApiService, OrgUser, AssignedEditor } from '../../../services/assignmentApiService';

interface UseReassignmentProps {
  applicationId: string;
  appVersion?: number;
}

interface ReassignmentError {
  type: string;
  message: string;
  action?: 'RELOAD' | 'RETRY';
  retryAfter?: number;
}

export const useReassignment = ({ applicationId, appVersion }: UseReassignmentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ReassignmentError | null>(null);
  
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [currentEditor, setCurrentEditor] = useState<AssignedEditor | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');

  // Fetch org users and current editor
  useEffect(() => {
    // Don't fetch if applicationId is missing
    if (!applicationId || applicationId === 'undefined') {
      console.warn('[useReassignment] Skipping fetch - invalid applicationId:', applicationId);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [usersResponse, editorResponse] = await Promise.all([
          assignmentApiService.getOrgUsers(),
          assignmentApiService.getAssignedEditor(applicationId),
        ]);

        setUsers(usersResponse.users);
        setCurrentEditor(editorResponse.assignedEditor);
      } catch (err: any) {
        if (err.response) {
          setError({
            type: 'SERVER_ERROR',
            message: err.response.data?.message || 'Failed to load data',
          });
        } else if (err.request) {
          setError({
            type: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection.',
            action: 'RETRY',
          });
        } else {
          setError({
            type: 'UNKNOWN',
            message: 'An unexpected error occurred',
            action: 'RETRY',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [applicationId]);

  // Submit reassignment
  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError({
        type: 'VALIDATION_ERROR',
        message: 'Please select a user',
      });
      return false;
    }

    // Check if reason is required (replacing existing editor)
    if (currentEditor && !reason.trim()) {
      setError({
        type: 'VALIDATION_ERROR',
        message: 'Please provide a reason for reassignment',
      });
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await assignmentApiService.reassignEditor(applicationId, {
        newEditorId: selectedUserId,
        reason: reason.trim() || undefined,
        version: appVersion,
      });

      // Extract base path from current location (e.g., /s-37 from /s-37/abc/reassign)
      // This works for S37, NWL, and TLP applications
      const basePath = location.pathname.split('/').slice(0, 2).join('/'); // Gets '/s-37', '/nwl', or '/tlp'
      navigate(`${basePath}/${applicationId}/reassigned`);
      return true;
    } catch (err: any) {
      if (err.status === 409) {
        // Version conflict
        setError({
          type: 'VERSION_CONFLICT',
          message: 'This application was modified by another user. Please refresh and try again.',
          action: 'RELOAD',
        });
      } else if (err.status === 429) {
        // Rate limit
        setError({
          type: 'RATE_LIMIT',
          message: 'Too many requests. Please wait before trying again.',
          retryAfter: err.data?.retryAfter,
        });
      } else if (err.code) {
        // Known error from backend
        setError({
          type: err.code,
          message: err.message || 'Failed to reassign application',
        });
      } else {
        // Unknown error
        setError({
          type: 'UNKNOWN',
          message: 'An unexpected error occurred',
          action: 'RETRY',
        });
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    error,
    users,
    currentEditor,
    selectedUserId,
    setSelectedUserId,
    reason,
    setReason,
    handleSubmit,
    setError,
  };
};

export default useReassignment;
