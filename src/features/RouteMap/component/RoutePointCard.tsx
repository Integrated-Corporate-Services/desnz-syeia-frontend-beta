import React, { useState, useRef, useEffect } from 'react';
import { RoutePoint } from '../../../components/SensitiveAreaCheckMap';

interface RoutePointCardProps {
  point: RoutePoint;
  idx: number;
  error?: string;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onRemove: () => void;
  onChange: (field: 'easting' | 'northing', value: string) => void;
  onFocus: () => void;
}


function isValidGridValue(val: string) {
  return /^\d{6}$/.test(val) && Number(val) >= 1 && Number(val) <= 999999;
}


const RoutePointCard: React.FC<RoutePointCardProps & { isSelected?: boolean }> = ({
  point,
  idx,
  error,
  onAddBefore,
  onAddAfter,
  onRemove,
  onChange,
  onFocus,
  isSelected,
}) => {
  const [eastingTouched, setEastingTouched] = useState(false);
  const [northingTouched, setNorthingTouched] = useState(false);
  const eastingValid = isValidGridValue(point.easting);
  const northingValid = isValidGridValue(point.northing);
  const showError = (!eastingValid && eastingTouched) || (!northingValid && northingTouched);

  // Refs for input fields
  const eastingRef = useRef<HTMLInputElement>(null);
  const northingRef = useRef<HTMLInputElement>(null);

  // Focus effect for selected input: keep focus on the last edited field
  useEffect(() => {
    if (!isSelected) return;
    // If northing is being edited, focus northing, else focus easting
    if (document.activeElement === northingRef.current) {
      northingRef.current?.focus();
    } else if (document.activeElement === eastingRef.current) {
      eastingRef.current?.focus();
    }
  }, [isSelected]);

  return (
    <div className={`govuk-summary-card${error ? ' fds-summary-card--error' : ''}`}>
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
        {error && (
          <p className="govuk-error-message fds-summary-list__error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-quarter">
                <div className={`govuk-form-group govuk-!-static-margin-bottom-0${!eastingValid && eastingTouched ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`easting-input-${idx}`}>Easting</label>
                  <input
                    ref={eastingRef}
                    className={`govuk-input${!eastingValid && eastingTouched ? ' govuk-input--error' : ''}`}
                    id={`easting-input-${idx}`}
                    name={`easting-${idx}`}
                    type="text"
                    value={point.easting}
                    onChange={e => onChange('easting', e.target.value)}
                    onFocus={onFocus}
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter govuk-!-static-margin-bottom-0">
                <div className={`govuk-form-group${!northingValid && northingTouched ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`northing-input-${idx}`}>Northing</label>
                  <input
                    ref={northingRef}
                    className={`govuk-input${!northingValid && northingTouched ? ' govuk-input--error' : ''}`}
                    id={`northing-input-${idx}`}
                    name={`northing-${idx}`}
                    type="text"
                    value={point.northing}
                    onChange={e => onChange('northing', e.target.value)}
                    onFocus={onFocus}
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
