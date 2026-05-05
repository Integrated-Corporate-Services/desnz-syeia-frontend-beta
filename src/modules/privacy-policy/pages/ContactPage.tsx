import { ContactInfo, PageFeedback, RelatedContent } from '../components';

export function ContactPage() {
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Contact us</h1>

            <p className="govuk-body-l">
              Get in touch with the Submit Your Energy Infrastructure Application (SYEIA) team.
            </p>

            <h2 className="govuk-heading-l">Email</h2>
            <p className="govuk-body">
              For general enquiries about the service:
            </p>
            <ContactInfo 
              contact={{
                name: 'General Enquiries',
                email: 'syeia.support@energysecurity.gov.uk'
              }}
            />
            <p className="govuk-body">
              We aim to respond within 5 working days.
            </p>

            <h2 className="govuk-heading-l">Telephone</h2>
            <p className="govuk-body">
              For urgent technical issues:
            </p>
            <ContactInfo 
              contact={{
                name: 'Support Line',
                phone: '0300 123 4567',
                openingHours: 'Monday to Friday, 9am to 5pm'
              }}
            />
            <p className="govuk-body-s">
              <a href="https://www.gov.uk/call-charges" className="govuk-link" target="_blank" rel="noopener noreferrer">
                Find out about call charges
              </a>
            </p>

            <h2 className="govuk-heading-l">Post</h2>
            <p className="govuk-body">
              If you need to send documents or correspondence by post:
            </p>
            <ContactInfo 
              contact={{
                name: 'SYEIA Team',
                address: [
                  'Department for Energy Security and Net Zero',
                  '1 Victoria Street',
                  'London',
                  'SW1H 0ET'
                ]
              }}
            />

            <h2 className="govuk-heading-l">Access requests</h2>
            <p className="govuk-body">
              For questions about account access or permissions:
            </p>
            <ContactInfo 
              contact={{
                name: 'Access Team',
                email: 'syeia.access@energysecurity.gov.uk'
              }}
            />

            <h2 className="govuk-heading-l">Technical support</h2>
            <p className="govuk-body">
              For technical issues or problems using the service:
            </p>
            <ContactInfo 
              contact={{
                name: 'Technical Support',
                email: 'syeia.technical@energysecurity.gov.uk'
              }}
            />
            <p className="govuk-body">
              When reporting technical issues, please include:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>a description of the problem</li>
              <li>what you were trying to do</li>
              <li>any error messages you saw</li>
              <li>the web browser and device you're using</li>
              <li>screenshots if relevant</li>
            </ul>

            <h2 className="govuk-heading-l">Feedback</h2>
            <p className="govuk-body">
              We welcome your feedback to help us improve the service:
            </p>
            <ContactInfo 
              contact={{
                name: 'Feedback',
                email: 'syeia.feedback@energysecurity.gov.uk'
              }}
            />

            <h2 className="govuk-heading-l">Privacy enquiries</h2>
            <p className="govuk-body">
              For questions about how we handle your personal data, see our{' '}
              <a href="/privacy" className="govuk-link">privacy notice</a> or contact:
            </p>
            <ContactInfo 
              contact={{
                name: 'Privacy Team',
                email: 'privacy@energysecurity.gov.uk'
              }}
            />

            <RelatedContent
              links={[
                { to: '/help', label: 'Help using this service' },
                { to: '/privacy', label: 'Privacy notice' },
                { to: '/accessibility', label: 'Accessibility statement' }
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
