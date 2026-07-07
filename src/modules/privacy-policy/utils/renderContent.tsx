import type { PrivacySection } from '../types';
import { ContactInfo } from '../components/ContactInfo';

export function renderSectionContent(section: PrivacySection) {
  return section.content.map((item, index) => {
    if (typeof item === 'string') {
      return (
        <p key={index} className="govuk-body">
          {item}
        </p>
      );
    }

    if (item.type === 'list') {
      return (
        <ul key={index} className="govuk-list govuk-list--bullet">
          {item.items.map((listItem, listIndex) => (
            <li key={listIndex}>{listItem}</li>
          ))}
        </ul>
      );
    }

    if (item.type === 'contact') {
      return <ContactInfo key={index} contact={item.data} />;
    }

    return null;
  });
}
