
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/useApplicationStore';
import { apiService } from '../services/api-service';
import { SECTIONS, SUBSECTIONS } from '../constants/sections';
import { Link } from 'react-router-dom';

const NetworkOperatorContactDetails = () => {
  const [contactDetailsConfirmed, setContactDetailsConfirmed] = useState('true');
  const navigate = useNavigate();
  const application = useApplicationStore(state => state.application);
 // const party = application?.application_party;
  const parties = application?.application_parties || [];
  const party = parties.find(p => p.party_type === 'Applicant');
  // Handles the form submit for contact details
  const handleContactDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let app = application;
    if (!app || !app.application_id) {
      const newAppData = {
        type: 'S37',
        operator_ref: application?.operator_ref || '',
        project_name: party?.organisation_name || 'Untitled',
        project_desc: '',
        status: 'Draft',
        created_by: '44444444-4444-4444-4444-444444444444',
        role: 'Applicant',
        is_primary: true,
        created_at: new Date().toISOString(),
      };
      app = await useApplicationStore.getState().startApplication(newAppData);
    }
    await useApplicationStore.getState().saveNetworkOperator({
      application_id: app.application_id,
      operator_ref: app.operator_ref,
      organisation_id: party?.organisation_id,
      person_id: party?.person_id,
      contact_id: party?.contact_id,
      role: 'Applicant',
      is_primary: true,
    });
    await apiService.updateApplicationProgress(
      app.application_id,
      SECTIONS.APPLICANT_DETAILS, // section title (must match your task list)
      SUBSECTIONS.NETWORK_OPERATOR_CONTACT_DETAILS, // subsection title (must match your task list)
      true
    );
    navigate(`/task-list?id=${app.application_id}`);
  };

  return (
    <>
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${application?.application_id || ''}`}>Task list</Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="true">Network operator contact details</li>
          </ol>
        </nav>
      </div>
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl">Network operator contact details</h1>

              <div className="govuk-summary-card" id="contact-details-summary">
                <div className="govuk-summary-card__content">
                  <dl className="govuk-summary-list">
                    <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
                      <dt className="govuk-summary-list__key">Name</dt>
                      <dd className="govuk-summary-list__value">{party?.organisation_name || ''}</dd>
                    </div>
                    <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
                      <dt className="govuk-summary-list__key">Address</dt>
                      <dd className="govuk-summary-list__value">
                        {[party?.line1, party?.line2, party?.city, party?.country, party?.postcode].filter(Boolean).join(', ')}
                      </dd>
                    </div>
                    <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
                      <dt className="govuk-summary-list__key">Email address</dt>
                      <dd className="govuk-summary-list__value">
                        {party?.email ? (
                          <a href={`mailto:${party.email}`} className="govuk-link">{party.email}</a>
                        ) : ''}
                      </dd>
                    </div>
                    <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
                      <dt className="govuk-summary-list__key">Phone number</dt>
                      <dd className="govuk-summary-list__value">{party?.phone || ''}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <form method="post" data-module="fds-html-form" onSubmit={handleContactDetailsSubmit}>
                <input type="hidden" name="_csrf" value="UI9xuVoTjzeGRDhenxLGm1f7_va41XQHylwL4S8jWljCJLIGY-4XiW0n6g6rJVpqrT_yozTL05eP5kwq_2gy1RdCbTqmFIZn" />

                <div className="govuk-form-group">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">
                        Are all contacts details available and correct?
                      </h2>
                    </legend>
                    <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios" data-govuk-radios-init="">
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="contactDetailsConfirmed"
                          name="contactDetailsConfirmed"
                          type="radio"
                          value="true"
                          checked={contactDetailsConfirmed === 'true'}
                          onChange={() => setContactDetailsConfirmed('true')}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="contactDetailsConfirmed">
                          Yes
                        </label>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="contactDetailsConfirmed-no"
                          name="contactDetailsConfirmed"
                          type="radio"
                          value="false"
                          aria-controls="contactDetailsConfirmed-no-hidden"
                          aria-expanded={contactDetailsConfirmed === 'false'}
                          checked={contactDetailsConfirmed === 'false'}
                          onChange={() => setContactDetailsConfirmed('false')}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="contactDetailsConfirmed-no">
                          No
                        </label>
                      </div>
                      {contactDetailsConfirmed === 'false' && (
                        <div className="govuk-radios__conditional" id="contactDetailsConfirmed-no-hidden">
                          <p className="govuk-body">
                            If any of the contact details are not correct or missing then the contact person must update their account details on EIP. You will not be allowed to submit the application until all details are provided and correct.
                          </p>
                          <p className="govuk-body">
                            The contact can update their details by logging into their account on EIP and going to the 'Update My Details' link shown in the left hand menu on the workbasket page.
                          </p>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>

                <button
                  type="submit"
                  data-module="govuk-button"
                  className="govuk-button"
                  value="Save and continue"
                  name="Save and continue"
                  data-prevent-double-click="true"
                  data-fds-disable-on-submit="false"
                  data-govuk-button-init=""
                  style={{ backgroundColor: '#00703c', color: '#fff', minWidth: '180px', fontWeight: 700 }}
                >
                  Save and continue
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default NetworkOperatorContactDetails;