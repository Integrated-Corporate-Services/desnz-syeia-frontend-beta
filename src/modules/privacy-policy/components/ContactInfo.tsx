import type { ContactInfo as ContactInfoType } from '../types';

interface ContactInfoProps {
  contact: ContactInfoType;
}

export function ContactInfo({ contact }: ContactInfoProps) {
  return (
    <div className="govuk-inset-text">
      <p className="govuk-body">
        <strong>{contact.name}</strong>
      </p>
      {contact.email && (
        <p className="govuk-body">
          Email: <a href={`mailto:${contact.email}`} className="govuk-link">{contact.email}</a>
        </p>
      )}
      {contact.phone && (
        <p className="govuk-body">
          Telephone: {contact.phone}
        </p>
      )}
      {contact.openingHours && (
        <p className="govuk-body">
          {contact.openingHours}
        </p>
      )}
      {contact.address && (
        <p className="govuk-body" style={{ whiteSpace: 'pre-line' }}>
          {contact.address.join('\n')}
        </p>
      )}
    </div>
  );
}
