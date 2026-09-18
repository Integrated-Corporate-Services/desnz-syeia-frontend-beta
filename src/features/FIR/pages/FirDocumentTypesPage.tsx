import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirErrorSummary, FirRequestDetails } from '../components';
import { FIR_CATEGORY_GROUPS, FIR_CATEGORY_LABELS, FIR_MESSAGES } from '../constants/fir.constants';
import { useFirRequest, useFirRoute, useFirSelectedCategories } from '../hooks';

export const FirDocumentTypesPage: React.FC = () => {
  const { applicationId, requestId, requestPath } = useFirRoute();
  const { request, error, setError } = useFirRequest(applicationId, requestId);
  const navigate = useNavigate();
  const { selectedCategories: selected, saveSelectedCategories } = useFirSelectedCategories(applicationId, requestId);

  if (!applicationId || !requestId) return null;

  const categoryGroups = FIR_CATEGORY_GROUPS
    .map((group) => ({
      ...group,
      categories: group.categories.filter((category) => request?.requestedDocumentCategories.includes(category)),
    }))
    .filter((group) => group.categories.length > 0);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected.length) {
      setError(FIR_MESSAGES.DOCUMENT_TYPE_REQUIRED);
      return;
    }
    saveSelectedCategories(selected);
    navigate(`${requestPath}/${requestId}/provide-documents`);
  };

  return (
    <div className="govuk-width-container">
      <Link className="govuk-back-link" to={`${requestPath}/${requestId}/upload-decision`}>Back</Link>
      <FirErrorSummary error={error} />
      {request && (
        <form onSubmit={submit} noValidate>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h1 className="govuk-fieldset__heading">Select the type of documents you will provide</h1>
            </legend>
            <p className="govuk-hint">You can select more than one type of document.</p>
            {categoryGroups.map((group) => (
              <div className="govuk-checkboxes govuk-!-margin-bottom-5" key={group.heading || 's37'}>
                {group.heading && <h2 className="govuk-heading-m">{group.heading}</h2>}
                {group.categories.map((category) => (
                  <div className="govuk-checkboxes__item" key={category}>
                    <input className="govuk-checkboxes__input" id={category} type="checkbox" checked={selected.includes(category)} onChange={() => saveSelectedCategories(selected.includes(category) ? selected.filter((item) => item !== category) : [...selected, category])} />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor={category}>{FIR_CATEGORY_LABELS[category] || category}</label>
                  </div>
                ))}
              </div>
            ))}
          </fieldset>
          <button className="govuk-button govuk-!-margin-top-5" type="submit">Save and continue</button>
        </form>
      )}
      {request && <FirRequestDetails request={request} />}
    </div>
  );
};
