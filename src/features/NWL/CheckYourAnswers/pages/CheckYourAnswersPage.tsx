import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { NWL_BASE_URL } from '../../../../constants/nwl';

import { fetchCheckYourAnswersData } from '../services';
import { useDocumentDownload } from '../hooks';

import {
    CheckYourAnswersBreadcrumbs,
    ApplicantDetailsSummaryCard,
    NWLApplicationDetailsSummaryCard,
    OccupierDetailsSummaryCard,
    LandownerDetailsSummaryCard,
    RepresentativeDetailsSummaryCard,
    SiteAddressSummaryCard,
    LandLocationSummaryCard,
    LandRegistrySummaryCard,
    OSGridReferenceSummaryCard,
    IdentifyingInformationSummaryCard,
    AssetSummaryCard,
    AssetsPlanSummaryCard,
    NWLAdditionalInformationSummaryCard,
    NegotiationsSummaryCard,
} from '../components';

export const CheckYourAnswersPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
    const [declarationError, setDeclarationError] = useState(false);

    const [applicantDetails, setApplicantDetails] = useState<any>(null);
    const [applicationDetails, setApplicationDetails] = useState<any>(null);
    const [noticeCompliance, setNoticeCompliance] = useState<any>(null);
    const [objectorDetails, setObjectorDetails] = useState<any>(null);
    const [landownerDetails, setLandownerDetails] = useState<any>(null);
    const [representativeDetails, setRepresentativeDetails] = useState<any>(null);
    const [landDetails, setLandDetails] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [assetsMetadata, setAssetsMetadata] = useState<any>(null);
    const [negotiations, setNegotiations] = useState<any>(null);
    const [additionalInformation, setAdditionalInformation] = useState<any>(null);
    const [permissions, setPermissions] = useState({ canEdit: true });

    useEffect(() => {
        if (!applicationId) return;

        const loadData = async () => {
            try {
                setLoading(true);

                const data = await fetchCheckYourAnswersData(applicationId);

                setApplicantDetails(data.applicantDetails);
                setApplicationDetails(data.applicationDetails);
                setNoticeCompliance(data.noticeCompliance);
                setObjectorDetails(data.objectorDetails);
                setLandownerDetails(data.landownerDetails);
                setRepresentativeDetails(data.representativeDetails);
                setLandDetails(data.landDetails);
                setAssets(data.assets);
                setAssetsMetadata(data.assetsMetadata);

                setNegotiations(data.negotiations);
                setAdditionalInformation(data.additionalInformation);
                setPermissions(data.permissions);

                setLoading(false);
            } catch {
                setLoading(false);
            }
        };

        loadData();
    }, [applicationId]);

    // Use custom hook for document downloads
    useDocumentDownload();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declarationConfirmed) {
            setDeclarationError(true);
            window.scrollTo(0, 0);
            return;
        }
        setDeclarationError(false);
        setSubmitting(true);
        
        navigate(`${NWL_BASE_URL}/${applicationId}/pay-and-submit`);
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
                        {declarationError && (
                            <div className="govuk-error-summary" data-module="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
                                <h2 className="govuk-error-summary__title" id="error-summary-title">{CONSTANTS.ERROR_SUMMARY.TITLE}</h2>
                                <div className="govuk-error-summary__body">
                                    <ul className="govuk-list govuk-error-summary__list">
                                        <li>
                                            <a href="#declaration">{CONSTANTS.ERROR_MESSAGES.DECLARATION_REQUIRED}</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        <h1 className="govuk-heading-xl">{CONSTANTS.HEADING}</h1>

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
                        <ApplicantDetailsSummaryCard data={applicantDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
                        <NWLApplicationDetailsSummaryCard data={applicationDetails} noticeComplianceData={noticeCompliance} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
                        <OccupierDetailsSummaryCard data={objectorDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <LandownerDetailsSummaryCard data={landownerDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <RepresentativeDetailsSummaryCard data={representativeDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
                        <SiteAddressSummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <LandRegistrySummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <OSGridReferenceSummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <IdentifyingInformationSummaryCard data={landDetails} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
                        {assets.map((asset, index) => (
                            <AssetSummaryCard
                                key={asset.asset_id || index}
                                asset={asset}
                                assetNumber={index + 1}
                                applicationId={applicationId!}
                                canEdit={permissions.canEdit}
                            />
                        ))}

                        <AssetsPlanSummaryCard
                            data={assetsMetadata}
                            applicationId={applicationId!}
                            canEdit={permissions.canEdit}
                        />

                        {negotiations && (
                            <>
                                <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.NEGOTIATIONS || 'Negotiations'}</h2>
                                <NegotiationsSummaryCard data={negotiations} applicationId={applicationId!} canEdit={permissions.canEdit} />
                            </>
                        )}

                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
                        <NWLAdditionalInformationSummaryCard data={additionalInformation} applicationId={applicationId!} canEdit={permissions.canEdit} />

                        <h2 className="govuk-heading-l">{CONSTANTS.DECLARATION.HEADING}</h2>
                        <div className={`govuk-form-group ${declarationError ? 'govuk-form-group--error' : ''}`}>
                            {declarationError && (
                                <p className="govuk-error-message" id="declaration-error">
                                    <span className="govuk-visually-hidden">Error:</span> {CONSTANTS.ERROR_MESSAGES.DECLARATION_REQUIRED}
                                </p>
                            )}
                            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                <div className="govuk-checkboxes__item">
                                    <input 
                                        className="govuk-checkboxes__input" 
                                        id="declaration" 
                                        name="declaration" 
                                        type="checkbox" 
                                        checked={declarationConfirmed} 
                                        onChange={(e) => {
                                            setDeclarationConfirmed(e.target.checked);
                                            if (e.target.checked) {
                                                setDeclarationError(false);
                                            }
                                        }}
                                        aria-describedby={declarationError ? 'declaration-error' : undefined}
                                    />
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                                        {CONSTANTS.DECLARATION.TEXT}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <h2 className="govuk-heading-l">{CONSTANTS.SUBMIT.HEADING}</h2>
                        <p className="govuk-body">{CONSTANTS.SUBMIT.DESCRIPTION}</p>

                        <form onSubmit={handleSubmit}>
                            <button type="submit" className="govuk-button" data-module="govuk-button" disabled={submitting}>
                                {submitting ? CONSTANTS.SUBMIT.BUTTON_PROCESSING : CONSTANTS.SUBMIT.BUTTON_TEXT}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};