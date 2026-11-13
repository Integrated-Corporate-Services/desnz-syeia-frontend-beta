import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useEiaFees } from '../../../hooks/useEiaFees';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { useConsultationsStarted } from '../../../hooks/useConsultationsStarted';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import PageTitle from '../../../components/PageTitle';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import EIAFeesSummary from './EIAFeesSummary';
import AssessmentOptions from '../component/AssessmentOptions';
import EiaGuidance from '../component/EiaGuidance';
import { useEiaScreeningRequirement } from '../hooks/useEiaScreeningRequirement';
import {
    EIA_ASSESSMENT,
    EIA_CONTENT,
    MANDATORY_SCREENING_OPTIONS,
    OPTIONAL_SCREENING_OPTIONS,
    type EiaAssessment,
} from '../constants/eiaAssessment';
import { getEiaAssessment, toEiaAnswers } from '../utils/eiaAssessment';
import { EIA_FEES_ERROR_MESSAGES, EIAFeesErrorField, getFieldErrorMessage, validateAssessment, type ValidationError } from '../validations';

// SYEIA-1485: one assessment question; Image 2 when screening is optional, Image 3 when it is mandatory.
const EIAFeesForm: React.FC = () => {
    const navigate = useNavigate();
    const applicationId = useGetApplicationId();
    const { user } = useAuthUserContext();
    const userId = (user as AuthUser)?.user_id;
    const taskListUrl = `${S37_BASE_URL}/${applicationId}/task-list`;

    useBreadcrumb(
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={taskListUrl}>Task list</Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">{EIA_CONTENT.BREADCRUMB}</li>
            </ol>
        </nav>
    );

    const { eiaFees, fetchEiaFees, createEiaFees, updateEiaFees } = useEiaFees();
    const { loading: requirementLoading, mandatory, highVoltage, sensitiveArea } = useEiaScreeningRequirement(applicationId);
    const { consultationsStarted, loading: consultationsLoading } = useConsultationsStarted(applicationId);
    const [assessment, setAssessment] = useState<EiaAssessment | ''>('');
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [saving, setSaving] = useState(false);
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const options = mandatory ? MANDATORY_SCREENING_OPTIONS : OPTIONAL_SCREENING_OPTIONS;

    useEffect(() => {
        if (applicationId) fetchEiaFees(applicationId);
    }, [applicationId, fetchEiaFees]);

    // A saved answer that this version of the page does not offer (an old "No" when screening is mandatory) is left unselected.
    useEffect(() => {
        if (requirementLoading || !eiaFees || eiaFees.applicationId !== applicationId) return;
        const saved = getEiaAssessment(eiaFees.isEiaDevelopment, eiaFees.screeningOnly);
        setAssessment(saved && options.includes(saved) ? saved : '');
    }, [eiaFees, applicationId, requirementLoading, options]);

    useEffect(() => {
        if (errors.length > 0) errorSummaryRef.current?.focus();
    }, [errors]);

    const save = async (selected: EiaAssessment) => {
        const now = new Date().toISOString();
        const answers = toEiaAnswers(selected);
        if (eiaFees?.eiaFeeId) {
            await updateEiaFees({ eiaFeeId: eiaFees.eiaFeeId, applicationId, ...answers, updatedAt: now, updatedBy: userId });
        } else {
            await createEiaFees({
                eiaId: crypto.randomUUID(),
                applicationId,
                ...answers,
                createdAt: now,
                updatedAt: now,
                createdBy: userId,
                updatedBy: userId,
            });
        }
    };

    const handleSubmit = async (saveType: 'continue' | 'later') => {
        if (!userId) {
            setErrors([{ field: 'general', message: EIA_FEES_ERROR_MESSAGES.API.UNKNOWN_ERROR }]);
            return;
        }
        // Save for later keeps a chosen option but does not ask for one.
        if (saveType === 'later' && !assessment) {
            navigate(taskListUrl);
            return;
        }
        const validationErrors = validateAssessment(assessment, options);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        const selected = assessment as EiaAssessment;
        setSaving(true);
        try {
            await save(selected);
            if (saveType === 'later') navigate(taskListUrl);
            else if (selected === EIA_ASSESSMENT.FULL_EIA) navigate(`${S37_BASE_URL}/${applicationId}/eia-fees/upload-eia-report`);
            else navigate(getNextPageUrl(TASK_NAMES.EIA_FEES, applicationId));
        } catch {
            setErrors([{ field: 'general', message: EIA_FEES_ERROR_MESSAGES.API.SUBMIT_FAILED }]);
        } finally {
            setSaving(false);
        }
    };

    if (consultationsLoading || requirementLoading) {
        return <p className="govuk-body">Loading...</p>;
    }

    if (consultationsStarted) {
        return <EIAFeesSummary />;
    }

    return (
        <>
            <PageTitle title={EIA_CONTENT.PAGE_TITLE} />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <ErrorSummary ref={errorSummaryRef} errors={errors.map((e) => ({ fieldId: e.field, message: e.message }))} />
                    <h1 className="govuk-heading-l">{EIA_CONTENT.PAGE_TITLE}</h1>
                    <EiaGuidance mandatory={mandatory} highVoltage={highVoltage} sensitiveArea={sensitiveArea} />
                    <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit('continue'); }}>
                        <AssessmentOptions
                            options={options}
                            value={assessment}
                            onChange={(value) => { setAssessment(value); setErrors([]); }}
                            errorMessage={getFieldErrorMessage(EIAFeesErrorField.ASSESSMENT, errors)}
                        />
                        <div className="govuk-button-group">
                            <button type="submit" className="govuk-button" data-module="govuk-button" disabled={saving}>
                                Save and continue
                            </button>
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                disabled={saving}
                                onClick={() => handleSubmit('later')}
                            >
                                Save for later
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EIAFeesForm;
