import { CPO_BASE_URL } from "../../../constants/cpo";
import { NWL_BASE_URL } from "../../../constants/nwl";
import { FIR_CONTACT_EMAIL } from "../../FIR/constants/fir.constants";

export type WithdrawalApplicationType = "CPO" | "NWL" | "S37";

/** The shared withdraw pages serve S37, NWL and CPO; the URL tells the type apart before the application has loaded. */
export const applicationTypeFromPath = (pathname: string): WithdrawalApplicationType => {
  if (pathname.startsWith(`${CPO_BASE_URL}/`)) return "CPO";
  if (pathname.startsWith(`${NWL_BASE_URL}/`)) return "NWL";
  return "S37";
};

const WITHDRAWAL_CONTACT_EMAIL: Record<WithdrawalApplicationType, string> = {
  CPO: "compulsorypurchaseorders@energysecurity.gov.uk",
  NWL: FIR_CONTACT_EMAIL.NWL,
  S37: "S37consents@energysecurity.gov.uk",
};

/** The team mailbox an applicant contacts if they sent a withdrawal request by mistake. */
export const withdrawalContactEmail = (formType: string): string => {
  const type = formType.toUpperCase();
  return type === "CPO" || type === "NWL" ? WITHDRAWAL_CONTACT_EMAIL[type] : WITHDRAWAL_CONTACT_EMAIL.S37;
};
