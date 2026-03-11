import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
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
  const application = useApplicationStore((state) => state.application);
  const setApplication = useApplicationStore((state) => state.setApplication);

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
      app = await useApplicationStore.getState().startApplication(newAppData);
    }

    // Extract address information from the first user in the organization
    const firstUser = selectedOrganisation?.users?.[0];
    const organizationAddress = firstUser?.address_line1 || "";

    const updatedApp = {
      ...app,
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
    setApplication(updatedApp);

    navigate(`/tlp/${app.application_id}/applicant-details`, {
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
