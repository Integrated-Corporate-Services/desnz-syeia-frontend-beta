/**
 * Mock Data Service for NWL Check Your Answers
 *
 * This file contains mock data for development/testing.
 * Replace this with real API service when backend is ready.
 *
 * To switch to real API:
 * 1. Implement fetchCheckYourAnswersData in a new apiService.ts
 * 2. Change the import in CheckYourAnswersPage.tsx from './mockDataService' to './apiService'
 */

export interface NWLCheckYourAnswersResponse {
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
 * Fetch mock data for Check Your Answers page
 * This simulates an API call with a slight delay
 *
 * @param applicationId - The application ID
 * @returns Promise with mock NWL data
 */
export const fetchCheckYourAnswersData = async (applicationId: string): Promise<NWLCheckYourAnswersResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('📦 Loading MOCK data for Check Your Answers, applicationId:', applicationId);

    // Return comprehensive mock data matching all wireframes
    return {
        applicantDetails: {
            applicant_name: 'ABC power networks',
            applicant_contact_name: 'Alex Smith',
            address_line1: '72 Guild Street',
            address_line2: 'London',
            postcode: 'SE23 6FH',
            email: 'alex.smith@example.co.uk',
            phone: 'Value',
            additional_contacts: ['joe.bloggs@gmail.com', 'sean.bon.hovi@yahoo.co.uk'],
        },

        applicationDetails: {
            application_type: 'New line',
            paragraph: 'Paragraph 8(1)(c)',
            offer_date: '2026-01-15',
            offer_document: 'document.pdf',
            notice_date: '2026-01-01',
            notice_documents: 'document.pdf',
        },

        noticeCompliance: {
            notice_clearly_refers: true,
            unclear_explanation: 'Lorem ipsum dolor sit amet',
            within_three_months: true,
            late_reason: 'Lorem ipsum dolor sit amet',
            different_term: true,
            different_term_explanation: 'Lorem ipsum dolor sit amet',
        },

        occupierDetails: {
            title: 'Ms',
            name: 'Jane Browning',
            organisation: '-',
            address_line1: '14 Oak Lane',
            address_line2: 'Bridgwater',
            postcode: 'TA6 3QR',
            email: 'jane.browning@email.co.uk',
            phone: '07700 900123',
        },

        landownerDetails: {
            title: 'Mrs',
            name: 'Samantha Browning',
            organisation: 'Browning Estates Ltd',
            address_line1: 'Browning Estates',
            address_line2: '22 High Street',
            town_city: 'Taunton',
            postcode: 'TA1 1AB',
            email: 'samantha@browningestates.co.uk',
            phone: '01823 123456',
        },

        representativeDetails: {
            has_representative: true,
            name: 'Sarah Thompson',
            organisation: 'Thompson Legal',
            email: 'sarah@thompsonlegal.co.uk',
            phone: '01823 654321',
        },

        landDetails: {
            site_address_same: false,
            site_address: 'Plot 7, Blackdown Hills\nNear Wellington\nTA21 0AA',
            country: 'England',
            is_registered: true,
            land_registry_ref: 'ST123456',
            land_registry_doc: 'land-registry-ST123456.pdf',
            os_grid_ref: 'ST 12345 67890',
            land_identification: 'South-east corner of Plot 7, adjacent to the B3170 road. Two mature oak trees approximately 15 metres from the overhead line running east-west across the field. Access via farm gate on the western boundary.',
            visible_from_road: true,
            site_photos: ['site-photo-1.jpg', 'site-photo-2.jpg', 'site-photo-3.jpg'],
        },

        assets: [
            {
                asset_id: '1',
                line_voltage: '240/415v',
                line_types: [
                    {
                        type: 'Overhead line',
                        comment: '2 spans crossing rear garden',
                    },
                    {
                        type: 'Wooden poles(s)',
                        comment: 'Terminal pole at property boundary',
                    },
                    {
                        type: 'Earth wire',
                        comment: 'Associated with overhead line spans',
                    },
                ],
            },
        ],

        additionalInformation: {
            has_related: true,
            related_details: 'Previous tree lopping application TL-2024-0312 for the same site, approved June 2024. This application covers additional trees identified during the 2025 line inspection.',
            has_other: true,
            other_details: 'The occupier has requested that works are not carried out during nesting season (March to August). A bat survey was conducted in November 2025 and no roosts were found. Survey report attached.',
            other_documents: 'bat-survey-nov-2025.pdf',
        },

        permissions: {
            canEdit: true,
        },
    };
};

/**
 * Template for real API service (to be implemented later)
 *
 * export const fetchCheckYourAnswersData = async (
 *   applicationId: string
 * ): Promise<NWLCheckYourAnswersResponse> => {
 *   const response = await fetch(
 *     `/backend/api/applications/${applicationId}/nwl-review`
 *   );
 *
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch application data');
 *   }
 *
 *   return await response.json();
 * };
 */
