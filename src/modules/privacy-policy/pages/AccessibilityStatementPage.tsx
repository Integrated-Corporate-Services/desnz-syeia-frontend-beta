import { PageFeedback, RelatedContent } from '../components';

export function AccessibilityStatementPage() {
  const serviceName = 'SYEIA (Submit Your Energy Infrastructure Application)';
  const lastUpdated = '5 May 2026';
  const lastTested = '1 May 2026';

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Accessibility statement</h1>

            <p className="govuk-body-l">
              This accessibility statement applies to the {serviceName} service.
            </p>

            <p className="govuk-body">
              This service is run by the Department for Energy Security and Net Zero (DESNZ). We want as many
              people as possible to be able to use this service.
            </p>

            <p className="govuk-body">
              For example, that means you should be able to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>change colours, contrast levels and fonts</li>
              <li>zoom in up to 300% without the text spilling off the screen</li>
              <li>navigate most of the service using just a keyboard</li>
              <li>navigate most of the service using speech recognition software</li>
              <li>listen to most of the service using a screen reader (including the most recent versions of
                JAWS, NVDA and VoiceOver)</li>
            </ul>

            <p className="govuk-body">
              We've also made the service text as simple as possible to understand.
            </p>

            <p className="govuk-body">
              <a href="https://mcmw.abilitynet.org.uk/" className="govuk-link" target="_blank" rel="noopener noreferrer">
                AbilityNet
              </a> has advice on making your device easier to use if you have a disability.
            </p>

            <h2 className="govuk-heading-l">How accessible this service is</h2>
            <p className="govuk-body">
              We know some parts of this service are not fully accessible:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>some PDF documents are not fully accessible to screen reader software</li>
              <li>some older documents may not meet accessibility standards</li>
              <li>map interactions may be difficult for keyboard-only users</li>
            </ul>

            <h2 className="govuk-heading-l">Feedback and contact information</h2>
            <p className="govuk-body">
              If you need information on this service in a different format like accessible PDF, large print,
              easy read, audio recording or braille, please contact:
            </p>
            <div className="govuk-inset-text">
              <p className="govuk-body">
                Email: <a href="mailto:accessibility@energysecurity.gov.uk" className="govuk-link">
                  accessibility@energysecurity.gov.uk
                </a>
              </p>
            </div>
            <p className="govuk-body">
              We'll consider your request and get back to you within 5 working days.
            </p>

            <h2 className="govuk-heading-l">Reporting accessibility problems with this service</h2>
            <p className="govuk-body">
              We're always looking to improve the accessibility of this service. If you find any problems not
              listed on this page or think we're not meeting accessibility requirements, please contact:
            </p>
            <div className="govuk-inset-text">
              <p className="govuk-body">
                Email: <a href="mailto:accessibility@energysecurity.gov.uk" className="govuk-link">
                  accessibility@energysecurity.gov.uk
                </a>
              </p>
            </div>

            <h2 className="govuk-heading-l">Enforcement procedure</h2>
            <p className="govuk-body">
              The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies
              (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the 'accessibility regulations').
            </p>
            <p className="govuk-body">
              If you're not happy with how we respond to your complaint,{' '}
              <a href="https://www.equalityadvisoryservice.com/" className="govuk-link" target="_blank" rel="noopener noreferrer">
                contact the Equality Advisory and Support Service (EASS)
              </a>.
            </p>

            <h2 className="govuk-heading-l">Technical information about this service's accessibility</h2>
            <p className="govuk-body">
              DESNZ is committed to making this service accessible, in accordance with the Public Sector Bodies
              (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
            </p>

            <h3 className="govuk-heading-m">Compliance status</h3>
            <p className="govuk-body">
              This service is partially compliant with the{' '}
              <a href="https://www.w3.org/TR/WCAG21/" className="govuk-link" target="_blank" rel="noopener noreferrer">
                Web Content Accessibility Guidelines version 2.1
              </a> AA standard, due to the non-compliances listed below.
            </p>

            <h2 className="govuk-heading-l">Non-accessible content</h2>
            <p className="govuk-body">
              The content listed below is non-accessible for the following reasons.
            </p>

            <h3 className="govuk-heading-m">Non-compliance with the accessibility regulations</h3>
            <ul className="govuk-list govuk-list--bullet">
              <li>Some PDF documents do not have proper document structure tags (WCAG 2.1 success criterion 1.3.1)</li>
              <li>Some interactive map features are not fully keyboard accessible (WCAG 2.1 success criterion 2.1.1)</li>
            </ul>
            <p className="govuk-body">
              We plan to fix these issues by December 2026.
            </p>

            <h3 className="govuk-heading-m">Disproportionate burden</h3>
            <p className="govuk-body">
              Not applicable.
            </p>

            <h3 className="govuk-heading-m">Content that's not within the scope of the accessibility regulations</h3>
            <p className="govuk-body">
              Some older PDF documents published before September 2018 may not meet accessibility standards.
              These are exempt from the accessibility regulations.
            </p>

            <h2 className="govuk-heading-l">Preparation of this accessibility statement</h2>
            <p className="govuk-body">
              This statement was prepared on {lastUpdated}. It was last reviewed on {lastUpdated}.
            </p>
            <p className="govuk-body">
              This service was last tested on {lastTested}. The test was carried out by DESNZ internal teams and
              external accessibility consultants.
            </p>
            <p className="govuk-body">
              We tested:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>all main user journeys</li>
              <li>forms and form validation</li>
              <li>error messages and notifications</li>
              <li>navigation and page structure</li>
            </ul>

            <RelatedContent
              links={[
                { to: '/privacy', label: 'Privacy notice' },
                { to: '/cookies', label: 'Cookie policy and settings' },
                { to: '/terms', label: 'Terms and conditions' }
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
