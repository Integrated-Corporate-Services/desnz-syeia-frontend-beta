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

/**
 * Task name constants to ensure consistency across the application
 * Use these constants when calling getNextPageUrl() or referencing task names
 */
export const TASK_NAMES = {
    // Applicant details section
    APPLICANT_DETAILS: 'Applicant details',
    CHECK_APPLICANT_CONTACT_DETAILS: 'Check applicant contact details',

    // Project details section
    PROJECT_OVERVIEW: 'Project overview',
    ASSETS: 'Assets',
    WORKS_OVERVIEW: 'Works overview',

    // Location section
    ROUTE: 'Route',
    SENSITIVE_AREA_CHECKS: 'Sensitive area checks',
    SENSITIVE_AREA_REVIEW: 'Sensitive area review',
    PARISHES: 'Parishes',

    // Supporting information section
    SUPPORTING_QUESTIONS: 'Supporting questions',
    EIA_FEES: 'EIA fees',

    // Consultations section
    CONSULTATIONS: 'Consultations',
    POST_CONSULTATION_ACTIONS: 'Post consultation actions',

    // Pay and submit section
    CHECK_YOUR_ANSWERS: 'Check your answers',
    PAY_AND_SUBMIT: 'Pay and submit',
} as const;

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
                    status: 'Not completed',
                    link: `${base}/network-operator-details`,
                },
                {
                    name: 'Check applicant contact details',
                    status: 'Not completed',
                    link: `${base}/network-operator-contact-details`,
                },
            ],
        },
        {
            title: 'Project details',
            items: [
                {
                    name: 'Project overview',
                    status: 'Not completed',
                    link: `${base}/project-overview`,
                },
                {
                    name: 'Assets',
                    status: 'Not completed',
                    link: `${base}/asset-information`,
                },
                {
                    name: 'Works overview',
                    status: 'Not completed',
                    link: `${base}/works-overview`,
                },
            ],
        },
        {
            title: 'Location',
            items: [
                { name: 'Route', status: 'Cannot start yet', link: `${base}/route-overview` },

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
                { name: 'Parishes', status: 'Cannot start yet', link: `${base}/parishes` },
            ],
        },
        {
            title: 'Supporting information',
            items: [
                {
                    name: 'Supporting questions',
                    status: 'Cannot start yet',
                    link: `${base}/supporting-info`,
                },
                {
                    name: 'EIA fees',
                    status: 'Cannot start yet',
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
                    status: 'Cannot start yet',
                    link: `${base}/check-your-answers`,
                },
                {
                    name: 'Pay and submit',
                    status: 'Cannot start yet',
                    link: `${base}/pay-and-submit`,
                    disabled: true,
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
        const sectionsWithLogic = applySensitiveAreaCheckLogic(sections, sensitiveAreaInProgress);
        return applyTaskDependencies(sectionsWithLogic, progress);
    }
    const sectionsWithProgress = applyProgressToSections(sections, progress);
    const sectionsWithSensitiveLogic = applySensitiveAreaCheckLogic(sectionsWithProgress, sensitiveAreaInProgress);
    return applyTaskDependencies(sectionsWithSensitiveLogic, progress);
}

export function applyProgressToSections(sections: TaskListSection[], progress: { subsection_name: string; status: string }[]): TaskListSection[] {
    return sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
            const found = progress.find((p) => p.subsection_name === item.name);
            if (found && typeof found.status === 'string' && found.status.trim() !== '') {
                // Map backend status to frontend status
                let mappedStatus = found.status;
                if (mappedStatus === 'Incomplete') {
                    mappedStatus = 'Not completed';
                }
                return { ...item, status: mappedStatus };
            }
            return item;
        }),
    }));
}

/**
 * Check if all required sections are completed to access Check Your Answers
 * @param progress - Array of progress items with subsection_name and status
 * @returns boolean - true if all required sections are completed
 */
export function areAllRequiredSectionsCompleted(progress?: { subsection_name: string; status: string }[]): boolean {
    if (!progress || progress.length === 0) {
        return false;
    }

    const requiredSubsections = [
        // Applicant details section
        'Applicant details',
        'Check applicant contact details',
        // Project details section
        'Project overview',
        'Assets',
        'Works overview',
        // Location section
        'Route',
        'Sensitive area checks',
        'Sensitive area review',
        'Parishes',
        // Supporting information section
        'Supporting questions',
        'EIA fees',
        // Consultations section
        'Consultations',
        'Post consultation actions',
    ];

    return requiredSubsections.every((subsection) => {
        const item = progress.find((p) => p.subsection_name === subsection);
        return item?.status === 'Completed';
    });
}

// when sensitive area checks are in progress
export function applySensitiveAreaCheckLogic(sections: TaskListSection[], inProgress?: boolean): TaskListSection[] {
    return sections.map((section) => {
        if (section.title === 'Location') {
            const sensitiveCheckItem = section.items.find((item) => item.name === 'Sensitive area checks');
            const checksCompleted = sensitiveCheckItem?.status === 'Completed';
            const routeItem = section.items.find((item) => item.name === 'Route');
            const routeCompleted = routeItem?.status === 'Completed';
            const worksOverviewItem = section.items.find((item) => item.name === 'Works overview');
            const worksOverviewCompleted = worksOverviewItem?.status === 'Completed';

            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.name === 'Route' && inProgress) {
                        return { ...item, disabled: true, plainTextStatus: true };
                    }

                    if (item.name === 'Sensitive area checks' && !routeCompleted) {
                        return {
                            ...item,
                            status: 'Cannot start yet',
                            disabled: true,
                            plainTextStatus: true,
                            link: '#',
                        };
                    }

                    if (item.name === 'Sensitive area checks' && inProgress) {
                        return {
                            ...item,
                            status: 'In progress',
                            disabled: true,
                            link: '#',
                        };
                    }

                    if (item.name === 'Sensitive area checks' && !inProgress && routeCompleted && item.status !== 'Completed' && item.status !== 'In progress') {
                        return { ...item, status: 'Not completed' };
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

// Apply task dependencies based on business rules
export function applyTaskDependencies(sections: TaskListSection[], progress?: { subsection_name: string; status: string }[]): TaskListSection[] {
    // Helper function to check if a task is completed
    const isTaskCompleted = (taskName: string) => {
        return progress?.find((p) => p.subsection_name === taskName)?.status === 'Completed';
    };

    // Helper function to check if all tasks in a section are completed
    const areAllTasksInSectionCompleted = (sectionTitle: string) => {
        const section = sections.find((s) => s.title === sectionTitle);
        if (!section) return false;
        return section.items.every((item) => progress?.find((p) => p.subsection_name === item.name)?.status === 'Completed');
    };

    return sections.map((section) => {
        // Project Details dependencies
        if (section.title === 'Project details') {
            return section; // No dependencies for project details
        }

        // Location section dependencies
        if (section.title === 'Location') {
            // Check if all Project Details tasks are completed
            const projectDetailsCompleted = areAllTasksInSectionCompleted('Project details');

            return {
                ...section,
                items: section.items.map((item) => {
                    // Route can only start if Project Details is completed
                    if (item.name === 'Route') {
                        if (!projectDetailsCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        // If project details completed but route not started, show "Not completed"
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    // Sensitive area checks depends on Route being completed
                    if (item.name === 'Sensitive area checks') {
                        if (!projectDetailsCompleted || !isTaskCompleted('Route')) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    // Sensitive area review depends on Sensitive area checks being completed
                    if (item.name === 'Sensitive area review') {
                        if (!projectDetailsCompleted || !isTaskCompleted('Route') || !isTaskCompleted('Sensitive area checks')) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    // Parishes depends on Sensitive area review being completed
                    if (item.name === 'Parishes') {
                        if (!projectDetailsCompleted || !isTaskCompleted('Route') || !isTaskCompleted('Sensitive area checks') || !isTaskCompleted('Sensitive area review')) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    return item;
                }),
            };
        }

        // Supporting information dependencies
        if (section.title === 'Supporting information') {
            // Supporting information has no dependencies - can be started anytime
            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.status !== 'Completed' && item.status !== 'In progress') {
                        return { ...item, status: 'Not completed' };
                    }
                    return item;
                }),
            };
        }

        // Consultations dependencies
        if (section.title === 'Consultations') {
            const locationCompleted = areAllTasksInSectionCompleted('Location');
            const consultationsCompleted = isTaskCompleted('Consultations');

            return {
                ...section,
                items: section.items.map((item) => {
                    // Consultations item depends only on Location being completed
                    if (item.name === 'Consultations') {
                        if (!locationCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    // Post consultation actions depends on Consultations being completed
                    if (item.name === 'Post consultation actions') {
                        if (!locationCompleted || !consultationsCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    return item;
                }),
            };
        }

        // Pay and submit dependencies
        if (section.title === 'Pay and submit') {
            // Check if all previous sections are completed
            const applicantDetailsCompleted = areAllTasksInSectionCompleted('Applicant details');
            const projectDetailsCompleted = areAllTasksInSectionCompleted('Project details');
            const locationCompleted = areAllTasksInSectionCompleted('Location');
            const supportingInfoCompleted = areAllTasksInSectionCompleted('Supporting information');
            const consultationsCompleted = areAllTasksInSectionCompleted('Consultations');
            const checkAnswersCompleted = isTaskCompleted('Check your answers');

            return {
                ...section,
                items: section.items.map((item) => {
                    // Check your answers depends on all other sections
                    if (item.name === 'Check your answers') {
                        if (!applicantDetailsCompleted || !projectDetailsCompleted || !locationCompleted || !supportingInfoCompleted || !consultationsCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        if (item.status !== 'Completed' && item.status !== 'In progress') {
                            return { ...item, status: 'Not completed' };
                        }
                        return item;
                    }

                    // Pay and submit depends on Check your answers being completed
                    if (item.name === 'Pay and submit') {
                        if (!checkAnswersCompleted) {
                            return {
                                ...item,
                                status: 'Cannot start yet',
                                disabled: true,
                                plainTextStatus: true,
                                link: '#',
                            };
                        }
                        // Enable the link when check your answers is completed
                        return {
                            ...item,
                            status: item.status !== 'Completed' && item.status !== 'In progress' ? 'Not completed' : item.status,
                            disabled: false,
                            plainTextStatus: false,
                        };
                    }

                    return item;
                }),
            };
        }

        // For all other sections, update status terminology
        return {
            ...section,
            items: section.items.map((item) => {
                if (item.status === 'Incomplete') {
                    return { ...item, status: 'Not completed' };
                }
                return item;
            }),
        };
    });
}

/**
 * Get the next page URL in the task list sequence after saving the current page
 * Exception: "Sensitive area checks" always returns the task list URL
 *
 * @param currentPageName - The name of the current task/page being saved
 * @param applicationId - The application ID for URL construction
 * @returns The URL of the next page or task list
 */
export function getNextPageUrl(currentPageName: string, applicationId: string): string {
    const taskList = `${S37_BASE_URL}/${applicationId}/task-list`;

    // Define the task sequence - the order in which pages should be completed
    const taskSequence: { [key: string]: string } = {
        // Applicant details section
        [TASK_NAMES.APPLICANT_DETAILS]: `${S37_BASE_URL}/${applicationId}/network-operator-contact-details`,
        [TASK_NAMES.CHECK_APPLICANT_CONTACT_DETAILS]: taskList,

        // Project details section
        [TASK_NAMES.PROJECT_OVERVIEW]: `${S37_BASE_URL}/${applicationId}/asset-information`,
        [TASK_NAMES.ASSETS]: `${S37_BASE_URL}/${applicationId}/works-overview`,
        [TASK_NAMES.WORKS_OVERVIEW]: taskList,

        // Location section
        [TASK_NAMES.ROUTE]: `${S37_BASE_URL}/${applicationId}/sensitive-area-check`,

        // Sensitive area checks - ALWAYS go to task list
        [TASK_NAMES.SENSITIVE_AREA_CHECKS]: taskList,

        [TASK_NAMES.SENSITIVE_AREA_REVIEW]: `${S37_BASE_URL}/${applicationId}/parishes`,
        [TASK_NAMES.PARISHES]: taskList,

        // Supporting information section
        [TASK_NAMES.SUPPORTING_QUESTIONS]: `${S37_BASE_URL}/${applicationId}/eia-fees`,
        [TASK_NAMES.EIA_FEES]: taskList,

        // Consultations section
        [TASK_NAMES.CONSULTATIONS]: `${S37_BASE_URL}/${applicationId}/post-consultation-actions/lpa-agreement`,
        [TASK_NAMES.POST_CONSULTATION_ACTIONS]: taskList,
    };

    // Return the next page URL or default to task list
    return taskSequence[currentPageName] || taskList;
}
