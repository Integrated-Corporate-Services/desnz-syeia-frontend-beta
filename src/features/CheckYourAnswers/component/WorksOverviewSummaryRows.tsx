import React from 'react';
import { WORKS_OVERVIEW_LABELS } from '../../../constants/worksOverviewLabels';
import { WorksOverview } from './ApplicationSubmit.types';
import {
  formatHeightMetres,
  formatSummaryNumber,
  formatSummaryValue,
  formatYesNo,
  isYes,
} from '../utils/normalizeWorksOverview';

interface WorksOverviewSummaryRowsProps {
  worksOverview: WorksOverview | null;
}

const WorksOverviewSummaryRows: React.FC<WorksOverviewSummaryRowsProps> = ({
  worksOverview,
}) => (
  <>
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.ADDING_REPLACING_POLES}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.addingOrReplacingPoles)}
      </dd>
    </div>
    {isYes(worksOverview?.addingOrReplacingPoles) && (
      <>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.POLE_MATERIAL}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatSummaryValue(worksOverview?.poleMaterial)}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.CHEMICAL_TREATMENTS}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatSummaryValue(worksOverview?.chemicalTreatments)}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.POLES_ADDED}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatSummaryNumber(worksOverview?.polesAdded)}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.POLES_REPLACED}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatSummaryNumber(worksOverview?.polesReplaced)}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.TALLEST_NEW_POLE_HEIGHT}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatHeightMetres(worksOverview?.tallestNewPoleHeight)}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {WORKS_OVERVIEW_LABELS.POLE_COMMENTS}
          </dt>
          <dd className="govuk-summary-list__value">
            {formatSummaryValue(worksOverview?.poleComments)}
          </dd>
        </div>
      </>
    )}
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.ADDING_REPLACING_LINES}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.addingOrReplacingLines)}
      </dd>
    </div>
    {isYes(worksOverview?.addingOrReplacingLines) && (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {WORKS_OVERVIEW_LABELS.OVERHEAD_LINE_DESCRIPTION}
        </dt>
        <dd className="govuk-summary-list__value">
          {formatSummaryValue(worksOverview?.overheadLineDescription)}
        </dd>
      </div>
    )}
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.ESTIMATED_DURATION}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatSummaryValue(worksOverview?.estimatedDuration)}
      </dd>
    </div>
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.VEHICLES_REQUIRED}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatSummaryValue(worksOverview?.vehiclesRequired)}
      </dd>
    </div>
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.ROAD_CLOSURES}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.roadClosuresRequired)}
      </dd>
    </div>
    {isYes(worksOverview?.roadClosuresRequired) && (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {WORKS_OVERVIEW_LABELS.ROAD_CLOSURES_DETAILS}
        </dt>
        <dd className="govuk-summary-list__value">
          {formatSummaryValue(worksOverview?.roadClosuresDetails)}
        </dd>
      </div>
    )}
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.EXCAVATION_REQUIRED}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.excavationRequired)}
      </dd>
    </div>
    {isYes(worksOverview?.excavationRequired) && (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {WORKS_OVERVIEW_LABELS.EXCAVATION_DETAILS}
        </dt>
        <dd className="govuk-summary-list__value">
          {formatSummaryValue(worksOverview?.excavationDetails)}
        </dd>
      </div>
    )}
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.VEGETATION_CLEARANCE}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.vegetationClearanceRequired)}
      </dd>
    </div>
    {isYes(worksOverview?.vegetationClearanceRequired) && (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {WORKS_OVERVIEW_LABELS.VEGETATION_DETAILS}
        </dt>
        <dd className="govuk-summary-list__value">
          {formatSummaryValue(worksOverview?.vegetationClearanceDetails)}
        </dd>
      </div>
    )}
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">
        {WORKS_OVERVIEW_LABELS.REMOVING_EQUIPMENT}
      </dt>
      <dd className="govuk-summary-list__value">
        {formatYesNo(worksOverview?.removingExistingEquipment)}
      </dd>
    </div>
    {isYes(worksOverview?.removingExistingEquipment) && (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          {WORKS_OVERVIEW_LABELS.REMOVAL_DESCRIPTION}
        </dt>
        <dd className="govuk-summary-list__value">
          {formatSummaryValue(worksOverview?.removalDescription)}
        </dd>
      </div>
    )}
  </>
);

export default WorksOverviewSummaryRows;
