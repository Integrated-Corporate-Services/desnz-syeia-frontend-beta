import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useNavigate } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import { ROUTES } from "../../../constants/routes";
import { useWorkbasketFilters } from "../hooks/useWorkbasketFilters";
import { WorkbasketFilters } from "../components/WorkbasketFilters";
import { WorkbasketHeader } from "../components/WorkbasketHeader";
import { WorkbasketTabs } from "../components/WorkbasketTabs";
import { Pagination } from "../components/Pagination";
import { DEMO_USER_ID } from "../../../constants/demo";

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

  // Determine if user can see "Submitted by" filter (admin or coordinator only)
  const canSeeSubmittedByFilter = Boolean(
    user && (
      (user as AuthUser)?.role === 'DESNZ_ADMIN' || 
      (user as AuthUser)?.role === 'TEAM_COORDINATOR'
    )
  );

  return (
    <>
      <div className="govuk-width-container govuk-!-margin-top-8" style={{ maxWidth: '1400px', paddingLeft: '20px', paddingRight: '20px' }}>
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
          <div className="workbasket-layout govuk-!-margin-bottom-6" style={{ maxWidth: '1600px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
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
              showSubmittedByFilter={canSeeSubmittedByFilter}
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

            <p className="govuk-body govuk-!-margin-top-6">
              {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
            </p>

            {filteredApplications.length > 0 && (
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
            )}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1600px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <WorkbasketTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            counts={tabCounts}
          />

          <p className="govuk-body govuk-!-margin-top-6">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
          </p>

          {filteredApplications.length > 0 && (
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
          )}
        </div>
      )}
      </main>
    </>
  );
};

export default Workbasket;
