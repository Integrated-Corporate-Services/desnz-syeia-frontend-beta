import { useState, useEffect } from "react";
import { Application } from "../../../../types/application";

/**
 * Custom hook to manage contact confirmation state
 * Syncs with application_party.contact_isconfirmed field
 */
export function useContactConfirmation(application: Application | null) {
  const [contactIsConfirmed, setContactIsConfirmed] = useState<
    true | false | null
  >(null);

  useEffect(() => {
    const party = application?.application_party;
    if (party && typeof party.contact_isconfirmed === "boolean") {
      setContactIsConfirmed(party.contact_isconfirmed);
    } else {
      setContactIsConfirmed(null);
    }
  }, [application?.application_party]);

  return { contactIsConfirmed, setContactIsConfirmed };
}
