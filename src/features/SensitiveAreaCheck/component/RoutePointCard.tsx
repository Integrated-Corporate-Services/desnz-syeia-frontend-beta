import React, { useState } from 'react';
import { RoutePoint } from './SensitiveAreaCheckMap';

interface RoutePointCardProps {
  point: RoutePoint;
  idx: number;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onRemove: () => void;
  onChange: (field: 'easting' | 'northing', value: string) => void;
  onFocus: () => void;
}


function isValidGridValue(val: string) {
  return /^\d{6}$/.test(val) && Number(val) >= 1 && Number(val) <= 999999;
}


const RoutePointCard: React.FC<RoutePointCardProps> = ({
  point,
  idx,
  onAddBefore,
  onAddAfter,
  onRemove,
  onChange,
  onFocus,
}) => {
  const [eastingTouched, setEastingTouched] = useState(false);
  const [northingTouched, setNorthingTouched] = useState(false);
  const eastingValid = isValidGridValue(point.easting);
  const northingValid = isValidGridValue(point.northing);
  const showError = (!eastingValid && eastingTouched) || (!northingValid && northingTouched);

  return (
    <div className="govuk-summary-card">
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title">Point {idx + 1}</h2>
        <ul className="govuk-summary-card__actions">
          <li className="govuk-summary-card__action">
            <a href="#" className="govuk-link" onClick={e => { e.preventDefault(); onAddBefore(); }}>Add before</a>
          </li>
          <li className="govuk-summary-card__action">
            <a href="#" className="govuk-link" onClick={e => { e.preventDefault(); onAddAfter(); }}>Add after</a>
          </li>
          <li className="govuk-summary-card__action">
            <a href="#" className="govuk-link" onClick={e => { e.preventDefault(); onRemove(); }}>Remove</a>
          </li>
        </ul>
      </div>
      <div className="govuk-summary-card__content">
        {showError && (
          <div className="govuk-error-summary govuk-!-margin-bottom-2" role="alert">
            <strong>You must enter exactly 6 numbers</strong>
          </div>
        )}
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-quarter">
                <div className={`govuk-form-group govuk-!-static-margin-bottom-0${!eastingValid && eastingTouched ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`easting-input-${idx}`}>Easting</label>
                  <input
                    className={`govuk-input${!eastingValid && eastingTouched ? ' govuk-input--error' : ''}`}
                    id={`easting-input-${idx}`}
                    name={`easting-${idx}`}
                    type="text"
                    value={point.easting}
                    onChange={e => onChange('easting', e.target.value)}
                    onFocus={onFocus}
                    onBlur={() => setEastingTouched(true)}
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter govuk-!-static-margin-bottom-0">
                <div className={`govuk-form-group${!northingValid && northingTouched ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`northing-input-${idx}`}>Northing</label>
                  <input
                    className={`govuk-input${!northingValid && northingTouched ? ' govuk-input--error' : ''}`}
                    id={`northing-input-${idx}`}
                    name={`northing-${idx}`}
                    type="text"
                    value={point.northing}
                    onChange={e => onChange('northing', e.target.value)}
                    onFocus={onFocus}
                    onBlur={() => setNorthingTouched(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default RoutePointCard;
