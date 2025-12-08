import React from "react";
import { Link, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";

const CheckYourAnswers: React.FC = () => {
  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();
  const [expandedSections, setExpandedSections] = React.useState<boolean[]>([false, true, false, false, false, false]);
  // Helper to determine if all sections are expanded
  const allExpanded = expandedSections.every(Boolean);
  const handleToggleAll = () => {
    setExpandedSections(Array(6).fill(!allExpanded));
  };
  const handleToggle = (idx: number) => {
    setExpandedSections(prev => prev.map((exp, i) => i === idx ? !exp : exp));
  };
  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
              <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item" aria-current="false">
                  <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/task-list`}>
                    Task list
                  </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="true">
                  Submit Section 37 application
                </li>
              </ol>
            </nav>
            <h1 className="govuk-heading-xl" style={{ marginBottom: "0.5em" }}>
              Check your answers before submitting your Section 37 application
            </h1>
            <div
              className="govuk-accordion"
              data-module="govuk-accordion"
              id={applicationId}
              data-remember-expanded="true"
              data-govuk-accordion-init=""
            >
              <div className="govuk-accordion__controls" style={{ marginBottom: "1em" }}>
        <button
          type="button"
          className="govuk-accordion__show-all"
          aria-label={allExpanded ? "Hide all sections" : "Show all sections"}
          onClick={handleToggleAll}
        >
          <span className="govuk-accordion-nav__chevron"></span>
          {allExpanded ? "Hide all sections" : "Show all sections"}
        </button>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
              </div>
                  {/* Accordion Section: Application documents */}
                  <div className={`govuk-accordion__section${expandedSections[0] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-1`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[0]}
                          aria-label={`Application documents , ${expandedSections[0] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(0)}
                          style={{ border: "none", fontWeight: "bold" }}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-1`}>
                            <span className="govuk-accordion__section-heading-text-focus">Application documents</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[0] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[0] && (
                      <div id={`${applicationId}-content-1`} className="govuk-accordion__section-content">
                        {/* Project overview summary card */}
                        <div className="govuk-summary-card" id="application-documents-project-details">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Project overview</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Plan information documents</dt>
                                <dd className="govuk-summary-list__value">
                                  <ul className="govuk-list"></ul>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Accordion Section: Applicant details */}
                  <div className={`govuk-accordion__section${expandedSections[1] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-2`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[1]}
                          aria-label={`Applicant details , ${expandedSections[1] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(1)}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-2`}>
                            <span className="govuk-accordion__section-heading-text-focus">Applicant details</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[1] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[1] && (
                      <div id={`${applicationId}-content-2`} className="govuk-accordion__section-content">
                        {/* Network operator details summary card */}
                        <div className="govuk-summary-card" id="network-operator-details">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Network operator details</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Reference</dt>
                                <dd className="govuk-summary-list__value">1</dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Network operator contact</dt>
                                <dd className="govuk-summary-list__value">Section 37 Consent Npower User</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                        {/* Network operator contact details summary card */}
                        <div className="govuk-summary-card" id="network-operator-contact-details">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Network operator contact details</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Name</dt>
                                <dd className="govuk-summary-list__value">Section 37 Consent Npower User</dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Address</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Email address</dt>
                                <dd className="govuk-summary-list__value">
                                  <a href="mailto:s37_user.npower@eip.co.uk" className="govuk-link">s37_user.npower@eip.co.uk</a>
                                </dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Phone number</dt>
                                <dd className="govuk-summary-list__value">Work Tel n/a</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Accordion Section: Project details */}
                  <div className={`govuk-accordion__section${expandedSections[2] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-3`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[2]}
                          aria-label={`Project details , ${expandedSections[2] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(2)}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-3`}>
                            <span className="govuk-accordion__section-heading-text-focus">Project details</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[2] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[2] && (
                      <div id={`${applicationId}-content-3`} className="govuk-accordion__section-content">
                        {/* Project overview summary card */}
                        <div className="govuk-summary-card" id="project-overview">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Project overview</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Project name</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Project description</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Tallest pole height</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Plan reference</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Plan information documents</dt>
                                <dd className="govuk-summary-list__value">
                                  <ul className="govuk-list"></ul>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                        {/* Asset details summary card */}
                        <div className="govuk-summary-card" id="asset-information">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Asset information</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Standard specification reference number</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Line voltage</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Line length</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Are you adding or replacing poles?</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Are you adding or replacing overhead lines?</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Are you removing any existing equipment as part of this project?</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Are the works to be carried out on an existing asset?</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">General comments</dt>
                                <dd className="govuk-summary-list__value"></dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Accordion Section: Location */}
                  <div className={`govuk-accordion__section${expandedSections[3] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-4`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[3]}
                          aria-label={`Location , ${expandedSections[3] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(3)}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-4`}>
                            <span className="govuk-accordion__section-heading-text-focus">Location</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[3] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[3] && (
                      <div id={`${applicationId}-content-4`} className="govuk-accordion__section-content">
                        {/* Route summary card */}
                        <h3 className="govuk-heading-s">Routes</h3>
                        <div className="govuk-inset-text">
                          Maps can't be shown in Internet Explorer. Use a different web browser to view the route map.
                        </div>
                        <div className="govuk-summary-card" id="route-1-summary">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Route A</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <table className="govuk-table">
                                <thead className="govuk-table__head">
                                  <tr className="govuk-table__row">
                                    <th className="govuk-table__header">Easting</th>
                                    <th className="govuk-table__header">Northing</th>
                                  </tr>
                                </thead>
                                <tbody className="govuk-table__body">
                                  <tr className="govuk-table__row">
                                    <td className="govuk-table__cell">425209</td>
                                    <td className="govuk-table__cell">110283</td>
                                  </tr>
                                  <tr className="govuk-table__row">
                                    <td className="govuk-table__cell">425103</td>
                                    <td className="govuk-table__cell">110092</td>
                                  </tr>
                                </tbody>
                              </table>
                            </dl>
                          </div>
                        </div>
                        {/* Sensitive area check summary card */}
                        <div className="govuk-summary-card" id="sensitiveAreaCheck">
                          <div className="govuk-summary-card__title-wrapper">
                            <h2 className="govuk-summary-card__title">Sensitive area check</h2>
                          </div>
                          <div className="govuk-summary-card__content">
                            <dl className="govuk-summary-list">
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Tolerance required</dt>
                                <dd className="govuk-summary-list__value">No</dd>
                              </div>
                              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                                <dt className="govuk-summary-list__key">Sensitive areas the route passes through</dt>
                                <dd className="govuk-summary-list__value">
                                  <ul className="govuk-list govuk-list--bullet">
                                    <li>National Parks (England)</li>
                                    <li>Ramsar (England)</li>
                                    <li>Sites of Special Scientific Interest (England)</li>
                                    <li>Special Areas of Conservation (England)</li>
                                    <li>Special Protection Areas (England)</li>
                                    <li>SSSI Impact Risk Zones (England)</li>
                                  </ul>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Accordion Section: Supporting information */}
                  <div className={`govuk-accordion__section${expandedSections[4] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-5`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[4]}
                          aria-label={`Supporting information , ${expandedSections[4] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(4)}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-5`}>
                            <span className="govuk-accordion__section-heading-text-focus">Supporting information</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[4] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[4] && (
                      <div id={`${applicationId}-content-5`} className="govuk-accordion__section-content">
                        <div className="govuk-inset-text">
                          No supporting information has been submitted to this application
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Accordion Section: Further information */}
                  <div className={`govuk-accordion__section${expandedSections[5] ? " govuk-accordion__section--expanded" : ""}`}>
                    <div className="govuk-accordion__section-header">
                      <h2 className="govuk-accordion__section-heading">
                        <button
                          type="button"
                          aria-controls={`${applicationId}-content-6`}
                          className="govuk-accordion__section-button"
                          aria-expanded={expandedSections[5]}
                          aria-label={`Further information , ${expandedSections[5] ? "Hide" : "Show"} this section`}
                          onClick={() => handleToggle(5)}
                        >
                          <span className="govuk-accordion__section-heading-text" id={`${applicationId}-heading-6`}>
                            <span className="govuk-accordion__section-heading-text-focus">Further information</span>
                          </span>
                          <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span>
                          <span className="govuk-accordion__section-toggle" data-nosnippet="">
                            <span className="govuk-accordion__section-toggle-focus">
                              <span className="govuk-accordion-nav__chevron"></span>
                              <span className="govuk-accordion__section-toggle-text">{expandedSections[5] ? "Hide" : "Show"}</span>
                            </span>
                          </span>
                        </button>
                      </h2>
                    </div>
                    {expandedSections[5] && (
                      <div id={`${applicationId}-content-6`} className="govuk-accordion__section-content">
                        <div className="govuk-inset-text">
                          No further information has been submitted to this application
                        </div>
                      </div>
                    )}
                  </div>
            </div>
            <form action={`${S37_BASE_URL}/submit`} method="post" data-module="fds-html-form">
              <p className="govuk-body">
                <Link className="govuk-link" to={`${S37_BASE_URL}/task-list`}>
                  Back to task list
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckYourAnswers;
