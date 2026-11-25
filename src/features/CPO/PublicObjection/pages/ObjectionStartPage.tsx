import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTION_GUIDANCE_URL } from '../constants/objectionContent';

const HEADING = 'Submit or withdraw an objection to a CPO';

/** SYEIA-2923: start page of the public CPO objection service. */
const ObjectionStartPage: React.FC = () => (
  <>
    <PageTitle title={HEADING} />
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl govuk-!-margin-top-6">{HEADING}</h1>
        <p className="govuk-body">
          Use this service to object to a compulsory purchase order (CPO) made by an electricity or gas license holder,
          in accordance with the Electricity Act 1989, the Gas Act 1986 and the Acquisition of Land Act 1981.
        </p>
        <p className="govuk-body">
          You can also withdraw any objections you submitted using this service before the CPO objection period ends.
        </p>
        <p className="govuk-body">You can submit an objection for:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>yourself</li>
          <li>an organisation you own or work for</li>
          <li>a person, group or organisation that you represent as, for example, their solicitor, land agent or family member</li>
        </ul>
        <p className="govuk-body">
          If more than one person or organisation has the same objection, you can submit the objections together.
          If the objections are different, you must submit them separately.
        </p>

        <h2 className="govuk-heading-m">Before you start</h2>
        <p className="govuk-body">You will need:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>the CPO reference number found on the public notice, for example CPO000001</li>
          <li>an email address you have access to, so we can send you a security code</li>
          <li>your postal address for official letters</li>
          <li>the name of each person or organisation making the objection</li>
          <li>full details of the objection</li>
        </ul>
        <p className="govuk-body">You must submit objections before the deadline published on the public notice.</p>

        <Link to={OBJECTION_ROUTES.REFERENCE} role="button" draggable="false" className="govuk-button govuk-button--start" data-module="govuk-button">
          Start now
          <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
          </svg>
        </Link>

        <h2 className="govuk-heading-m">What happens to your objection</h2>
        <p className="govuk-body">
          We will share your objection with the company that made the order, including your personal details and the names of all objectors.
        </p>
        <p className="govuk-body">
          <a className="govuk-link" href={OBJECTION_GUIDANCE_URL} target="_blank" rel="noreferrer noopener">
            Read more about the compulsory purchase process (opens in a new tab)
          </a>
        </p>

        <h2 className="govuk-heading-m">Other ways to object</h2>
        <p className="govuk-body">You can also object by writing to us at the address on the public notice.</p>
      </div>
    </div>
  </>
);

export default ObjectionStartPage;
