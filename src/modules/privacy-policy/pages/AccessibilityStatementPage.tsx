import { PageFeedback, RelatedContent } from '../components';
import { ACCESSIBILITY, RELATED_LINKS } from '../constants';

export function AccessibilityStatementPage() {
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{ACCESSIBILITY.PAGE_TITLE}</h1>

            <p className="govuk-body-l">
              {ACCESSIBILITY.INTRO.DESCRIPTION.replace('{serviceName}', ACCESSIBILITY.SERVICE_NAME)}
            </p>

            <p className="govuk-body">
              {ACCESSIBILITY.INTRO.RUN_BY}
            </p>

            <p className="govuk-body">
              {ACCESSIBILITY.INTRO.CAPABILITIES_INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {ACCESSIBILITY.INTRO.CAPABILITIES.map((capability, index) => (
                <li key={index}>{capability}</li>
              ))}
            </ul>

            <p className="govuk-body">
              {ACCESSIBILITY.INTRO.TEXT_SIMPLICITY}
            </p>

            <p className="govuk-body">
              <a href={ACCESSIBILITY.INTRO.ABILITY_NET_LINK} className="govuk-link" target="_blank" rel="noopener noreferrer">
                AbilityNet
              </a> {ACCESSIBILITY.INTRO.ABILITY_NET_TEXT}
            </p>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.HOW_ACCESSIBLE}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.NOT_ACCESSIBLE_INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {ACCESSIBILITY.CONTENT.NOT_ACCESSIBLE_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.FEEDBACK}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.FEEDBACK_INTRO}
            </p>
            <div className="govuk-inset-text">
              <p className="govuk-body">
                Email: <a href={`mailto:${ACCESSIBILITY.CONTENT.FEEDBACK_EMAIL}`} className="govuk-link">
                  {ACCESSIBILITY.CONTENT.FEEDBACK_EMAIL}
                </a>
              </p>
            </div>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.FEEDBACK_RESPONSE}
            </p>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.REPORTING}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.REPORTING_INTRO}
            </p>
            <div className="govuk-inset-text">
              <p className="govuk-body">
                Email: <a href={`mailto:${ACCESSIBILITY.CONTENT.FEEDBACK_EMAIL}`} className="govuk-link">
                  {ACCESSIBILITY.CONTENT.FEEDBACK_EMAIL}
                </a>
              </p>
            </div>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.ENFORCEMENT}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.ENFORCEMENT_INTRO}
            </p>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.ENFORCEMENT_UNHAPPY}{' '}
              <a href={ACCESSIBILITY.CONTENT.EASS_LINK} className="govuk-link" target="_blank" rel="noopener noreferrer">
                contact the Equality Advisory and Support Service (EASS)
              </a>.
            </p>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.TECHNICAL_INFO}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.TECHNICAL_COMMITMENT}
            </p>

            <h3 className="govuk-heading-m">{ACCESSIBILITY.SECTIONS.COMPLIANCE}</h3>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.COMPLIANCE_STATUS.replace('version 2.1', '')}{' '}
              <a href={ACCESSIBILITY.CONTENT.WCAG_LINK} className="govuk-link" target="_blank" rel="noopener noreferrer">
                Web Content Accessibility Guidelines version 2.1
              </a> AA standard, due to the non-compliances listed below.
            </p>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.NON_ACCESSIBLE}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.NON_COMPLIANCE_INTRO}
            </p>

            <h3 className="govuk-heading-m">{ACCESSIBILITY.SECTIONS.NON_COMPLIANCE}</h3>
            <ul className="govuk-list govuk-list--bullet">
              {ACCESSIBILITY.CONTENT.NON_COMPLIANCE_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.FIX_TIMELINE}
            </p>

            <h3 className="govuk-heading-m">{ACCESSIBILITY.SECTIONS.DISPROPORTIONATE}</h3>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.DISPROPORTIONATE_TEXT}
            </p>

            <h3 className="govuk-heading-m">{ACCESSIBILITY.SECTIONS.OUT_OF_SCOPE}</h3>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.OUT_OF_SCOPE_TEXT}
            </p>

            <h2 className="govuk-heading-l">{ACCESSIBILITY.SECTIONS.PREPARATION}</h2>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.PREPARATION_TEXT
                .replace('{lastUpdated}', ACCESSIBILITY.LAST_UPDATED)
                .replace('{lastUpdated}', ACCESSIBILITY.LAST_UPDATED)}
            </p>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.TESTING_TEXT.replace('{lastTested}', ACCESSIBILITY.LAST_TESTED)}
            </p>
            <p className="govuk-body">
              {ACCESSIBILITY.CONTENT.TESTED_INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {ACCESSIBILITY.CONTENT.TESTED_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <RelatedContent
              links={[
                RELATED_LINKS.PRIVACY,
                RELATED_LINKS.COOKIES,
                RELATED_LINKS.TERMS
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
