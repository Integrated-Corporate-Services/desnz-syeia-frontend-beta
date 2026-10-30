export interface ProjectOverview {
  projectName: string;
  projectSummary: string;
}

export interface ProjectOverviewResponse {
  details: ProjectOverview;
  canEdit?: boolean;
}
