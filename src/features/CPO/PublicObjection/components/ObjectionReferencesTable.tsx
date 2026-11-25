import React from 'react';
import type { SubmittedObjection } from '../types/objectionJourney';

/** SYEIA-2934: each objector with their own objection reference. */
const ObjectionReferencesTable: React.FC<{ objections: SubmittedObjection[] }> = ({ objections }) => (
  <table className="govuk-table">
    <caption className="govuk-table__caption govuk-visually-hidden">Objection references</caption>
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        <th scope="col" className="govuk-table__header">Objector</th>
        <th scope="col" className="govuk-table__header">Objection reference</th>
      </tr>
    </thead>
    <tbody className="govuk-table__body">
      {objections.map((objection) => (
        <tr className="govuk-table__row" key={objection.objectionReference}>
          <td className="govuk-table__cell">{objection.objectorName}</td>
          <td className="govuk-table__cell">{objection.objectionReference}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ObjectionReferencesTable;
