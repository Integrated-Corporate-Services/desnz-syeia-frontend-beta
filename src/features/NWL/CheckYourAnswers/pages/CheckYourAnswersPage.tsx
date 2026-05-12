/**
 * Check Your Answers Page for NWL Applications
 * Refactored to use modular components
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

// Import data service
import { fetchCheckYourAnswersData } from '../services';

// Import modular components
import {
    CheckYourAnswersBreadcrumbs,
    ApplicantDetailsSummaryCard,
    NWLApplicationDetailsSummaryCard,
    NoticeComplianceSummaryCard,
    OccupierDetailsSummaryCard,
    LandownerDetailsSummaryCard,
    RepresentativeDetailsSummaryCard,
    SiteAddressSummaryCard,
    LandLocationSummaryCard,
    AssetSummaryCard,
    NWLAdditionalInformationSummaryCard,
} from '../components';

export const CheckYourAnswersPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

    // State for all sections
    const [applicantDetails, setApplicantDetails] = useState<any>(null);
    const [applicationDetails, setApplicationDetails] = useState<any>(null);
    const [noticeCompliance, setNoticeCompliance] = useState<any>(null);
    const [occupierDetails, setOccupierDetails] = useState<any>(null);
    const [landownerDetails, setLandownerDetails] = useState<any>(null);
    const [representativeDetails, setRepresentativeDetails] = useState<any>(null);
    const [landDetails, setLandDetails] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [additionalInformation, setAdditionalInformation] = useState<any>(null);
    const [permissions, setPermissions] = useState({ canEdit: true });

    // Load data from API
    useEffect(() => {
        if (!applicationId) return;

        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch data from backend API
                const data = await fetchCheckYourAnswersData(applicationId);

                // Set all state from response
                setApplicantDetails(data.applicantDetails);
                setApplicationDetails(data.applicationDetails);
                setNoticeCompliance(data.noticeCompliance);
                setOccupierDetails(data.occupierDetails);
                setLandownerDetails(data.landownerDetails);
                setRepresentativeDetails(data.representativeDetails);
                setLandDetails(data.landDetails);
                setAssets(data.assets);
                setAdditionalInformation(data.additionalInformation);
                setPermissions(data.permissions);

                setLoading(false);
            } catch (error) {
                setLoading(false);
                // Could set an error state here if needed
            }
        };

        loadData();
    }, [applicationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declarationConfirmed) {
            alert(CONSTANTS.SUBMIT.ALERT_CONFIRM);
            return;
        }
        setSubmitting(true);
        // TODO: Submit logic
    };

    if (loading) {
        return (
            <div className="govuk-width-container">
                <CheckYourAnswersBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    return (
        <div className="govuk-width-container">
            <CheckYourAnswersBreadcrumbs applicationId={applicationId!} />
            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl">{CONSTANTS.HEADING}</h1>

                        {/* Applicant details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
                        <ApplicantDetailsSummaryCard data={applicantDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        {/* Application details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
                        <NWLApplicationDetailsSummaryCard data={applicationDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <NoticeComplianceSummaryCard data={noticeCompliance} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        {/* Owner and/or occupier details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
                        <OccupierDetailsSummaryCard data={occupierDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <LandownerDetailsSummaryCard data={landownerDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <RepresentativeDetailsSummaryCard data={representativeDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        {/* Land details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
                        <SiteAddressSummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <LandLocationSummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        {/* Assets */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
                        {assets.map((asset, index) => (
                            <AssetSummaryCard key={asset.asset_id || index} data={asset} index={index} applicationId={applicationId!} canEdit={permissions.canEdit} />
                        ))}

                        {/* Additional information */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
                        <NWLAdditionalInformationSummaryCard data={additionalInformation} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        {/* Declaration */}
                        <h2 className="govuk-heading-l">{CONSTANTS.DECLARATION.HEADING}</h2>
                        <div className="govuk-form-group">
                            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                <div className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input" id="declaration" name="declaration" type="checkbox" checked={declarationConfirmed} onChange={(e) => setDeclarationConfirmed(e.target.checked)} />
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                                        {CONSTANTS.DECLARATION.TEXT}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Pay and submit */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SUBMIT.HEADING}</h2>
                        <p className="govuk-body">{CONSTANTS.SUBMIT.DESCRIPTION}</p>

                        <form onSubmit={handleSubmit}>
                            <button type="submit" className="govuk-button" data-module="govuk-button" disabled={!declarationConfirmed || submitting}>
                                {submitting ? CONSTANTS.SUBMIT.BUTTON_PROCESSING : CONSTANTS.SUBMIT.BUTTON_TEXT}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};
