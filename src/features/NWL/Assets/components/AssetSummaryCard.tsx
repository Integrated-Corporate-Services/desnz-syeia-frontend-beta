import React from 'react';
import type { ParsedLineType } from '../types';
import type { AssetDetails } from '../../../../hooks/useAssets';
import { LABELS } from '../constants';

interface AssetSummaryCardProps {
  asset: AssetDetails;
  index: number;
  onRemove: (assetId: string) => void;
  onChange: (assetId: string) => void;
}

export const AssetSummaryCard: React.FC<AssetSummaryCardProps> = ({
  asset,
  index,
  onRemove,
  onChange,
}) => {
  const parseLineTypes = (typeOfLine: string): ParsedLineType[] => {
    if (!typeOfLine) return [];
    
    const entries = typeOfLine.split('\n\n').filter(entry => entry.trim());
    
    return entries.map(entry => {
      const colonIndex = entry.indexOf(':');
      if (colonIndex === -1) return { label: entry, description: '' };
      
      return {
        label: entry.substring(0, colonIndex).trim(),
        description: entry.substring(colonIndex + 1).trim()
      };
    });
  };

  const formatVoltage = (voltage: any): string => {
    if (typeof voltage === 'string') return voltage;
    if (Array.isArray(voltage)) return voltage.join(', ');
    if (voltage && typeof voltage === 'object' && 'code' in voltage) return voltage.code;
    return '-';
  };

  const lineTypes = parseLineTypes(asset.typeOfLine || '');

  return (
    <div className="govuk-summary-card" style={{ marginBottom: '30px' }}>
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title">
          {LABELS.ASSET} {index + 1}
        </h2>
        <ul className="govuk-summary-card__actions">
          <li className="govuk-summary-card__action">
            <a
              href="#"
              className="govuk-link"
              onClick={(e) => {
                e.preventDefault();
                onRemove(asset.assetId);
              }}
            >
              {LABELS.REMOVE}
            </a>
          </li>
          <li className="govuk-summary-card__action">
            <a
              href="#"
              className="govuk-link"
              onClick={(e) => {
                e.preventDefault();
                onChange(asset.assetId);
              }}
            >
              {LABELS.CHANGE}
            </a>
          </li>
        </ul>
      </div>
      
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              {LABELS.LINE_VOLTAGE}
            </dt>
            <dd className="govuk-summary-list__value">{formatVoltage(asset.lineVoltage)}</dd>
          </div>

          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              Line types
            </dt>
            <dd className="govuk-summary-list__value">
              {lineTypes.length > 0 ? (
                <ul className="govuk-list">
                  {lineTypes.map((lt, idx) => (
                    <li key={idx}>{lt.label}</li>
                  ))}
                </ul>
              ) : (
                '-'
              )}
            </dd>
          </div>

          {lineTypes.length > 0 && lineTypes.some(lt => lt.description) && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                {LABELS.COMMENTS}
              </dt>
              <dd className="govuk-summary-list__value">
                {lineTypes.map((lt, idx) => (
                  lt.description && (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <strong>{lt.label}:</strong> {lt.description}
                    </div>
                  )
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};
