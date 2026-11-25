import React from 'react';
import type { ObjectionAddress } from '../types/objectionJourney';

export const NOT_PROVIDED = 'Not provided';

/** A postal address with one line per part, skipping the optional parts left blank. */
export const AddressLines: React.FC<{ address: ObjectionAddress }> = ({ address }) => {
  const lines = [address.line1, address.line2, address.town, address.county, address.postcode].filter(Boolean);
  return <>{lines.map((line, index) => <React.Fragment key={`${index}-${line}`}>{index > 0 && <br />}{line}</React.Fragment>)}</>;
};

/** Names as a plain GOV.UK list, or "None" when there are none. */
export const NameList: React.FC<{ names: string[] }> = ({ names }) =>
  names.length ? <ul className="govuk-list">{names.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}</ul> : <>None</>;
