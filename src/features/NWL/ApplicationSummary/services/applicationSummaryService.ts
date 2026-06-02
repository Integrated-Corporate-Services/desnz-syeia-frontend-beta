/**
 * API Service for the NWL Application Summary page.
 *
 * Fetches the full application review payload and maps it into the
 * read-only NWLApplicationSummaryData shape consumed by the page.
 */

import { NWLApplicationSummaryData } from '../types';

export const fetchNWLApplicationSummary = async (applicationId: string): Promise<NWLApplicationSummaryData> => {
    const response = await fetch(`/backend/api/applications/${applicationId}/review`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application summary: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const sections = data.sections || {};

    return {
        applicationId: data.applicationId || applicationId,
        desnzRef: data.desnzRef || null,
        formType: data.formType || 'NWL',
        status: data.status || null,
        applicantDetails: sections.applicantDetails || null,
        applicationDetails: sections.applicationDetails || null,
        noticeCompliance: sections.noticeCompliance || null,
        occupierDetails: sections.occupierDetails || null,
        landownerDetails: sections.landownerDetails || null,
        representativeDetails: sections.representativeDetails || null,
        landDetails: sections.landDetails || null,
        assets: sections.assets || [],
        negotiations: sections.negotiations || null,
        additionalInformation: sections.additionalInformation || null,
        payment: sections.payment || null,
        permissions: {
            canEdit: data.permissions?.canEdit ?? false,
            canWithdraw: data.permissions?.canWithdraw ?? false,
        },
    };
};
