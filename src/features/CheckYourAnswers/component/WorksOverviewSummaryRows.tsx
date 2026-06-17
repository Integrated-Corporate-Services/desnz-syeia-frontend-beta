import React from 'react';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { WORKS_OVERVIEW_QUESTIONS } from '../constants/applicationSummaryLabels';
import { isNo, isYes } from '../utils/normalizeWorksOverview';
import { WorksOverview, WorksOverviewDocument } from './ApplicationSubmit.types';

const yesNoValue = (value: unknown) => {
  if (isYes(value)) return 'Yes';
  if (isNo(value)) return 'No';
  return '-';
};

const getDocumentsByCategories = (
  documents: WorksOverviewDocument[] | undefined,
  categories: string[],
) => (documents ?? []).filter((doc) => doc.category && categories.includes(doc.category));

const getDocumentDownloadKey = (doc: WorksOverviewDocument) =>
  doc.s3_key || doc.s3Key || doc.file_id || doc.fileId;

const WorksOverviewDocumentList: React.FC<{ documents: WorksOverviewDocument[] }> = ({ documents }) => (
  <ul className="govuk-list">
    {documents.length > 0 ? (
      documents.map((doc) => {
        const key = getDocumentDownloadKey(doc);
        const docKey = doc.document_id || doc.documentId || key || doc.title;
        return (
          <li key={docKey}>
            {key ? (
              <a
                href="#"
                className="govuk-link"
                onClick={async (e) => {
                  e.preventDefault();
                  await downloadS3FileOnSameTab(key);
                }}
              >
                {doc.title || doc.filename || 'Document'}
              </a>
            ) : (
              doc.title || doc.filename || 'Document'
            )}
          </li>
        );
      })
    ) : (
      <li>-</li>
    )}
  </ul>
);

interface WorksOverviewSummaryRowsProps {
  worksOverview: WorksOverview | null;
}

const WorksOverviewSummaryRows: React.FC<WorksOverviewSummaryRowsProps> = ({ worksOverview }) => {
  const documents = worksOverview?.applicationDocuments ?? [];
  const preExistingAccessCategories = [
    FILE_CATEGORIES.WORKS_PRE_EXISTING_ACCESS_ROUTES,
    FILE_CATEGORIES.WORKS_ACCESS_ROUTES,
  ];
  const accessRouteDocuments = isYes(worksOverview?.usingExistingAccessRoutes)
    ? getDocumentsByCategories(documents, preExistingAccessCategories)
    : getDocumentsByCategories(documents, [FILE_CATEGORIES.WORKS_PROPOSED_ACCESS_ROUTES]);
  const roadClosureDocuments = getDocumentsByCategories(documents, [FILE_CATEGORIES.WORKS_ROAD_CLOSURES]);

  return (
    <>
      {/* Poles */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_POLES}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.addingOrReplacingPoles)}</dd>
      </div>
      {isYes(worksOverview?.addingOrReplacingPoles) && (
        <>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.POLE_MATERIAL}</dt>
            <dd className="govuk-summary-list__value">{worksOverview?.poleMaterial || '-'}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.CHEMICAL_TREATMENTS}</dt>
            <dd className="govuk-summary-list__value">{worksOverview?.chemicalTreatments || '-'}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.POLES_ADDED}</dt>
            <dd className="govuk-summary-list__value">
              {typeof worksOverview?.polesAdded === 'number' ? worksOverview.polesAdded : '-'}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.POLES_REPLACED}</dt>
            <dd className="govuk-summary-list__value">
              {typeof worksOverview?.polesReplaced === 'number' ? worksOverview.polesReplaced : '-'}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.TALLEST_NEW_POLE_HEIGHT}</dt>
            <dd className="govuk-summary-list__value">
              {worksOverview?.tallestNewPoleHeight !== undefined && worksOverview?.tallestNewPoleHeight !== null
                ? `${worksOverview.tallestNewPoleHeight} metres`
                : '-'}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.POLE_COMMENTS}</dt>
            <dd className="govuk-summary-list__value">{worksOverview?.poleComments || '-'}</dd>
          </div>
        </>
      )}

      {/* Overhead lines — description only when Yes */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_LINES}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.addingOrReplacingLines)}</dd>
      </div>
      {isYes(worksOverview?.addingOrReplacingLines) && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.OVERHEAD_LINE_DESC}</dt>
          <dd className="govuk-summary-list__value">{worksOverview?.overheadLineDescription || '-'}</dd>
        </div>
      )}

      {/* Standalone — not conditional on overhead lines */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ESTIMATED_DURATION}</dt>
        <dd className="govuk-summary-list__value">{worksOverview?.estimatedDuration || '-'}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.VEHICLES_REQUIRED}</dt>
        <dd className="govuk-summary-list__value">{worksOverview?.vehiclesRequired || '-'}</dd>
      </div>

      {/* Road closures — details + upload only when Yes */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.roadClosuresRequired)}</dd>
      </div>
      {isYes(worksOverview?.roadClosuresRequired) && (
        <>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES_DETAILS}</dt>
            <dd className="govuk-summary-list__value">{worksOverview?.roadClosuresDetails || '-'}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES_DOCUMENTS}</dt>
            <dd className="govuk-summary-list__value">
              <WorksOverviewDocumentList documents={roadClosureDocuments} />
            </dd>
          </div>
        </>
      )}

      {/* Excavation */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.EXCAVATION_REQUIRED}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.excavationRequired)}</dd>
      </div>
      {isYes(worksOverview?.excavationRequired) && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.EXCAVATION_DETAILS}</dt>
          <dd className="govuk-summary-list__value">{worksOverview?.excavationDetails || '-'}</dd>
        </div>
      )}

      {/* Vegetation */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.VEGETATION_CLEARANCE}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.vegetationClearanceRequired)}</dd>
      </div>
      {isYes(worksOverview?.vegetationClearanceRequired) && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.VEGETATION_DETAILS}</dt>
          <dd className="govuk-summary-list__value">{worksOverview?.vegetationClearanceDetails || '-'}</dd>
        </div>
      )}

      {/* Access routes — details + upload for both Yes and No */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.EXISTING_ACCESS_ROUTES}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.usingExistingAccessRoutes)}</dd>
      </div>
      {(isYes(worksOverview?.usingExistingAccessRoutes) || isNo(worksOverview?.usingExistingAccessRoutes)) && (
        <>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              {isYes(worksOverview?.usingExistingAccessRoutes)
                ? WORKS_OVERVIEW_QUESTIONS.ACCESS_ROUTES_DETAILS
                : WORKS_OVERVIEW_QUESTIONS.PROPOSED_ACCESS_ROUTES_DETAILS}
            </dt>
            <dd className="govuk-summary-list__value">{worksOverview?.accessRoutesDetails || '-'}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              {isYes(worksOverview?.usingExistingAccessRoutes)
                ? WORKS_OVERVIEW_QUESTIONS.ACCESS_ROUTES_DOCUMENTS
                : WORKS_OVERVIEW_QUESTIONS.PROPOSED_ACCESS_ROUTES_DOCUMENTS}
            </dt>
            <dd className="govuk-summary-list__value">
              <WorksOverviewDocumentList documents={accessRouteDocuments} />
            </dd>
          </div>
        </>
      )}

      {/* Equipment removal */}
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.REMOVING_EQUIPMENT}</dt>
        <dd className="govuk-summary-list__value">{yesNoValue(worksOverview?.removingExistingEquipment)}</dd>
      </div>
      {isYes(worksOverview?.removingExistingEquipment) && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.REMOVAL_DESCRIPTION}</dt>
          <dd className="govuk-summary-list__value">{worksOverview?.removalDescription || '-'}</dd>
        </div>
      )}

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{WORKS_OVERVIEW_QUESTIONS.GENERAL_COMMENTS}</dt>
        <dd className="govuk-summary-list__value">{worksOverview?.generalComments || '-'}</dd>
      </div>
    </>
  );
};

export default WorksOverviewSummaryRows;
