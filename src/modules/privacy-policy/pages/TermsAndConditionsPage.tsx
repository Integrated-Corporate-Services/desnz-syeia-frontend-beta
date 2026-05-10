import { PageFeedback, RelatedContent } from '../components';
import { TERMS, RELATED_LINKS } from '../constants';

export function TermsAndConditionsPage() {
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{TERMS.PAGE_TITLE}</h1>

            <p className="govuk-body-l">
              {TERMS.INTRO}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.GENERAL}</h2>
            <p className="govuk-body">
              {TERMS.GENERAL.OPERATOR}
            </p>
            <p className="govuk-body">
              {TERMS.GENERAL.APPLIES}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.RESPONSIBLE_USE}</h2>
            <p className="govuk-body">
              {TERMS.RESPONSIBLE_USE.INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {TERMS.RESPONSIBLE_USE.ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.INFORMATION_SUBMIT}</h2>
            <p className="govuk-body">
              {TERMS.INFORMATION_SUBMIT.INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {TERMS.INFORMATION_SUBMIT.ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.ACCURACY}</h2>
            <p className="govuk-body">
              {TERMS.ACCURACY.TEXT}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.AVAILABILITY}</h2>
            <p className="govuk-body">
              {TERMS.AVAILABILITY.AIM}
            </p>
            <p className="govuk-body">
              {TERMS.AVAILABILITY.SUSPEND}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.LINKING_TO}</h2>
            <p className="govuk-body">
              {TERMS.LINKING_TO.TEXT}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.LINKING_FROM}</h2>
            <p className="govuk-body">
              {TERMS.LINKING_FROM.TEXT}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.VIRUS_PROTECTION}</h2>
            <p className="govuk-body">
              {TERMS.VIRUS_PROTECTION.EFFORT}
            </p>
            <p className="govuk-body">
              {TERMS.VIRUS_PROTECTION.USER_RESPONSIBILITY}
            </p>
            <p className="govuk-body">
              {TERMS.VIRUS_PROTECTION.NO_LIABILITY}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.LIABILITY}</h2>
            <p className="govuk-body">
              {TERMS.LIABILITY.NO_LIABILITY}
            </p>
            <p className="govuk-body">
              {TERMS.LIABILITY.INCLUDES}
            </p>
            <p className="govuk-body">
              {TERMS.LIABILITY.EXCLUSIONS}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.GOVERNING_LAW}</h2>
            <p className="govuk-body">
              {TERMS.GOVERNING_LAW.LAW}
            </p>
            <p className="govuk-body">
              {TERMS.GOVERNING_LAW.JURISDICTION}
            </p>

            <h2 className="govuk-heading-l">{TERMS.SECTIONS.CHANGES}</h2>
            <p className="govuk-body">
              {TERMS.CHANGES.TEXT}
            </p>

            <RelatedContent
              links={[
                RELATED_LINKS.PRIVACY,
                RELATED_LINKS.COOKIES,
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
