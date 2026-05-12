/**
 * API Service for NWL Check Your Answers
 * 
 * Fetches comprehensive application data for the Check Your Answers review page.
 */

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
    const response = await fetch(`/backend/api/applications/${applicationId}/nwl-review`);

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
        additionalInformation: data.sections?.additionalInformation || null,
        permissions: data.permissions || { canEdit: true },
    };
};

/**
 * Example API response structure (for backend team reference):
 *
 * {
 *   "permissions": {
 *     "canEdit": true
 *   },
 *   "sections": {
 *     "applicantDetails": {
 *       "applicant_name": "ABC power networks",
 *       "applicant_contact_name": "Alex Smith",
 *       "address_line1": "72 Guild Street",
 *       "address_line2": "London",
 *       "postcode": "SE23 6FH",
 *       "email": "alex.smith@example.co.uk",
 *       "phone": "07700 900000",
 *       "additional_contacts": ["email1@example.com", "email2@example.com"]
 *     },
 *     "applicationDetails": {
 *       "application_type": "New line",
 *       "paragraph": "Paragraph 8(1)(c)",
 *       "offer_date": "2026-01-15",
 *       "offer_document": "document.pdf",
 *       "notice_date": "2026-01-01",
 *       "notice_documents": "document.pdf"
 *     },
 *     "noticeCompliance": {
 *       "notice_clearly_refers": true,
 *       "unclear_explanation": "",
 *       "within_three_months": true,
 *       "late_reason": "",
 *       "different_term": true,
 *       "different_term_explanation": "Lorem ipsum..."
 *     },
 *     "occupierDetails": {
 *       "title": "Ms",
 *       "name": "Jane Browning",
 *       "organisation": "Company Name",
 *       "address_line1": "14 Oak Lane",
 *       "address_line2": "Bridgwater",
 *       "postcode": "TA6 3QR",
 *       "email": "jane.browning@email.co.uk",
 *       "phone": "07700 900123"
 *     },
 *     "landownerDetails": {
 *       "title": "Mrs",
 *       "name": "Samantha Browning",
 *       "organisation": "Browning Estates Ltd",
 *       "address_line1": "Browning Estates",
 *       "address_line2": "22 High Street",
 *       "town_city": "Taunton",
 *       "postcode": "TA1 1AB",
 *       "email": "samantha@browningestates.co.uk",
 *       "phone": "01823 123456"
 *     },
 *     "representativeDetails": {
 *       "has_representative": true,
 *       "name": "Sarah Thompson",
 *       "organisation": "Thompson Legal",
 *       "email": "sarah@thompsonlegal.co.uk",
 *       "phone": "01823 654321"
 *     },
 *     "landDetails": {
 *       "site_address_same": false,
 *       "site_address": "Plot 7, Blackdown Hills\nNear Wellington\nTA21 0AA",
 *       "country": "England",
 *       "is_registered": true,
 *       "land_registry_ref": "ST123456",
 *       "land_registry_doc": "land-registry-ST123456.pdf",
 *       "os_grid_ref": "ST 12345 67890",
 *       "land_identification": "Description...",
 *       "visible_from_road": true,
 *       "site_photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"]
 *     },
 *     "assets": [
 *       {
 *         "asset_id": "1",
 *         "line_voltage": "240/415v",
 *         "line_types": [
 *           {
 *             "type": "Overhead line",
 *             "comment": "2 spans crossing rear garden"
 *           },
 *           {
 *             "type": "Wooden poles(s)",
 *             "comment": "Terminal pole at property boundary"
 *           }
 *         ]
 *       }
 *     ],
 *     "additionalInformation": {
 *       "has_related": true,
 *       "related_details": "Previous application TL-2024-0312...",
 *       "has_other": true,
 *       "other_details": "Bat survey conducted...",
 *       "other_documents": "bat-survey.pdf"
 *     }
 *   }
 * }
 */
