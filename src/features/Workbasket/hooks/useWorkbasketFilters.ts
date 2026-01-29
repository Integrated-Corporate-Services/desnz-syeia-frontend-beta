import { useState, useMemo } from "react";
import type { Application } from "../../../types/application";
import type { TabType } from "../constants/filterOptions";
import { normalizeApplicationType } from "../../../utils/formatters";

export const useWorkbasketFilters = (applications: Application[]) => {
  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [searchText, setSearchText] = useState("");
  const [submittedBy, setSubmittedBy] = useState<"me" | "all">("all");
  const [caseTypes, setCaseTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const toggleCaseType = (caseType: string) => {
    setCaseTypes((prev) =>
      prev.includes(caseType)
        ? prev.filter((t) => t !== caseType)
        : [...prev, caseType]
    );
  };

  const toggleStatus = (status: string) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const statusLower = app.status.toLowerCase();

      // Tab filter
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
        const normalizedStatus = app.status.toLowerCase().replace(/\s+/g, "-");
        if (!statuses.includes(normalizedStatus)) return false;
      }

      return true;
    });
  }, [applications, activeTab, searchText, submittedBy, caseTypes, statuses]);

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
      draft: applications.filter((app) => app.status.toLowerCase() === "draft")
        .length,
      active: applications.filter((app) =>
        activeStatuses.includes(app.status.toLowerCase())
      ).length,
      completed: applications.filter((app) =>
        completedStatuses.includes(app.status.toLowerCase())
      ).length,
      archived: applications.filter((app) =>
        archivedStatuses.includes(app.status.toLowerCase())
      ).length,
    } as Record<TabType, number>;
  }, [applications]);

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
