import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { applicationApiService } from "../../../services/applicationApiService";
import type { AuthUser } from "../../../types/auth";

type NetworkOperator = {
  organisation_id: string;
  organisation_name: string;
  full_name: string;
  line1?: string;
};

/**
 * Custom hook to handle form submission and navigation
 */
export const useWhoIsApplyingForm = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const application = useApplicationStore((state) => state.application);
  const setApplication = useApplicationStore((state) => state.setApplication);

  const handleSubmit = async (
    e: React.FormEvent,
    selectedOrgName: string,
    selectedOrganisation: NetworkOperator | null,
    user: AuthUser | null
  ) => {
    e.preventDefault();
    setSubmitted(true);

    if (!selectedOrgName) {
      setError("Select the network operator");
      return;
    }
    setError("");

    let app = application;
    if (!app || !app.application_id) {
      const newAppData = {
        type: "S37",
        operator_ref: "",
        status: "Draft",
        created_by: (user as AuthUser)?.user_id || "",
      };
      app = await useApplicationStore.getState().startApplication(newAppData);
    }

    const updatedApp = {
      ...app,
      application_party: {
        ...app?.application_party,
        party_type: app?.application_party?.party_type ?? "",
        organisation_id: selectedOrganisation?.organisation_id || "",
        organisation_name: selectedOrganisation?.organisation_name || "",
        line1: selectedOrganisation?.line1 || "",
        is_primary: true,
      },
    };

    // Save organization to database
    await applicationApiService.updateOrganisation(
      app.application_id,
      selectedOrganisation?.organisation_id || "",
      selectedOrganisation?.organisation_name || "",
      selectedOrganisation?.line1
    );

    // Update local store
    setApplication(updatedApp);

    navigate(`/s-37/${app.application_id}/network-operator-details`, {
      state: {
        organisationId: selectedOrganisation?.organisation_id,
        organisationName: selectedOrganisation?.organisation_name,
      },
    });
  };

  return {
    submitted,
    error,
    handleSubmit,
  };
};
