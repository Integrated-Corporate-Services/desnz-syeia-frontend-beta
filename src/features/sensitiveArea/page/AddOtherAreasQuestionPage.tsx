import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

const AddOtherAreasQuestionPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer === 'yes') navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/add-areas`);
    else navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/poles`);
  };

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl">Do you want to add other sensitive areas?</h1>
      <form onSubmit={handleSubmit}>
        <fieldset className="govuk-fieldset">
          <div className="govuk-radios">
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="add-yes" name="add" type="radio" value="yes" onChange={() => setAnswer('yes')} />
              <label className="govuk-label govuk-radios__label" htmlFor="add-yes">Yes</label>
            </div>
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="add-no" name="add" type="radio" value="no" onChange={() => setAnswer('no')} />
              <label className="govuk-label govuk-radios__label" htmlFor="add-no">No</label>
            </div>
          </div>
        </fieldset>
        <div className="govuk-!-margin-top-4">
          <button className="govuk-button" type="submit">Save and continue</button>
        </div>
      </form>
    </div>
  );
};

export default AddOtherAreasQuestionPage;
