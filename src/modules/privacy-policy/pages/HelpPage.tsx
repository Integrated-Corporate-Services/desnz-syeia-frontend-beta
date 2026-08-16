import { PageFeedback, RelatedContent } from '../components';
import { HELP, RELATED_LINKS } from '../constants';
import PageTitle from '../../../components/PageTitle';

export function HelpPage() {
  return (
    <div className="govuk-width-container">
      <PageTitle title="Help" />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{HELP.PAGE_TITLE}</h1>

            <p className="govuk-body-l">
              {HELP.INTRO}
            </p>

            <h2 className="govuk-heading-l">{HELP.SECTIONS.GETTING_STARTED}</h2>
            <p className="govuk-body">
              {HELP.GETTING_STARTED.INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {HELP.GETTING_STARTED.ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-l">{HELP.SECTIONS.TECHNICAL_REQUIREMENTS}</h2>
            <p className="govuk-body">
              {HELP.TECHNICAL_REQUIREMENTS.INTRO}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {HELP.TECHNICAL_REQUIREMENTS.BROWSERS.map((browser, index) => (
                <li key={index}>{browser}</li>
              ))}
            </ul>
            <p className="govuk-body">
              {HELP.TECHNICAL_REQUIREMENTS.JAVASCRIPT}
            </p>

            <h2 className="govuk-heading-l">{HELP.SECTIONS.COMMON_QUESTIONS}</h2>

            <h3 className="govuk-heading-m">{HELP.QUESTIONS.ACCOUNT.QUESTION}</h3>
            <p className="govuk-body">
              {HELP.QUESTIONS.ACCOUNT.ANSWER}
            </p>

            <h3 className="govuk-heading-m">{HELP.QUESTIONS.SUBMIT.QUESTION}</h3>
            <p className="govuk-body">
              {HELP.QUESTIONS.SUBMIT.ANSWER}
            </p>

            <h3 className="govuk-heading-m">{HELP.QUESTIONS.DOCUMENTS.QUESTION}</h3>
            <p className="govuk-body">
              {HELP.QUESTIONS.DOCUMENTS.ANSWER}
            </p>

            <h3 className="govuk-heading-m">{HELP.QUESTIONS.TIMELINE.QUESTION}</h3>
            <p className="govuk-body">
              {HELP.QUESTIONS.TIMELINE.ANSWER}
            </p>

            <RelatedContent
              links={[
                RELATED_LINKS.CONTACT,
                RELATED_LINKS.ACCESSIBILITY,
                RELATED_LINKS.PRIVACY
              ]}
            />

            <PageFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
