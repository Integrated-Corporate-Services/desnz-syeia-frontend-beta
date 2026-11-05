import React from 'react';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { NOT_ANSWERED } from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  application: CpoAnswers['application'];
}

/** Applicant organisation, contact, and reference — never shows a Change link. */
export const ApplicantDetailsSummaryCard: React.FC<Props> = ({ application }) => {
  const party = application.application_party;
  const additional = party?.additional_contact ?? application.additional_contact;
  const contacts = Array.isArray(additional)
    ? additional
    : additional?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];

  return (
    <SummaryCard title="Applicant details">
      <SummaryRow label="Applicant name">{party?.organisation_name || NOT_ANSWERED}</SummaryRow>
      <SummaryRow label="Applicant contact name">{party?.contact_person_name || NOT_ANSWERED}</SummaryRow>
      <SummaryRow label="Address">
        {[party?.contact_person_line1, party?.contact_person_line2, party?.contact_person_city, party?.contact_person_county, party?.contact_person_postcode].filter(Boolean).join('\n') || NOT_ANSWERED}
      </SummaryRow>
      <SummaryRow label="Email address">{party?.contact_person_email || NOT_ANSWERED}</SummaryRow>
      <SummaryRow label="Phone number">{party?.contact_person_phone || NOT_ANSWERED}</SummaryRow>
      <SummaryRow label="Additional contacts">{contacts.join('\n') || 'None added'}</SummaryRow>
      <SummaryRow label="Applicant’s reference">{application.operator_ref || 'Not provided'}</SummaryRow>
    </SummaryCard>
  );
};

export default ApplicantDetailsSummaryCard;
