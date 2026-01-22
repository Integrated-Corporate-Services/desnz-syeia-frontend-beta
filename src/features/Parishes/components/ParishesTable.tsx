import React from "react";
import { Parish } from "../types/Parish";

interface ParishesTableProps {
  parishes: Parish[];
  onRemove: (e: React.MouseEvent<HTMLAnchorElement>, parishId: string) => void;
}

const ParishesTable: React.FC<ParishesTableProps> = ({
  parishes,
  onRemove,
}) => {
  if (parishes.length === 0) {
    return (
      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        No items have been added yet.
      </div>
    );
  }

  return (
    <table className="govuk-table govuk-!-margin-bottom-6" id="parishes-table">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th
            className="govuk-table__header govuk-!-width-three-quarters"
            scope="col"
          >
            Parishes
          </th>
          <th className="govuk-table__header" scope="col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {parishes.map((parish) => (
          <tr className="govuk-table__row" key={parish.id}>
            <td className="govuk-table__cell">{parish.name}</td>
            <td className="govuk-table__cell govuk-table__cell--actions">
              <a
                href="#"
                onClick={(e) => onRemove(e, parish.id)}
                className="govuk-link"
              >
                Remove
                <span className="govuk-visually-hidden"> {parish.name}</span>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ParishesTable;
