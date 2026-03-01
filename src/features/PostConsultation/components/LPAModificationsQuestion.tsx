import React from 'react';

interface LPAModificationsQuestionProps {
    lpaModifications: string;
    acceptConditions: string;
    explanation: string;
    onLpaModificationsChange: (value: string) => void;
    onAcceptConditionsChange: (value: string) => void;
    onExplanationChange: (value: string) => void;
    lpaModificationsError?: string;
    explanationError?: string;
}

const LPAModificationsQuestion: React.FC<LPAModificationsQuestionProps> = ({ lpaModifications, acceptConditions, explanation, onLpaModificationsChange, onAcceptConditionsChange, onExplanationChange, lpaModificationsError, explanationError }) => {
    return (
        <div className={`govuk-form-group${lpaModificationsError ? ' govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={lpaModificationsError ? 'lpa-modifications-error' : undefined}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">Was the Local Planning Authority's (LPA) agreement to the proposal subject to modifications or conditions being applied to the consent?</h2>
                </legend>
                {lpaModificationsError && (
                    <p id="lpa-modifications-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {lpaModificationsError}
                    </p>
                )}
                <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id="lpa-modifications-yes"
                            name="lpa-modifications"
                            type="radio"
                            value="yes"
                            checked={lpaModifications === 'yes'}
                            onChange={(e) => onLpaModificationsChange(e.target.value)}
                            data-aria-controls="conditional-lpa-modifications-yes"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="lpa-modifications-yes">
                            Yes
                        </label>
                    </div>
                    <div className={`govuk-radios__conditional ${lpaModifications === 'yes' ? '' : 'govuk-radios__conditional--hidden'}`} id="conditional-lpa-modifications-yes">
                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                                    <h3 className="govuk-fieldset__heading">Do you accept all the conditions imposed by the LPA?</h3>
                                </legend>
                                <div className="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="accept-conditions-yes"
                                            name="accept-conditions"
                                            type="radio"
                                            value="yes"
                                            checked={acceptConditions === 'yes'}
                                            onChange={(e) => onAcceptConditionsChange(e.target.value)}
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="accept-conditions-yes">
                                            Yes
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="accept-conditions-no"
                                            name="accept-conditions"
                                            type="radio"
                                            value="no"
                                            checked={acceptConditions === 'no'}
                                            onChange={(e) => onAcceptConditionsChange(e.target.value)}
                                            data-aria-controls="conditional-accept-conditions-no"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="accept-conditions-no">
                                            No
                                        </label>
                                    </div>
                                    <div className={`govuk-radios__conditional ${acceptConditions === 'no' ? '' : 'govuk-radios__conditional--hidden'}`} id="conditional-accept-conditions-no">
                                        <div className={`govuk-form-group${explanationError ? ' govuk-form-group--error' : ''}`}>
                                            <label className="govuk-label govuk-label--s" htmlFor="explanation">
                                                Explain why you do not accept all the LPA's conditions
                                            </label>
                                            {explanationError && (
                                                <p id="explanation-error" className="govuk-error-message">
                                                    <span className="govuk-visually-hidden">Error:</span> {explanationError}
                                                </p>
                                            )}
                                            <textarea
                                                className={`govuk-textarea${explanationError ? ' govuk-textarea--error' : ''}`}
                                                id="explanation"
                                                name="explanation"
                                                rows={5}
                                                value={explanation}
                                                onChange={(e) => onExplanationChange(e.target.value)}
                                                aria-describedby={explanationError ? 'explanation-error' : undefined}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id="lpa-modifications-no"
                            name="lpa-modifications"
                            type="radio"
                            value="no"
                            checked={lpaModifications === 'no'}
                            onChange={(e) => {
                                onLpaModificationsChange(e.target.value);
                                onAcceptConditionsChange('');
                                onExplanationChange('');
                            }}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="lpa-modifications-no">
                            No
                        </label>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default LPAModificationsQuestion;
