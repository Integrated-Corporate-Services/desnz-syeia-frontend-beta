import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplication } from "../../../../hooks/useApplication";
import { applicationApiService } from "../../../../services/applicationApiService";
import type { AuthUser } from "../../../../types/auth";
import type { OrganizationOption } from "../hooks/useNetworkOperators";

/**
 * Custom hook to handle form submission and navigation
 */
export const useWhoIsApplyingForm = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { application, setApplication, createNewApplication } = useApplication();

  const handleSubmit = async (
    e: React.FormEvent,
    selectedOrgName: string,
    selectedOrganisation: OrganizationOption | null,
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
        type: "TLP",
        operator_ref: "",
        status: "Draft",
        created_by: (user as AuthUser)?.user_id || "",
      };
      app = await createNewApplication(newAppData);
    }

    if (!app || !app.application_id) {
      setError("Failed to create application");
      return;
    }

    // Extract address information from the first user in the organization
    const firstUser = selectedOrganisation?.users?.[0];
    const organizationAddress = firstUser?.address_line1 || "";

    const updatedApp = {
      ...app,
      application_id: app.application_id, // Explicitly include required field
      application_party: {
        ...app?.application_party,
        party_type: app?.application_party?.party_type ?? "",
        organisation_id: selectedOrganisation?.organisation_id || "",
        organisation_name: selectedOrganisation?.organisation_name || "",
        line1: organizationAddress,
        is_primary: true,
      },
    };

    // Save organization to database
    await applicationApiService.updateOrganisation(
      app.application_id,
      selectedOrganisation?.organisation_id || "",
      selectedOrganisation?.organisation_name || "",
      organizationAddress
    );

    // Update local store
    setApplication(updatedApp as any); // Type assertion needed due to partial Application type

    navigate(`/tlp/${app.application_id}/applicant-details`, {
      state: {
        organisationId: selectedOrganisation?.organisation_id,
        organisationName: selectedOrganisation?.organisation_name,
      },
    });
  };

  const clearError = () => {
    setError("");
    setSubmitted(false);
  };

  return {
    submitted,
    error,
    handleSubmit,
    clearError,
  };
};
