/**
 * Workbasket Page Component
 * 
 * Applications dashboard with filter sidebar that extends to the left of the main content.
 * This component uses layout: false in routes to have full control over page structure
 * while maintaining GDS compliance.
 * 
 * GDS Compliance:
 * - WCAG 2.1 AA accessible
 * - GOV.UK Design System patterns
 * - Proper landmark structure (header, main, footer)
 * - Skip link for keyboard navigation
 * - Semantic HTML structure
 * 
 * @module features/Workbasket/pages/Workbasket
 */
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
// Import layout components for standalone page (layout: false)
import Header from "../../../layouts/component/Header";
import ServiceNavigation from "../../../layouts/component/ServiceNavigation";
import Footer from "../../../layouts/component/Footer";
import "../../../styles/Workbasket.css";

const Workbasket: React.FC = () => {
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
      {/* GDS Header - Same as MainLayout */}
      <Header />
      
      {/* Service Navigation - Same as MainLayout */}
      <ServiceNavigation />

      {/* GDS Skip Link - WCAG 2.1 AA requirement */}
      <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
        Skip to main content
      </a>

      {/* Hero Section - Inside govuk-width-container for proper alignment */}
      <div className="govuk-width-container">
        <div className="workbasket-hero-section">
          <WorkbasketHeader
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onStartNewApplication={handleStart}
          />
        </div>
      </div>

      {/* Main Content - Outside govuk-width-container to allow filter bleed */}
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {showFilters ? (
          /* Two-column layout: Filter + Content */
          <div className="workbasket-full-width-container">
            <div className="workbasket-two-column-layout">
              {/* Filter Sidebar - Positioned to the left */}
              <aside 
                id="workbasket-filters"
                className="workbasket-filter-column"
                aria-label="Filter applications"
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
              </aside>

              {/* Results Content - Aligned with hero section */}
              <section className="workbasket-results-column" aria-label="Application results">
                <WorkbasketTabs
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  counts={tabCounts}
                />

                {/* Table wrapper with items count and table inside */}
                <div className="workbasket-table-wrapper">
                  <span className="workbasket-items-count" role="status" aria-live="polite">
                    {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
                  </span>

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
                        totalPages={Math.ceil(filteredApplications.length / itemsPerPage)}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </>
                  )}


                </div>
              </section>
            </div>
          </div>
        ) : (
          /* Single column layout - Standard govuk-width-container */
          <div className="govuk-width-container">
            <WorkbasketTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              counts={tabCounts}
            />

            {/* Table wrapper with items count and table inside */}
            <div className="workbasket-table-wrapper">
              <span className="workbasket-items-count" role="status" aria-live="polite">
                {filteredApplications.length} {filteredApplications.length === 1 ? 'item' : 'items'}
              </span>

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
                    totalPages={Math.ceil(filteredApplications.length / itemsPerPage)}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* GDS Footer - Same as MainLayout */}
      <Footer />
    </>
  );
};

export default Workbasket;
