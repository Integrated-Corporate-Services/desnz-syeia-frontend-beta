/**
 * API Service for NWL Check Your Answers
 * 
 * Fetches comprehensive application data for the Check Your Answers review page.
 */
import { buildBackendUrl } from '../../../../utils/apiConfig';
import { getCsrfHeaders } from '../../../../utils/csrf';
import { generateCorrelationId } from '../../../../utils/correlationId';

export interface NWLCheckYourAnswersResponse {
    applicationId: string;
    applicantDetails: any;
    applicationDetails: any;
    noticeCompliance: any;
    objectorDetails: any;
    landownerDetails: any;
    representativeDetails: any;
    landDetails: any;
    assets: any[];
    assetsMetadata: unknown;
    negotiations?: any;
    additionalInformation: any;
    permissions: {
        canEdit: boolean;
    };
    declarationConfirmed?: boolean;
}

const fetchNwlAssetsMetadata = async (applicationId: string): Promise<unknown | null> => {
    const response = await fetch(buildBackendUrl(`/api/nwl/${applicationId}/assets`),
        {
            credentials: 'include'
        });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return response.json();
};

/**
 * Fetch real data for Check Your Answers page from backend API
 *
 * @param applicationId - The application ID
 * @returns Promise with NWL application data
 */
export const fetchCheckYourAnswersData = async (applicationId: string): Promise<NWLCheckYourAnswersResponse> => {
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/review`), {
        credentials: 'include'
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reviewAssetsSection = data.sections?.assets;
    const normalizedAssets = Array.isArray(reviewAssetsSection)
        ? reviewAssetsSection
        : reviewAssetsSection?.installed_assets || reviewAssetsSection?.assets || [];
    
    const assetsMetadata = reviewAssetsSection && typeof reviewAssetsSection === 'object' && !Array.isArray(reviewAssetsSection)
        ? reviewAssetsSection
        : await fetchNwlAssetsMetadata(applicationId);

    // Transform API response to match expected structure if needed
    return {
        applicationId,
        applicantDetails: data.sections?.applicantDetails || null,
        applicationDetails: data.sections?.applicationDetails || null,
        noticeCompliance: data.sections?.noticeCompliance || null,
        objectorDetails: data.sections?.objectorDetails || null,
        landownerDetails: data.sections?.landownerDetails || null,
        representativeDetails: data.sections?.representativeDetails || null,
        landDetails: data.sections?.landDetails || null,
        assets: normalizedAssets,
        assetsMetadata: assetsMetadata,
        negotiations: data.sections?.negotiations || null,
        additionalInformation: data.sections?.additionalInformation || null,
        permissions: data.permissions || { canEdit: true },
        declarationConfirmed: data.application?.declaration_confirmed || false,
    };
};

/**
 * Save declaration confirmation to database
 * @param applicationId - Application ID
 * @param isConfirmed - Whether declaration is confirmed
 */
export const saveDeclarationConfirmation = async (
    applicationId: string,
    isConfirmed: boolean
): Promise<void> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Correlation-ID': generateCorrelationId(),
        ...getCsrfHeaders(),
    };

    const response = await fetch(
        buildBackendUrl(`/api/applications/${applicationId}/declaration`),
        {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify({
                declaration_confirmed: isConfirmed,
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save declaration');
    }
};