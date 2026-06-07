/**
 * API Service for NWL Check Your Answers
 * 
 * Fetches comprehensive application data for the Check Your Answers review page.
 */
import { buildBackendUrl } from '../../../../utils/apiConfig';

export interface NWLCheckYourAnswersResponse {
    applicationId: string;
    applicantDetails: any;
    applicationDetails: any;
    noticeCompliance: any;
    occupierDetails: any;
    landownerDetails: any;
    representativeDetails: any;
    landDetails: any;
    assets: any[];
    negotiations?: any;
    additionalInformation: any;
    permissions: {
        canEdit: boolean;
    };
}

/**
 * Fetch real data for Check Your Answers page from backend API
 *
 * @param applicationId - The application ID
 * @returns Promise with NWL application data
 */
export const fetchCheckYourAnswersData = async (applicationId: string): Promise<NWLCheckYourAnswersResponse> => {
    const response = await fetch(buildBackendUrl(`/backend/api/applications/${applicationId}/review`), {
        credentials: 'include'
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application data: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Transform API response to match expected structure if needed
    return {
        applicationId,
        applicantDetails: data.sections?.applicantDetails || null,
        applicationDetails: data.sections?.applicationDetails || null,
        noticeCompliance: data.sections?.noticeCompliance || null,
        occupierDetails: data.sections?.occupierDetails || null,
        landownerDetails: data.sections?.landownerDetails || null,
        representativeDetails: data.sections?.representativeDetails || null,
        landDetails: data.sections?.landDetails || null,
        assets: data.sections?.assets || [],
        negotiations: data.sections?.negotiations || null,
        additionalInformation: data.sections?.additionalInformation || null,
        permissions: data.permissions || { canEdit: true },
    };
};
