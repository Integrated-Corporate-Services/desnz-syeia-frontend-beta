import { PageFeedback, RelatedContent } from '../components';

export function HelpPage() {
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Help</h1>

            <p className="govuk-body-l">
              Get help using the Submit Your Energy Infrastructure Application (SYEIA) service.
            </p>

            <h2 className="govuk-heading-l">Getting started</h2>
            <p className="govuk-body">
              To use this service, you will need:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>an account with appropriate permissions</li>
              <li>details about your energy infrastructure project</li>
              <li>relevant supporting documents</li>
            </ul>

            <h2 className="govuk-heading-l">Technical requirements</h2>
            <p className="govuk-body">
              This service works with the latest versions of modern browsers including:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Google Chrome</li>
              <li>Microsoft Edge</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari</li>
            </ul>
            <p className="govuk-body">
              JavaScript must be enabled for the service to work.
            </p>

            <h2 className="govuk-heading-l">Common questions</h2>

            <h3 className="govuk-heading-m">How do I create an account?</h3>
            <p className="govuk-body">
              You need to request access through your organisation administrator. If you are the first
              user from your organisation, you can submit an access request form.
            </p>

            <h3 className="govuk-heading-m">How do I submit an application?</h3>
            <p className="govuk-body">
              Once you have an account, you can start a new application from your dashboard. Follow the
              task list to complete all required sections before submitting.
            </p>

            <h3 className="govuk-heading-m">What documents do I need to upload?</h3>
            <p className="govuk-body">
              Required documents vary depending on your application type. The service will guide you through
              the specific requirements for your application.
            </p>

            <h3 className="govuk-heading-m">How long does the application process take?</h3>
            <p className="govuk-body">
              Processing times vary depending on the complexity of your application and statutory consultation
              requirements. You will be notified of progress via email.
            </p>

            <RelatedContent
              links={[
                { to: '/contact', label: 'Contact us' },
                { to: '/accessibility', label: 'Accessibility statement' },
                { to: '/privacy', label: 'Privacy notice' }
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
