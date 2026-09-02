import { ContactInfo, PageFeedback, RelatedContent } from '../components';
import { CONTACT, RELATED_LINKS } from '../constants';
import PageTitle from '../../../components/PageTitle';

export function ContactPage() {
  return (
    <div className="govuk-width-container">
      <PageTitle title="Contact us" />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{CONTACT.PAGE_TITLE}</h1>

            <p className="govuk-body-l">
              {CONTACT.INTRO}
            </p>

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.EMAIL}</h2>
            <p className="govuk-body">
              {CONTACT.EMAIL_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.GENERAL_NAME,
                email: CONTACT.CONTACTS.GENERAL_EMAIL
              }}
            />
            <RelatedContent
              links={[
                RELATED_LINKS.PRIVACY,
                RELATED_LINKS.ACCESSIBILITY
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
