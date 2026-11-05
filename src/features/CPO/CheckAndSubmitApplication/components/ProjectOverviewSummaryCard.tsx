import React from 'react';
import { PROJECT_OVERVIEW_COPY } from '../../ProjectOverview/constants/projectOverviewConstants';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { NOT_ANSWERED } from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  projectOverview: CpoAnswers['projectOverview'];
  changeUrl?: string;
}

export const ProjectOverviewSummaryCard: React.FC<Props> = ({ projectOverview, changeUrl }) => (
  <SummaryCard title="Project overview" changeUrl={changeUrl}>
    <SummaryRow label={PROJECT_OVERVIEW_COPY.projectNameLabel}>
      {projectOverview.projectName || NOT_ANSWERED}
    </SummaryRow>
    <SummaryRow label={PROJECT_OVERVIEW_COPY.projectSummaryLabel}>
      {projectOverview.projectSummary || NOT_ANSWERED}
    </SummaryRow>
  </SummaryCard>
);

export default ProjectOverviewSummaryCard;
