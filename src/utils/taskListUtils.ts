import { S37_BASE_URL } from '../constants/s37';

export type TaskListSection = {
    title: string;
    items: {
        name: string;
        status: string;
        link: string;
        disabled?: boolean;
        plainTextStatus?: boolean; // Status should render as plain text, not a tag
    }[];
};

export function getInitialSections(applicationId?: string, assetInformationStatus?: string): TaskListSection[] {
    const base = applicationId ? `${S37_BASE_URL}/${applicationId}` : `${S37_BASE_URL}/:applicationId`;

    // Determine if Pay and submit should be disabled
    const isAssetInfoCompleted = assetInformationStatus === 'Completed';

    return [
        {
            title: 'Applicant details',
            items: [
                {
                    name: 'Applicant details',
                    status: 'Incomplete',
                    link: `${base}/network-operator-details`,
                },
                {
                    name: 'Check applicant contact details',
                    status: 'Incomplete',
                    link: `${base}/network-operator-contact-details`,
                },
            ],
        },
        {
            title: 'Project details',
            items: [
                {
                    name: 'Project overview',
                    status: 'Incomplete',
                    link: `${base}/project-overview`,
                },
                {
                    name: 'Asset information',
                    status: 'Incomplete',
                    link: `${base}/asset-information`,
                },
            ],
        },
        {
            title: 'Location',
            items: [
                { name: 'Route', status: 'Incomplete', link: `${base}/route-overview` },
                {
                    name: 'Works overview',
                    status: 'Incomplete',
                    link: `${base}/works-overview`,
                },
                {
                    name: 'Sensitive area checks',
                    status: 'Cannot start yet',
                    link: `${base}/sensitive-area-check`,
                },
                {
                    name: 'Sensitive area review',
                    status: 'Cannot start yet',
                    link: `${base}/sensitive-area-review`,
                },
                { name: 'Parishes', status: 'Incomplete', link: `${base}/parishes` },
            ],
        },
        {
            title: 'Supporting information',
            items: [
                {
                    name: 'Supporting questions',
                    status: 'Incomplete',
                    link: `${base}/supporting-info`,
                },
                {
                    name: 'EIA fees',
                    status: 'Incomplete',
                    link: `${base}/eia-fees`,
                },
            ],
        },
        {
            title: 'Consultations',
            items: [
                {
                    name: 'Consultations',
                    status: 'Cannot start yet',
                    link: `${base}/consultation/requests-required`,
                },
                {
                    name: 'Post consultation actions',
                    status: 'Cannot start yet',
                    link: `${base}/post-consultation-actions/lpa-agreement`,
                },
            ],
        },
        {
            title: 'Pay and submit',
            items: [
                {
                    name: 'Check your answers',
                    status: 'Incomplete',
                    link: `${base}/check-your-answers`,
                },
                {
                    name: 'Pay and submit',
                    status: isAssetInfoCompleted ? 'Incomplete' : 'Cannot start yet',
                    link: isAssetInfoCompleted ? `${base}/pay-and-submit` : '#',
                    disabled: !isAssetInfoCompleted, // Add disabled flag
                },
                {
                    name: 'Submit application',
                    status: '',
                    link: `${base}/submit-application`,
                },
            ],
        },
    ];
}

export function updateSectionStatus(sections: TaskListSection[], sectionIdx: number, itemIdx: number, newStatus: string): TaskListSection[] {
    const updated = sections.map((section, idx) => {
        if (idx === sectionIdx) {
            return {
                ...section,
                items: section.items.map((item, jdx) => {
                    if (jdx === itemIdx) {
                        return { ...item, status: newStatus };
                    }
                    return item;
                }),
            };
        }
        return section;
    });
    return updated;
}

export function getSectionsWithProgress(applicationId?: string, progress?: { subsection_name: string; status: string }[], assetInformationStatus?: string, sensitiveAreaInProgress?: boolean): TaskListSection[] {
    const sections = getInitialSections(applicationId, assetInformationStatus);
    if (!progress || progress.length === 0) {
        return applySensitiveAreaCheckLogic(sections, sensitiveAreaInProgress);
    }
    const sectionsWithProgress = applyProgressToSections(sections, progress);
    return applySensitiveAreaCheckLogic(sectionsWithProgress, sensitiveAreaInProgress);
}

export function applyProgressToSections(sections: TaskListSection[], progress: { subsection_name: string; status: string }[]): TaskListSection[] {
    return sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
            const found = progress.find((p) => p.subsection_name === item.name);
            if (found && typeof found.status === 'string' && found.status.trim() !== '') {
                return { ...item, status: found.status };
            }
            return item;
        }),
    }));
}

// when sensitive area checks are in progress
export function applySensitiveAreaCheckLogic(sections: TaskListSection[], inProgress?: boolean): TaskListSection[] {
    return sections.map((section) => {
        if (section.title === 'Location') {
            const sensitiveCheckItem = section.items.find((item) => item.name === 'Sensitive area checks');
            const checksCompleted = sensitiveCheckItem?.status === 'Completed';

            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.name === 'Route' && inProgress) {
                        return { ...item, disabled: true, plainTextStatus: true };
                    }
                    if (item.name === 'Sensitive area checks' && inProgress) {
                        return { ...item, status: 'In progress' };
                    }
                    if (item.name === 'Sensitive area review') {
                        if (inProgress) {
                            return {
                                ...item,
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (!checksCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        return item;
                    }
                    return item;
                }),
            };
        }
        if (section.title === 'Consultations' && inProgress) {
            return {
                ...section,
                items: section.items.map((item) => {
                    return { ...item, disabled: true, plainTextStatus: true };
                }),
            };
        }
        return section;
    });
}