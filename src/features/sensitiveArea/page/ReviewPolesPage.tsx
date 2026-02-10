import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

enum PoleOption { POLES_WITHIN = 1, ONLY_OVERHEAD = 2, NO_POLES = 3 }

const ReviewPolesPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [option, setOption] = useState<number | null>(null);

  const handleContinue = () => navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/documents`);

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl">Poles and overhead lines</h1>
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Are there poles within the identified sensitive areas or are the lines just overhead?
        </legend>
        <div className="govuk-radios">
          <div className="govuk-radios__item">
            <input className="govuk-radios__input" id="p1" name="poles" type="radio" value="1" onChange={() => setOption(PoleOption.POLES_WITHIN)} />
            <label className="govuk-label govuk-radios__label" htmlFor="p1">There are poles within the sensitive areas</label>
          </div>
          <div className="govuk-radios__item">
            <input className="govuk-radios__input" id="p2" name="poles" type="radio" value="2" onChange={() => setOption(PoleOption.ONLY_OVERHEAD)} />
            <label className="govuk-label govuk-radios__label" htmlFor="p2">All poles are outside the sensitive areas with only overhead lines passing above them</label>
          </div>
          <div className="govuk-radios__item">
            <input className="govuk-radios__input" id="p3" name="poles" type="radio" value="3" onChange={() => setOption(PoleOption.NO_POLES)} />
            <label className="govuk-label govuk-radios__label" htmlFor="p3">No poles are within a sensitive area and no overhead lines pass above them</label>
          </div>
        </div>
      </fieldset>

      <div className="govuk-!-margin-top-4">
        <button className="govuk-button" onClick={handleContinue}>Save and continue</button>
      </div>
    </div>
  );
};

export default ReviewPolesPage;
