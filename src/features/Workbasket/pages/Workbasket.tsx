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

  return (
    <div className="govuk-width-container govuk-!-margin-top-8">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <WorkbasketHeader
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onStartNewApplication={handleStart}
          />

          {showFilters ? (
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div
                className="govuk-grid-column-one-quarter govuk-!-padding-4"
                style={{ backgroundColor: "#f3f2f1" }}
              >
                <WorkbasketFilters
                  showFilters={showFilters}
                  searchText={searchText}
                  submittedBy={submittedBy}
                  caseTypes={caseTypes}
                  statuses={statuses}
                  onSearchChange={setSearchText}
                  onSubmittedByChange={setSubmittedBy}
                  onCaseTypeToggle={toggleCaseType}
                  onStatusToggle={toggleStatus}
                  onApplyFilters={handleApplyFilters}
                />
              </div>
              <div className="govuk-grid-column-three-quarters">
                <WorkbasketTabs
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  counts={tabCounts}
                />

                <p className="govuk-body govuk-!-margin-top-6">
                  {filteredApplications.length} items
                </p>

                {filteredApplications.length > 0 ? (
                  <>
                    <ApplicationTable
                      applications={filteredApplications.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )}
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
                  <p className="govuk-body">No applications found.</p>
                )}
              </div>
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

              <p className="govuk-body govuk-!-margin-top-6">
                {filteredApplications.length} items
              </p>

              {filteredApplications.length > 0 ? (
                <>
                  <ApplicationTable
                    applications={filteredApplications.slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )}
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
                <p className="govuk-body">No applications found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbasket;
