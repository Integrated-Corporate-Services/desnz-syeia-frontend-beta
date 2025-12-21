import React from "react";
import { Parish } from "../types/Parish";

interface ParishesTableProps {
  parishes: Parish[];
  onRemove: (e: React.MouseEvent<HTMLAnchorElement>, parishId: string) => void;
}

const ParishesTable: React.FC<ParishesTableProps> = ({ parishes, onRemove }) => {
  return (
    <table className="govuk-table" id="parishes-table">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th className="govuk-table__header govuk-!-width-three-quarters" scope="col">
            Parishes
          </th>
          <th className="govuk-table__header" scope="col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {parishes.length > 0 ? (
          parishes.map((parish) => (
            <tr className="govuk-table__row" key={parish.id}>
              <td className="govuk-table__cell">{parish.name}</td>
              <td className="govuk-table__cell govuk-table__cell--actions">
                <a
                  href="#"
                  onClick={(e) => onRemove(e, parish.id)}
                  className="govuk-link"
                >
                  Remove<span className="govuk-visually-hidden"> {parish.name}</span>
                </a>
              </td>
            </tr>
          ))
        ) : (
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" colSpan={2}>
              <div className="govuk-inset-text">
                No items have been added yet.
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ParishesTable;
