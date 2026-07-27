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

 
  const eastingValid = isValidGridValue(point.easting);
  const northingValid = isValidGridValue(point.northing);
  // Only show error styling if error prop is present (after submit)
  const showEastingError = !!error && !eastingValid;
  const showNorthingError = !!error && !northingValid;

  // Refs for input fields
  const eastingRef = useRef<HTMLInputElement>(null);
  const northingRef = useRef<HTMLInputElement>(null);

  // Track which input was last focused
  const [lastFocused, setLastFocused] = useState<'easting' | 'northing'>();

  // Always focus the last-focused input when selected
  useEffect(() => {
    if (!isSelected) return;
    if (lastFocused === 'northing') {
      northingRef.current?.focus();
    } else if (lastFocused === 'easting') {
      eastingRef.current?.focus();
    }
  }, [isSelected, lastFocused]);
 // Unified onChange handler
  const handleInputChange = (field: 'easting' | 'northing', value: string) => {
    onChange(field, value);
    if (field === 'easting') setEastingTouched(true);
  };
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
                <div className={`govuk-form-group govuk-!-static-margin-bottom-0${showEastingError ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`easting-input-${idx}`}>Easting</label>
                  <input
                    ref={eastingRef}
                    className={`govuk-input${showEastingError ? ' govuk-input--error' : ''}`}
                    id={`easting-input-${idx}`}
                    name={`easting-${idx}`}
                    type="text"
                    value={point.easting}
                    onChange={e => handleInputChange('easting', e.target.value)}
                    onFocus={e => {
                      setLastFocused('easting');
                      onFocus();
                    }}
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter govuk-!-static-margin-bottom-0">
                <div className={`govuk-form-group${showNorthingError ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label" htmlFor={`northing-input-${idx}`}>Northing</label>
                  <input
                    ref={northingRef}
                    className={`govuk-input${showNorthingError ? ' govuk-input--error' : ''}`}
                    id={`northing-input-${idx}`}
                    name={`northing-${idx}`}
                    type="text"
                    value={point.northing}
                    onChange={e => handleInputChange('northing', e.target.value)}
                    onFocus={e => {
                      setLastFocused('northing');
                      onFocus();
                    }}
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
