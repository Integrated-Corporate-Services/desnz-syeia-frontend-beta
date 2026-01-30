import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useNavigate } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import { useWorkbasketFilters } from "../hooks/useWorkbasketFilters";
import { WorkbasketFilters } from "../components/WorkbasketFilters";
import { WorkbasketHeader } from "../components/WorkbasketHeader";
import { WorkbasketTabs } from "../components/WorkbasketTabs";
import { Pagination } from "../components/Pagination";
import { DEMO_USER_ID } from "../../../constants/demo";
import { EmptyState } from "../../../components/shared/EmptyState";
import { shouldShowSubmittedByFilter } from "../../../utils/roleUtils";

const Workbasket = () => {
  const { user } = useAuthUserContext();
  const created_by =
    (user as AuthUser)?.person_id ||
    (user as AuthUser)?.user_id ||
    DEMO_USER_ID;
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore(
    (state) => state.loadApplications
  );
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    submittedBy,
    setSubmittedBy,
    caseTypes,
    toggleCaseType,
    statuses,
    toggleStatus,
    filteredApplications,
    tabCounts,
  } = useWorkbasketFilters(applications);

  /**
   * Load applications from backend with organization and role-based filtering.
   * 
   * SECURITY & BACKEND CONTRACT (AC8):
   * =====================================
   * 
   * Backend Responsibilities:
   * 1. Organization-Level Filtering:
   *    - Backend MUST filter applications to only those belonging to user's organization
   *    - Frontend receives pre-filtered data (no additional org filtering needed)
   *    - User CANNOT access applications from other organizations
   *    - Organization membership validation enforced by backend authentication middleware
   * 
   * 2. Role-Based Access Control:
   *    - Agents (APPLICANT_AGENT): Only applications created by agent themselves
   *    - Applicants (APPLICANT_USER, APPLICANT_FINANCE): Applications they created or have access to
   *    - Team Coordinators (APPLICANT_TEAM_COORDINATOR): All applications for their organization
   *    - Admins (DESNZ_ADMIN, BUSINESS_ADMIN, TECH_ADMIN, DESNZ_CASEWORKER): All applications
   * 
   * 3. Security Assumptions:
   *    - Backend validates JWT token and extracts user_id + organization_id
   *    - Backend enforces role-based filtering before returning data
   *    - API rate limiting applied (100 requests/minute per user)
   *    - Audit logging tracks all application access
   * 
   * Frontend Responsibilities:
   * - Display data as received (backend is source of truth)
   * - Apply UI-level filters (search, case type, status) for UX only
   * - Trust that backend has already enforced security policies
   * - Do NOT implement security filtering client-side
   * 
   * Error Handling:
   * - 401 Unauthorized: Token expired or invalid
   * - 403 Forbidden: User lacks access to requested resource
   * - 500 Internal Server Error: Backend filtering failure
   * 
   * @see src/store/useApplicationStore.ts for API implementation
   * @see docs/API_Contracts.md for full backend specification
   */
  useEffect(() => {
    if (created_by && typeof created_by === "string") {
      loadApplications(created_by);
    }
  }, [created_by, loadApplications]);

  const handleStart = () => {
    navigate("/choose-application");
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    // Clear search text
    setSearchText('');
    // Clear case types
    caseTypes.forEach(type => toggleCaseType(type));
    // Clear statuses
    statuses.forEach(status => toggleStatus(status));
    // Reset submitted by to default
    setSubmittedBy('me');
    // Reset pagination
    setCurrentPage(1);
  };

  /**
   * Determine if user should see "Submitted by" filter control.
   * 
   * AC9: Agent Filtering
   * ====================
   * - Agents (APPLICANT_AGENT): Filter HIDDEN (always see only their own apps)
   * - All other roles: Filter VISIBLE (can choose "Me" or "All users")
   * 
   * Uses roleUtils.shouldShowSubmittedByFilter() for:
   * - Correct backend role name matching (APPLICANT_AGENT not 'AGENT')
   * - Type safety via TypeScript constants
   * - Centralized role logic (single source of truth)
   * - Easy maintenance when roles change
   * 
   * @see src/utils/roleUtils.ts for role definitions
   */
  const showSubmittedByFilterControl = shouldShowSubmittedByFilter(
    (user as AuthUser)?.role
  );

  return (
    <>
      <div className="govuk-width-container govuk-!-margin-top-8" style={{ maxWidth: '1400px', paddingLeft: '48px', paddingRight: '48px' }}>
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="govuk-skip-link">Skip to main content</a>
        
        {/* Header and action buttons always at the top, inside container */}
        <WorkbasketHeader
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
          onStartNewApplication={handleStart}
        />
      </div>

      {/* Main content area - breaks out of width container for wider layout */}
      <main id="main-content">
        {/* Filters and table area */}
        {showFilters ? (
          <div className="workbasket-layout govuk-!-margin-bottom-6" style={{ maxWidth: '1800px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
            <div
              id="workbasket-filters"
              className="workbasket-sidebar"
            >
            <WorkbasketFilters
              showFilters={showFilters}
              searchText={searchText}
              submittedBy={submittedBy}
              caseTypes={caseTypes}
              statuses={statuses}
              showSubmittedByFilter={showSubmittedByFilterControl}
              onSearchChange={setSearchText}
              onSubmittedByChange={setSubmittedBy}
              onCaseTypeToggle={toggleCaseType}
              onStatusToggle={toggleStatus}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
          <div className="workbasket-content">
            <WorkbasketTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              counts={tabCounts}
            />

            {/* Results count with ARIA live region for screen readers */}
            {filteredApplications.length > 0 && (
              <p 
                className="govuk-body govuk-!-margin-top-6"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
              </p>
            )}

            {/* AC7: Empty State or Application Table */}
            {filteredApplications.length > 0 ? (
              <>
                <ApplicationTable
                  applications={filteredApplications.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )}
                  activeTab={activeTab}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    filteredApplications.length / itemsPerPage
                  )}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            ) : (
              <EmptyState
                variant="no-applications"
                customHeading={
                  activeTab === 'draft'
                    ? "You have no draft applications"
                    : `You have no ${activeTab} applications`
                }
                customBody={
                  activeTab === 'draft'
                    ? "Start a new application to get started"
                    : "Applications will appear here when they reach this status"
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1800px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <WorkbasketTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            counts={tabCounts}
          />

          {/* Results count with ARIA live region for screen readers */}
          {filteredApplications.length > 0 && (
            <p 
              className="govuk-body govuk-!-margin-top-6"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
            </p>
          )}

          {/* AC7: Empty State or Application Table */}
          {filteredApplications.length > 0 ? (
            <>
              <ApplicationTable
                applications={filteredApplications.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )}
                activeTab={activeTab}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(
                  filteredApplications.length / itemsPerPage
                )}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          ) : (
            <EmptyState
              variant="no-applications"
              customHeading={
                activeTab === 'draft'
                  ? "You have no draft applications"
                  : `You have no ${activeTab} applications`
              }
              customBody={
                activeTab === 'draft'
                  ? "Start a new application to get started"
                  : "Applications will appear here when they reach this status"
              }
            />
          )}
        </div>
      )}
      </main>
    </>
  );
};

export default Workbasket;
