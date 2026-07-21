import { ApplicationParty } from "../../../../types/application";

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  postcode?: string;
}

export interface ContactDetails {
  applicantName: string;
  contactName: string;
  address: Address;
  email: string;
  phone: string;
}

/**
 * Formats contact details from application party data
 * Uses team coordinator information (contact_person_* fields)
 * NOT agent information
 */
export function formatContactDetails(party?: ApplicationParty): ContactDetails {
  return {
    applicantName: party?.organisation_name || "",
    contactName: party?.contact_person_name || "",
    address: {
      line1: party?.contact_person_line1,
      line2: party?.contact_person_line2,
      city: party?.contact_person_city,
      country: party?.contact_person_country,
      postcode: party?.contact_person_postcode,
    },
    email: party?.contact_person_email || "",
    phone: party?.contact_person_phone || "",
  };
}
