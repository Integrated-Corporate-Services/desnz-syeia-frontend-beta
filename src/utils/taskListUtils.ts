import { S37_BASE_URL } from '../constants/s37';

export type TaskListSection = {
  title: string;
  items: { name: string; status: string; link: string }[];
};

export function getInitialSections(applicationId?: string): TaskListSection[] {
  const base = applicationId ? `${S37_BASE_URL}/${applicationId}` : `${S37_BASE_URL}/:applicationId`;
  return [
    {
      title: 'Applicant details',
      items: [
        { name: 'Network operator details', status: 'Completed', link: `${base}/network-operator-details` },
        { name: 'Network operator contact details', status: 'Completed', link: `${base}/network-operator-contact-details` },
      ],
    },
    {
      title: 'Project details',
      items: [
        { name: 'Project overview', status: 'Incomplete', link: `${base}/project-overview` },
        { name: 'Asset information', status: 'Incomplete', link: `${base}/asset-information` },
      ],
    },
    {
      title: 'Location',
      items: [
        { name: 'Route', status: 'Incomplete', link: `${base}/route-overview` },
        { name: 'Works overview', status: 'Incomplete', link: `${base}/works-overview` },
        { name: 'Sensitive area checks', status: 'Cannot start yet', link: `${base}/sensitive-area-check` },
        { name: 'Sensitive area review', status: 'Cannot start yet', link: `${base}/sensitive-area-review` },
        { name: 'Parishes', status: 'Incomplete', link: `${base}/parishes` },
      ],
    },
    {
      title: 'Supporting information',
      items: [
        { name: 'Supporting questions', status: 'Incomplete', link: `${base}/supporting-info` },
        { name: 'EIA fees', status: 'Incomplete', link: `${base}/eia-fees` },
      ],
    },
    {
      title: 'Consultations',
      items: [
        { name: 'Consultations', status: 'Cannot start yet', link: `${base}/consultation-details` },
        { name: 'Post consultation actions', status: 'Cannot start yet', link: `${base}/post-consultation-actions` },
      ],
    },
    {
      title: 'Review and submit',
      items: [
        { name: 'Check your answers', status: 'Incomplete', link: `${base}/application-submit` },
        { name: 'Submit application', status: '', link: `${base}/submit-application` },
      ],
    },
  ];
}

export function updateSectionStatus(
  sections: TaskListSection[],
  sectionIdx: number,
  itemIdx: number,
  newStatus: string
): TaskListSection[] {
  return sections.map((section, sIdx) =>
    sIdx === sectionIdx
      ? {
          ...section,
          items: section.items.map((item, iIdx) =>
            iIdx === itemIdx ? { ...item, status: newStatus } : item
          ),
        }
      : section
  );
}
