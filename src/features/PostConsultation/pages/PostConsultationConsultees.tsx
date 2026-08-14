import React from 'react';
import { Link } from 'react-router-dom';
import { ConsulteesRecommendationsQuestion, FormButtons } from '../components';
import { usePostConsultationData, usePostConsultationNavigation } from '../hooks';
import { POST_CONSULTATION_CONSTANTS } from '../constants';
import { SaveType } from '../types';

const PostConsultationConsultees: React.FC = () => {
    const { applicationId, getTaskListUrl, handleNavigationAfterSaveConsultees } = usePostConsultationNavigation();

    const {
        consulteesRecommendations,
        setConsulteesRecommendations,
        acceptConsulteesRecommendations,
        setAcceptConsulteesRecommendations,
        consulteesExplanation,
        setConsulteesExplanation,
        loading,
        saving,
        error,
        consulteesRecommendationsError,
        consulteesRecommendationsReasonError,
        saveData,
    } = usePostConsultationData(applicationId);

    const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
        e.preventDefault();
        const success = await saveData(saveType, 'consultees');
        handleNavigationAfterSaveConsultees(saveType, success);
    };

    if (loading) {
        return (
            <>
                                <div className="govuk-width-container">
                                        <p className="govuk-body">{POST_CONSULTATION_CONSTANTS.LOADING_MESSAGE}</p>
                                </div>
            </>
        );
    }

    return (
        <>
                        <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item" aria-current="false">
                        <Link className="govuk-breadcrumbs__link" to={getTaskListUrl()}>
                            Task list
                        </Link>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="true">
                        {POST_CONSULTATION_CONSTANTS.BREADCRUMB_LABEL}
                    </li>
                </ol>
            </nav>
                            <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-l">{POST_CONSULTATION_CONSTANTS.PAGE_TITLE}</h1>

                        {(error || consulteesRecommendationsError || consulteesRecommendationsReasonError) && (
                            <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
                                <h2 className="govuk-error-summary__title" id="error-summary-title">
                                    There is a problem
                                </h2>
                                <div className="govuk-error-summary__body">
                                    <ul className="govuk-list govuk-error-summary__list">
                                        {error && <li>{error}</li>}
                                        {consulteesRecommendationsError && (
                                            <li>
                                                <a href="#consultees-recommendations-yes">{consulteesRecommendationsError}</a>
                                            </li>
                                        )}
                                        {consulteesRecommendationsReasonError && (
                                            <li>
                                                <a href="#consultees-explanation">{consulteesRecommendationsReasonError}</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form noValidate>
                            <ConsulteesRecommendationsQuestion
                                consulteesRecommendations={consulteesRecommendations}
                                acceptConsulteesRecommendations={acceptConsulteesRecommendations}
                                consulteesExplanation={consulteesExplanation}
                                onConsulteesRecommendationsChange={setConsulteesRecommendations}
                                onAcceptConsulteesRecommendationsChange={setAcceptConsulteesRecommendations}
                                onConsulteesExplanationChange={setConsulteesExplanation}
                                consulteesRecommendationsError={consulteesRecommendationsError}
                                consulteesExplanationError={consulteesRecommendationsReasonError}
                            />

                            <FormButtons
                                // onSaveLater={(e) => handleSubmit(e, "later")}
                                onSaveContinue={(e) => handleSubmit(e, 'continue')}
                                disabled={saving}
                            />
                        </form>
                    </div>
                </div>
                        </div>
        </>
    );
};

export default PostConsultationConsultees;
