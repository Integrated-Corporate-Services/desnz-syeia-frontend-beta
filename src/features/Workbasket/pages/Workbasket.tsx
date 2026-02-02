/**
 * Workbasket Page Component
 * 
 * Applications dashboard with optional filter sidebar.
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
import { shouldShowSubmittedByFilter, getUserRole } from "../../../utils/roleUtils";
import Header from "../../../layouts/component/Header";
import ServiceNavigation from "../../../layouts/component/ServiceNavigation";
import Footer from "../../../layouts/component/Footer";
import "../../../styles/Workbasket.css";

const Workbasket: React.FC = () => {
  const { user } = useAuthUserContext();
  const created_by =
    (user as AuthUser)?.user_id ||
    DEMO_USER_ID;
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore(
    (state) => state.loadApplications,
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
  } = useWorkbasketFilters(applications, created_by);

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
    setSearchText("");
    // Clear case types
    caseTypes.forEach((type) => toggleCaseType(type));
    // Clear statuses
    statuses.forEach((status) => toggleStatus(status));
    // Reset submitted by to default
    setSubmittedBy("me");
    // Reset pagination
    setCurrentPage(1);
  };

  const canSeeSubmittedByFilter = shouldShowSubmittedByFilter(getUserRole(user as AuthUser));

  return (
    <>
      <Header />
      <ServiceNavigation />
      
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main" style={{ paddingTop: 16, paddingBottom: 16 }}>
          
          {/* Hero section - Your applications header */}
          <WorkbasketHeader
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onStartNewApplication={handleStart}
          />

          {/* Two-column layout when filters shown */}
          {showFilters ? (
            <div className="workbasket-two-column-layout">
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

              <section
                className="workbasket-results-column"
                aria-label="Application results"
              >
                <WorkbasketTabs
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  counts={tabCounts}
                />

                <div className="workbasket-table-wrapper">
                  <span
                    className="workbasket-items-count"
                    role="status"
                    aria-live="polite"
                  >
                    {filteredApplications.length}{" "}
                    {filteredApplications.length === 1 ? "item" : "items"}
                  </span>

                  {filteredApplications.length > 0 && (
                    <>
                      <ApplicationTable
                        applications={filteredApplications.slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        )}
                        activeTab={activeTab}
                      />
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          filteredApplications.length / itemsPerPage,
                        )}
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
          ) : (
            <>
              <WorkbasketTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              counts={tabCounts}
            />

            <div className="workbasket-table-wrapper">
              <span
                className="workbasket-items-count"
                role="status"
                aria-live="polite"
              >
                {filteredApplications.length}{" "}
                {filteredApplications.length === 1 ? "item" : "items"}
              </span>

              {filteredApplications.length > 0 && (
                <>
                  <ApplicationTable
                    applications={filteredApplications.slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )}
                    activeTab={activeTab}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredApplications.length / itemsPerPage,
                    )}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}
            </div>
          </>
          )}
          
        </main>
      </div>
      
      <Footer />
    </>
  );
};

export default Workbasket;
