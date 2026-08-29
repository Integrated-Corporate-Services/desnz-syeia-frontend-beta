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
            <p className="govuk-body">
              {CONTACT.RESPONSE_TIME}
            </p>

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.TELEPHONE}</h2>
            <p className="govuk-body">
              {CONTACT.TELEPHONE_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.SUPPORT_NAME,
                phone: CONTACT.CONTACTS.SUPPORT_PHONE,
                openingHours: CONTACT.CONTACTS.SUPPORT_HOURS
              }}
            />
            <p className="govuk-body-s">
              <a href={CONTACT.CALL_CHARGES_LINK} className="govuk-link" target="_blank" rel="noopener noreferrer">
                {CONTACT.CALL_CHARGES_TEXT}
              </a>
            </p>

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.POST}</h2>
            <p className="govuk-body">
              {CONTACT.POST_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.POST_NAME,
                address: CONTACT.CONTACTS.POST_ADDRESS
              }}
            />

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.ACCESS_REQUESTS}</h2>
            <p className="govuk-body">
              {CONTACT.ACCESS_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.ACCESS_NAME,
                email: CONTACT.CONTACTS.ACCESS_EMAIL
              }}
            />

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.TECHNICAL_SUPPORT}</h2>
            <p className="govuk-body">
              {CONTACT.TECHNICAL_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.TECHNICAL_NAME,
                email: CONTACT.CONTACTS.TECHNICAL_EMAIL
              }}
            />
            <p className="govuk-body">
              {CONTACT.TECHNICAL_INCLUDE_INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {CONTACT.TECHNICAL_INCLUDE_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.FEEDBACK}</h2>
            <p className="govuk-body">
              {CONTACT.FEEDBACK_INTRO}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.FEEDBACK_NAME,
                email: CONTACT.CONTACTS.FEEDBACK_EMAIL
              }}
            />

            <h2 className="govuk-heading-l">{CONTACT.SECTIONS.PRIVACY_ENQUIRIES}</h2>
            <p className="govuk-body">
              {CONTACT.PRIVACY_INTRO}{' '}
              <a href="/privacy" className="govuk-link">{CONTACT.PRIVACY_LINK_TEXT}</a> {CONTACT.PRIVACY_OR_CONTACT}
            </p>
            <ContactInfo 
              contact={{
                name: CONTACT.CONTACTS.PRIVACY_NAME,
                email: CONTACT.CONTACTS.PRIVACY_EMAIL
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
