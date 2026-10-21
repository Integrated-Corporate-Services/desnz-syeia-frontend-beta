import { useEffect, useState } from "react";
import type { Application } from "../../../../types/application";
import type { ApplicationParty } from "../../../../types/application";

interface UseApplicationSyncOptions {
  application: Application | null;
  options: ApplicationParty[];
  onReferenceSync: (ref: string) => void;
  onCoordinatorSync: (name: string, org: ApplicationParty | null) => void;
  onContactsSync: (contacts: string[]) => void;
}

/**
 * Custom hook to sync application data with local form state
 * Handles the complex logic of binding application data to form fields
 */
export const useApplicationSync = ({
  application,
  options,
  onReferenceSync,
  onCoordinatorSync,
  onContactsSync,
}: UseApplicationSyncOptions) => {
  const [initialContactsLoaded, setInitialContactsLoaded] = useState(false);
  const [initialCoordinatorLoaded, setInitialCoordinatorLoaded] =
    useState(false);

  // Sync operator reference
  useEffect(() => {
    if (!application) return;

    if (
      application.operator_ref !== undefined &&
      application.operator_ref !== null
    ) {
      onReferenceSync(application.operator_ref);
    }
  }, [application, onReferenceSync]);

  // Sync selected coordinator (only once on initial load)
  useEffect(() => {
    if (
      initialCoordinatorLoaded ||
      !application?.application_party ||
      options.length === 0
    )
      return;

    // Check for contact_person_name (new field) or person_name (legacy)
    const personName =
      application.application_party.contact_person_name ||
      application.application_party.person_name;

    if (!personName) {
      setInitialCoordinatorLoaded(true);
      return;
    }

    const org = options.find(
      (opt) =>
        opt.person_name?.trim().toLowerCase() ===
        personName.trim().toLowerCase()
    );

    if (org) {
      onCoordinatorSync(personName, org);
    }

    setInitialCoordinatorLoaded(true);
  }, [application, options, onCoordinatorSync, initialCoordinatorLoaded]);

  // Sync additional contacts (once only)
  useEffect(() => {
    if (
      !application?.application_party?.additional_contact ||
      initialContactsLoaded
    ) {
      return;
    }

    const contacts = application.application_party.additional_contact
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    onContactsSync(contacts);
    setInitialContactsLoaded(true);
  }, [application, initialContactsLoaded, onContactsSync]);

  return {
    initialContactsLoaded,
  };
};
