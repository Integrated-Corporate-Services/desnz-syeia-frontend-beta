import { PageFeedback, RelatedContent } from '../components';

export function TermsAndConditionsPage() {
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Terms and conditions</h1>

            <p className="govuk-body-l">
              By using this service, you agree to our terms and conditions.
            </p>

            <h2 className="govuk-heading-l">General terms of use</h2>
            <p className="govuk-body">
              This service is operated by the Department for Energy Security and Net Zero (DESNZ).
            </p>
            <p className="govuk-body">
              These terms and conditions apply to your use of this service. If you do not agree to these terms,
              you should not use this service.
            </p>

            <h2 className="govuk-heading-l">Using this service responsibly</h2>
            <p className="govuk-body">
              You must use this service responsibly and not misuse it. You must not:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>attempt to gain unauthorised access to the service or any systems or networks connected to it</li>
              <li>introduce viruses, trojans, worms, logic bombs or other material that is malicious or harmful</li>
              <li>attempt to damage, disable, overburden or impair the service</li>
              <li>use automated systems or software to extract data from the service for commercial purposes</li>
              <li>submit false or misleading information</li>
            </ul>

            <h2 className="govuk-heading-l">Information you submit</h2>
            <p className="govuk-body">
              You are responsible for ensuring that any information you submit to this service is:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>accurate and complete</li>
              <li>not defamatory or offensive</li>
              <li>not in breach of any legal duty owed to a third party (such as a contractual duty or a duty of confidence)</li>
              <li>not used to impersonate any person or to misrepresent your identity or affiliation with any person</li>
            </ul>

            <h2 className="govuk-heading-l">Accuracy of information</h2>
            <p className="govuk-body">
              While we make every effort to ensure the information on this service is accurate, we cannot guarantee
              its completeness or accuracy and do not accept liability for errors or omissions.
            </p>

            <h2 className="govuk-heading-l">Availability of service</h2>
            <p className="govuk-body">
              We aim to make this service available 24 hours a day, but cannot guarantee continuous availability.
            </p>
            <p className="govuk-body">
              We may suspend or withdraw the service for operational, maintenance or security reasons, or in
              emergencies.
            </p>

            <h2 className="govuk-heading-l">Linking to this service</h2>
            <p className="govuk-body">
              We welcome and encourage links to this service. However, we do not endorse or approve of any content
              on websites that link to this service.
            </p>

            <h2 className="govuk-heading-l">Linking from this service</h2>
            <p className="govuk-body">
              This service contains links to other websites. We are not responsible for the content or reliability
              of the linked websites and do not endorse the views expressed within them.
            </p>

            <h2 className="govuk-heading-l">Virus protection</h2>
            <p className="govuk-body">
              We make every effort to check and test this service for viruses at every stage of production.
            </p>
            <p className="govuk-body">
              You must ensure that the way you use this service does not expose you to the risk of viruses,
              malicious computer code or other forms of interference which may damage your computer system.
            </p>
            <p className="govuk-body">
              We are not responsible for any loss, disruption or damage to your data or computer system that may
              occur while using this service.
            </p>

            <h2 className="govuk-heading-l">Liability</h2>
            <p className="govuk-body">
              DESNZ does not accept liability for loss or damage incurred by users of this service, whether direct,
              indirect or consequential, whether caused by tort, breach of contract or otherwise.
            </p>
            <p className="govuk-body">
              This includes loss of income or revenue, business, profits or contracts, anticipated savings, data,
              goodwill, tangible property or wasted time.
            </p>
            <p className="govuk-body">
              This condition does not affect any liability we may have for death or personal injury arising from
              our negligence, nor our liability for fraudulent misrepresentation or misrepresentation as to a
              fundamental matter, nor any other liability which cannot be excluded or limited under applicable law.
            </p>

            <h2 className="govuk-heading-l">Governing law</h2>
            <p className="govuk-body">
              These terms and conditions are governed by and construed in accordance with the laws of England and Wales.
            </p>
            <p className="govuk-body">
              Any dispute arising under these terms and conditions will be subject to the exclusive jurisdiction of
              the courts of England and Wales.
            </p>

            <h2 className="govuk-heading-l">Changes to these terms and conditions</h2>
            <p className="govuk-body">
              We may update these terms and conditions from time to time. We will notify you of any significant changes.
            </p>

            <RelatedContent
              links={[
                { to: '/privacy', label: 'Privacy notice' },
                { to: '/cookies', label: 'Cookie policy and settings' },
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
