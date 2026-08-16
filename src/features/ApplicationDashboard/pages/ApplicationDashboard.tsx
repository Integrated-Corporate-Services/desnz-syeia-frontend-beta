/**
 * Application Dashboard Page Component
 *
 * Applications dashboard with optional filter sidebar.
 */
import React, { useEffect, useState } from "react";
import { useApplication } from "../../../hooks/useApplication";
import { useNavigate } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import { useApplicationDashboardFilters } from "../hooks/useApplicationDashboardFilters";
import { ApplicationDashboardFilters } from "../components/ApplicationDashboardFilters";
import { ApplicationDashboardHeader } from "../components/ApplicationDashboardHeader";
import { ApplicationDashboardTabs } from "../components/ApplicationDashboardTabs";
import { Pagination } from "../components/Pagination";
import { DEMO_USER_ID } from "../../../constants/demo";
import {
  shouldShowSubmittedByFilter,
  getUserRole,
} from "../../../utils/roleUtils";
import Header from "../../../layouts/component/Header";
import ServiceNavigation from "../../../layouts/component/ServiceNavigation";
import Footer from "../../../layouts/component/Footer";
import PhaseBanner from "../../../layouts/component/PhaseBanner";
import SkipLink from "../../../components/SkipLink";
import PageTitle from "../../../components/PageTitle";
import { trackButtonClick } from "../../../utils/analytics";
import "../../../styles/ApplicationDashboard.css";

const ApplicationDashboard: React.FC = () => {
  const { user } = useAuthUserContext();
  const created_by = (user as AuthUser)?.user_id || DEMO_USER_ID;
  const { applications, fetchApplications, setApplication } = useApplication();
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userRole = getUserRole(user as AuthUser);
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
    defaultSubmittedBy,
  } = useApplicationDashboardFilters(applications, created_by, userRole);

  useEffect(() => {
    if (created_by && typeof created_by === "string") {
      fetchApplications(created_by);
    }
  }, [created_by, fetchApplications]);

  const handleStart = () => {
    // Track start new application button click
    trackButtonClick('Start new application', '/application-dashboard', {
      user_id: created_by,
    });

    // Clear any previously-loaded application so the
    // subsequent new-application flow starts with a clean slate.
    setApplication(null);
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
    // Reset submitted by to user role default
    setSubmittedBy(defaultSubmittedBy);
    // Reset pagination
    setCurrentPage(1);
  };

  const canSeeSubmittedByFilter = shouldShowSubmittedByFilter(
    getUserRole(user as AuthUser),
  );

  return (
    <div className="application-dashboard-shell">
      {/* WCAG 2.4.2 Page Titled (Level A) - Issue #6 */}
      <PageTitle 
        title="Your Applications" 
        description="View and manage your energy infrastructure applications"
      />
      
      <SkipLink />
      <Header />
      <ServiceNavigation />
      <PhaseBanner />

      <div className="application-dashboard-shell-content">
      {/*
        WCAG 1.3.1 Info and Relationships (Level A) - Issue #7.
        <main> now wraps the whole dashboard (header through pagination),
        not just the hero header - previously the applications table and
        filters rendered outside the landmark entirely, so screen reader
        users navigating by landmark (e.g. NVDA Insert+F7) could reach the
        header but not the table that is the actual point of this page.
      */}
      <main className="govuk-main-wrapper" id="main-content" role="main">

      <div className="app-wide-container">
        <div className="app-your-applications-section">
          <div className="govuk-width-container">
            {/* Hero section - Your applications header */}
            <ApplicationDashboardHeader
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
              onStartNewApplication={handleStart}
            />
          </div>
        </div>
      </div>

      {/* Filter and tabs section with wider layout */}
      <div className="app-wide-container">
        <div
          className={`govuk-grid-row ${!showFilters ? "filter-hidden" : ""}`}
          id="filterTabsWrapper"
        >
          {/* Two-column layout when filters shown */}
          <div
            className={`govuk-grid-column-one-quarter ${!showFilters ? "hidden" : ""}`}
            id="filterPanel"
          >
            <div className="app-filter-panel">
              <ApplicationDashboardFilters
                showFilters={showFilters}
                searchText={searchText}
                submittedBy={submittedBy}
                caseTypes={caseTypes}
                statuses={statuses}
                showSubmittedByFilter={canSeeSubmittedByFilter}
                defaultSubmittedBy={defaultSubmittedBy}
                onSearchChange={setSearchText}
                onSubmittedByChange={setSubmittedBy}
                onCaseTypeToggle={toggleCaseType}
                onStatusToggle={toggleStatus}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          <div
            className={
              showFilters
                ? "govuk-grid-column-three-quarters"
                : "govuk-grid-column-full"
            }
            id="tabsPanel"
          >
            <ApplicationDashboardTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              counts={tabCounts}
            />

            <div className="application-dashboard-table-wrapper">
              <span
                className="application-dashboard-items-count"
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
                  <div className="app-pagination-container govuk-!-margin-top-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(
                        filteredApplications.length / itemsPerPage,
                      )}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0 });
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      </main>

      </div>

      <Footer />
    </div>
  );
};

export default ApplicationDashboard;
