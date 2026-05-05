import { PRIVACY_CONFIG } from '../config/privacy.config';
import { renderSectionContent } from '../utils/renderContent';
import { PageFeedback, RelatedContent } from '../components';

export function PrivacyNoticePage() {
  const config = PRIVACY_CONFIG;

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Privacy notice</h1>

            <p className="govuk-body-l">
              This notice sets out how we use your personal data and your rights under data protection law.
            </p>

            <nav className="govuk-!-margin-bottom-8" aria-label="Privacy notice contents">
              <h2 className="govuk-heading-s">Contents</h2>
              <ul className="govuk-list">
                {config.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="govuk-link">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {config.sections.map((section) => (
              <section key={section.id} id={section.id} className="govuk-!-margin-bottom-8">
                <h2 className="govuk-heading-l">{section.title}</h2>
                {renderSectionContent(section)}
              </section>
            ))}

            <div className="govuk-!-margin-top-8 govuk-!-padding-top-4" style={{ borderTop: '1px solid #b1b4b6' }}>
              <p className="govuk-body-s">
                <strong>Last updated:</strong> {config.lastUpdated}
              </p>
            </div>

            <RelatedContent
              links={[
                { to: '/cookies', label: 'Cookie policy and settings' },
                { to: '/accessibility', label: 'Accessibility statement' },
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
