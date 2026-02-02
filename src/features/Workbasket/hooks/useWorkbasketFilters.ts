import { useState, useMemo } from "react";
import type { Application } from "../../../types/application";
import type { TabType } from "../constants/filterOptions";
import { normalizeApplicationType } from "../../../utils/formatters";

// Accept currentUserId for "Submitted by" filter
export const useWorkbasketFilters = (
  applications: Application[],
  currentUserId?: string,
) => {
  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [searchText, setSearchText] = useState("");
  const [submittedBy, setSubmittedBy] = useState<"me" | "all">("all");
  const [caseTypes, setCaseTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const toggleCaseType = (caseType: string) => {
    setCaseTypes((prev) =>
      prev.includes(caseType)
        ? prev.filter((t) => t !== caseType)
        : [...prev, caseType],
    );
  };

  const toggleStatus = (status: string) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  // Stage 1: Base filtering (search, case type, status, submitted by)
  const baseFilteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Submitted by filter
      if (submittedBy === "me" && currentUserId) {
        if (app.created_by !== currentUserId) {
          return false;
        }
      }
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesReference = app.desnz_ref
          ?.toLowerCase()
          .includes(searchLower);
        const matchesYourRef = app.your_reference
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesReference && !matchesYourRef) {
          return false;
        }
      }
      // Case type filter
      if (caseTypes.length > 0) {
        const normalizedAppType = normalizeApplicationType(app.type);
        if (!caseTypes.includes(normalizedAppType)) {
          return false;
        }
      }
      // Status filter
      if (statuses.length > 0) {
        const normalizedDbStatus = app.status.toUpperCase().replace(/[\s-]+/g, "_");
        if (!statuses.includes(normalizedDbStatus)) return false;
      }
      return true;
    });
  }, [
    applications,
    searchText,
    submittedBy,
    caseTypes,
    statuses,
    currentUserId,
  ]);

  // Stage 2: Apply active tab filter first
  const filteredApplications = useMemo(() => {
    return baseFilteredApplications.filter((app) => {
      const statusLower = app.status.toLowerCase().replace(/[_-]/g, " ");
      
      if (activeTab === "draft" && statusLower !== "draft") return false;
      if (activeTab === "active") {
        const activeStatuses = [
          "submitted",
          "application-submitted",
          "application submitted",
          "under-review",
          "under review",
          "in-progress",
          "in progress",
          "processing-payment",
          "processing payment",
          "further-information-requested",
          "further information requested",
          "representation-stage",
          "representation stage",
          "in-abeyance",
          "in abeyance",
        ];
        if (!activeStatuses.includes(statusLower)) return false;
      }
      if (activeTab === "completed") {
        const completedStatuses = [
          "completed",
          "decision-issued",
          "decision issued",
          "granted",
          "declined",
        ];
        if (!completedStatuses.includes(statusLower)) return false;
      }
      if (activeTab === "archived") {
        const archivedStatuses = ["archived", "withdrawn", "invalid"];
        if (!archivedStatuses.includes(statusLower)) return false;
      }
      return true;
    });
  }, [baseFilteredApplications, activeTab]);

  // Stage 3: Tab counts - count ALL applications in each tab category
  const tabCounts = useMemo(() => {
    const activeStatuses = [
      "submitted",
      "application-submitted",
      "application submitted",
      "under-review",
      "under review",
      "in-progress",
      "in progress",
      "processing-payment",
      "processing payment",
      "further-information-requested",
      "further information requested",
      "representation-stage",
      "representation stage",
      "in-abeyance",
      "in abeyance",
    ];
    const completedStatuses = [
      "completed",
      "decision-issued",
      "decision issued",
      "granted",
      "declined",
    ];
    const archivedStatuses = ["archived", "withdrawn", "invalid"];
    
    return {
      draft: baseFilteredApplications.filter(
        (app) => app.status.toLowerCase() === "draft",
      ).length,
      active: baseFilteredApplications.filter((app) =>
        activeStatuses.includes(app.status.toLowerCase().replace(/[_-]/g, " ")),
      ).length,
      completed: baseFilteredApplications.filter((app) =>
        completedStatuses.includes(app.status.toLowerCase().replace(/[_-]/g, " ")),
      ).length,
      archived: baseFilteredApplications.filter((app) =>
        archivedStatuses.includes(app.status.toLowerCase().replace(/[_-]/g, " ")),
      ).length,
    } as Record<TabType, number>;
  }, [baseFilteredApplications]);

  return {
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
  };
};
