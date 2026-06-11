/**
 * Reassign Application Page
 * Multi-step flow for reassigning an application to a new editor
 * Created: 2026-06-09
 * ✅ PRODUCTION-READY with loading states and error handling
 */

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useReassignment } from '../hooks/useReassignment';
import UserRadioList from '../components/UserRadioList';

export const ReassignApplicationPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'select' | 'reason' | 'confirm'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  console.log('[ReassignApplicationPage] Params:', { 
    applicationId,
    url: window.location.pathname 
  });

  const {
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
  } = useReassignment({ applicationId: applicationId! });

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <LoadingSpinner message="Loading reassignment options..." />
        </main>
      </div>
    );
  }

  if (error && error.action === 'RELOAD') {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-error-summary" data-module="govuk-error-summary">
            <div role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
          <button
            className="govuk-button"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </main>
      </div>
    );
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const requiresReason = !!currentEditor;

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchQuery || 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleNext = () => {
    if (!selectedUserId) {
      setError({
        type: 'VALIDATION_ERROR',
        message: 'Please select a user',
      });
      return;
    }

    if (requiresReason) {
      setStep('reason');
    } else {
      setStep('confirm');
    }
  };

  const handleReasonNext = () => {
    if (!reason.trim()) {
      setError({
        type: 'VALIDATION_ERROR',
        message: 'Please provide a reason for reassignment',
      });
      return;
    }
    setStep('confirm');
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Step 1: Select User */}
            {step === 'select' && (
              <>
                <h1 className="govuk-heading-l">Reassign application</h1>
                
                {error && error.type === 'VALIDATION_ERROR' && (
                  <div className="govuk-error-summary" data-module="govuk-error-summary">
                    <div role="alert">
                      <h2 className="govuk-error-summary__title">There is a problem</h2>
                      <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                          <li><a href="#user-select">{error.message}</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <p className="govuk-body">
                  Select one user to be responsible for editing this draft application.
                </p>

                {currentEditor && (
                  <div className="govuk-inset-text">
                    <strong>Currently assigned to</strong><br />
                    {currentEditor.fullName || currentEditor.email}<br />
                    <span className="govuk-caption-m">{currentEditor.role}</span>
                  </div>
                )}

                {/* Search and Filter */}
                <div className="govuk-grid-row govuk-!-margin-bottom-4">
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="search">
                        Search by name or email
                      </label>
                      <input
                        className="govuk-input"
                        id="search"
                        name="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter name or email"
                      />
                    </div>
                  </div>
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="role-filter">
                        Filter by role
                      </label>
                      <select
                        className="govuk-select"
                        id="role-filter"
                        name="role-filter"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All roles</option>
                        <option value="APPLICANT_TEAM_COORDINATOR">Team Coordinator</option>
                        <option value="APPLICANT_USER">Applicant User</option>
                        <option value="APPLICANT_AGENT">Agent</option>
                      </select>
                    </div>
                  </div>
                </div>

                <h2 className="govuk-heading-m">Users in your organisation</h2>
                <p className="govuk-body">Showing <strong>{filteredUsers.length}</strong> users</p>

                <UserRadioList
                  users={filteredUsers}
                  selectedUserId={selectedUserId}
                  onSelect={setSelectedUserId}
                  currentEditorId={currentEditor?.id}
                  error={error?.type === 'VALIDATION_ERROR' ? error.message : undefined}
                />

                <button
                  className="govuk-button"
                  data-module="govuk-button"
                  onClick={handleNext}
                >
                  Continue
                </button>
                
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
                  onClick={() => navigate(`/applications/${applicationId}`)}
                >
                  Cancel
                </button>
              </>
            )}

            {/* Step 2: Reason (only if replacing existing editor) */}
            {step === 'reason' && (
              <>
                <h1 className="govuk-heading-l">Reason for reassignment</h1>
                
                {error && error.type === 'VALIDATION_ERROR' && (
                  <div className="govuk-error-summary" data-module="govuk-error-summary">
                    <div role="alert">
                      <h2 className="govuk-error-summary__title">There is a problem</h2>
                      <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                          <li><a href="#reason">{error.message}</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`govuk-form-group ${error?.type === 'VALIDATION_ERROR' ? 'govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor="reason">
                    Why are you reassigning this application?
                  </label>
                  <div id="reason-hint" className="govuk-hint">
                    Provide a brief explanation for audit purposes
                  </div>
                  {error?.type === 'VALIDATION_ERROR' && (
                    <p id="reason-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {error.message}
                    </p>
                  )}
                  <textarea
                    className={`govuk-textarea ${error?.type === 'VALIDATION_ERROR' ? 'govuk-textarea--error' : ''}`}
                    id="reason"
                    name="reason"
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    aria-describedby="reason-hint"
                  />
                </div>

                <button
                  className="govuk-button"
                  data-module="govuk-button"
                  onClick={handleReasonNext}
                >
                  Continue
                </button>
                
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
                  onClick={() => setStep('select')}
                >
                  Back
                </button>
              </>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <>
                <h1 className="govuk-heading-l">Confirm reassignment</h1>
                
                {error && (
                  <div className="govuk-error-summary" data-module="govuk-error-summary">
                    <div role="alert">
                      <h2 className="govuk-error-summary__title">There is a problem</h2>
                      <div className="govuk-error-summary__body">
                        <p>{error.message}</p>
                        {error.action === 'RETRY' && (
                          <button
                            className="govuk-button govuk-button--secondary govuk-!-margin-top-3"
                            onClick={() => handleSubmit()}
                          >
                            Try again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <dl className="govuk-summary-list">
                  {currentEditor && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Current editor</dt>
                      <dd className="govuk-summary-list__value">
                        {currentEditor.fullName || currentEditor.email}
                      </dd>
                    </div>
                  )}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">New editor</dt>
                    <dd className="govuk-summary-list__value">
                      {selectedUser?.fullName || selectedUser?.email}
                    </dd>
                    <dd className="govuk-summary-list__actions">
                      <a
                        className="govuk-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setStep('select');
                        }}
                      >
                        Change
                      </a>
                    </dd>
                  </div>
                  {reason && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Reason</dt>
                      <dd className="govuk-summary-list__value">{reason}</dd>
                      <dd className="govuk-summary-list__actions">
                        <a
                          className="govuk-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setStep('reason');
                          }}
                        >
                          Change
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                <button
                  className="govuk-button"
                  data-module="govuk-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Reassigning...' : 'Confirm reassignment'}
                </button>
                
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
                  onClick={() => setStep(requiresReason ? 'reason' : 'select')}
                  disabled={isSubmitting}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReassignApplicationPage;
