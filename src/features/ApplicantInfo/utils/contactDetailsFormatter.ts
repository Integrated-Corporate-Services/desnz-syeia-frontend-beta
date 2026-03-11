import { ApplicationParty } from "../../../types/application";

export interface ContactDetails {
  applicantName: string;
  contactName: string;
  address: string;
  email: string;
  phone: string;
  additionalContacts: string[];
}

/**
 * Formats contact details from application party data
 * Uses team coordinator information (contact_person_* fields)
 * NOT agent information
 */
export function formatContactDetails(party?: ApplicationParty): ContactDetails {
  // Parse additional contacts from comma-separated string
  const additionalContacts = party?.additional_contact
    ? party.additional_contact
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
    : [];

  return {
    applicantName: party?.organisation_name || "",
    contactName: party?.contact_person_name || "",
    address: [
      party?.contact_person_line1,
      party?.contact_person_line2,
      party?.contact_person_city,
      party?.contact_person_country,
      party?.contact_person_postcode,
    ]
      .filter(Boolean)
      .join("<br>"),
    email: party?.contact_person_email || "",
    phone: party?.contact_person_phone || "",
    additionalContacts,
  };
}
