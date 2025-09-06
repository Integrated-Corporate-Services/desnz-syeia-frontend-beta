export type TaskListSection = {
  title: string;
  items: { name: string; link: string }[];
};

export function getInitialSections(): TaskListSection[] {
  return [
    {
      title: 'Applicant details',
      items: [
        { name: 'Network operator details', link: '/network-operator-details' },
        { name: 'Network operator contact details', link: '/network-operator-contact-details' },
      ],
    },
    {
      title: 'Project details',
      items: [
        { name: 'Project overview',  link: '/project-overview' },
        { name: 'Asset information',  link: '/asset-information' },
      ],
    },
    {
      title: 'Location',
      items: [
        { name: 'Route', link: '/route' },
        { name: 'Works overview',  link: '/works-overview' },
        { name: 'Sensitive area checks',  link: '/sensitive-area-checks' },
        { name: 'Sensitive area review',  link: '/sensitive-area-review' },
        { name: 'Parishes',  link: '/parishes' },
      ],
    },
    {
      title: 'Supporting information',
      items: [
        { name: 'Supporting questions',  link: '/supporting-questions' },
        { name: 'EIA fees',  link: '/eia-fees' },
      ],
    },
    {
      title: 'Consultations',
      items: [
        { name: 'Consultations',  link: '/consultations' },
        { name: 'Post consultation actions', link: '/post-consultation-actions' },
      ],
    },
    {
      title: 'Review and submit',
      items: [
        { name: 'Submit application', link: '/submit-application' },
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
