export type TaskListSection = {
  title: string;
  items: { name: string; status: string; link: string }[];
};

export function getInitialSections(): TaskListSection[] {
  return [
    {
      title: 'Applicant details',
      items: [
        { name: 'Network operator details', status: 'Completed', link: '/network-operator-details' },
        { name: 'Network operator contact details', status: 'Not completed', link: '/network-operator-contact-details' },
      ],
    },
    {
      title: 'Project details',
      items: [
        { name: 'Project overview', status: 'Not completed', link: '/project-overview' },
        { name: 'Asset information', status: 'Completed', link: '/asset-information' },
      ],
    },
    {
      title: 'Location',
      items: [
        { name: 'Route', status: 'Not completed', link: '/route' },
        { name: 'Works overview', status: 'Completed', link: '/works-overview' },
        { name: 'Sensitive area checks', status: 'Cannot start yet', link: '/sensitive-area-checks' },
        { name: 'Sensitive area review', status: 'Cannot start yet', link: '/sensitive-area-review' },
        { name: 'Parishes', status: 'Completed', link: '/parishes' },
      ],
    },
    {
      title: 'Supporting information',
      items: [
        { name: 'Supporting questions', status: 'Not completed', link: '/supporting-questions' },
        { name: 'EIA fees', status: 'Completed', link: '/eia-fees' },
      ],
    },
    {
      title: 'Consultations',
      items: [
        { name: 'Consultations', status: 'Cannot start yet', link: '/consultations' },
        { name: 'Post consultation actions', status: 'Cannot start yet', link: '/post-consultation-actions' },
      ],
    },
    {
      title: 'Review and submit',
      items: [
        { name: 'Submit application', status: '', link: '/submit-application' },
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
