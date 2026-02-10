import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

const AddOtherAreasPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [areas, setAreas] = useState<string[]>([]);
  const [text, setText] = useState('');

  const addArea = () => {
    if (!text.trim()) return;
    setAreas(prev => [...prev, text.trim()]);
    setText('');
  };

  const handleContinue = () => navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/poles`);

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl">Add other sensitive areas</h1>
      <p className="govuk-body">Add other sensitive areas that are not automatically detected.</p>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="area-input">Area name or description</label>
        <input id="area-input" className="govuk-input" value={text} onChange={e => setText(e.target.value)} />
        <div style={{ marginTop: '0.5rem' }}>
          <button type="button" className="govuk-button" onClick={addArea}>Add area</button>
        </div>
      </div>

      {areas.length > 0 && (
        <div className="govuk-!-margin-top-3">
          <h2 className="govuk-heading-s">Added areas</h2>
          <ul className="govuk-list govuk-list--bullet">
            {areas.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className="govuk-!-margin-top-4">
        <button className="govuk-button" onClick={handleContinue}>Save and continue</button>
      </div>
    </div>
  );
};

export default AddOtherAreasPage;
