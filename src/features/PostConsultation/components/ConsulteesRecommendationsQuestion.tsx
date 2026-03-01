import React from "react";

interface ConsulteesRecommendationsQuestionProps {
  consulteesRecommendations: string;
  acceptConsulteesRecommendations: string;
  consulteesExplanation: string;
  onConsulteesRecommendationsChange: (value: string) => void;
  onAcceptConsulteesRecommendationsChange: (value: string) => void;
  onConsulteesExplanationChange: (value: string) => void;
  consulteesRecommendationsError?: string;
  consulteesExplanationError?: string;
}

const ConsulteesRecommendationsQuestion: React.FC<
  ConsulteesRecommendationsQuestionProps
> = ({
  consulteesRecommendations,
  acceptConsulteesRecommendations,
  consulteesExplanation,
  onConsulteesRecommendationsChange,
  onAcceptConsulteesRecommendationsChange,
  onConsulteesExplanationChange,
  consulteesRecommendationsError,
  consulteesExplanationError,
}) => {
  return (
    <div
      className={`govuk-form-group${consulteesRecommendationsError ? " govuk-form-group--error" : ""}`}
    >
      <fieldset
        className="govuk-fieldset"
        aria-describedby={
          consulteesRecommendationsError
            ? "consultees-recommendations-error"
            : undefined
        }
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h2 className="govuk-fieldset__heading">
            Were any recommendations made or conditions requested by the
            consultees? (Not including the LPA)
          </h2>
        </legend>
        {consulteesRecommendationsError && (
          <p
            id="consultees-recommendations-error"
            className="govuk-error-message"
          >
            <span className="govuk-visually-hidden">Error:</span>{" "}
            {consulteesRecommendationsError}
          </p>
        )}
        <div className="govuk-radios" data-module="govuk-radios">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="consultees-recommendations-yes"
              name="consultees-recommendations"
              type="radio"
              value="yes"
              checked={consulteesRecommendations === "yes"}
              onChange={(e) =>
                onConsulteesRecommendationsChange(e.target.value)
              }
              data-aria-controls="conditional-consultees-recommendations-yes"
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="consultees-recommendations-yes"
            >
              Yes
            </label>
          </div>
          <div
            className={`govuk-radios__conditional ${consulteesRecommendations === "yes" ? "" : "govuk-radios__conditional--hidden"}`}
            id="conditional-consultees-recommendations-yes"
          >
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h3 className="govuk-fieldset__heading">
                    Do you accept the recommendations made by the consultees?
                  </h3>
                </legend>
                <div className="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="accept-consultees-recommendations-yes"
                      name="accept-consultees-recommendations"
                      type="radio"
                      value="yes"
                      checked={acceptConsulteesRecommendations === "yes"}
                      onChange={(e) =>
                        onAcceptConsulteesRecommendationsChange(e.target.value)
                      }
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="accept-consultees-recommendations-yes"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="accept-consultees-recommendations-no"
                      name="accept-consultees-recommendations"
                      type="radio"
                      value="no"
                      checked={acceptConsulteesRecommendations === "no"}
                      onChange={(e) =>
                        onAcceptConsulteesRecommendationsChange(e.target.value)
                      }
                      data-aria-controls="conditional-accept-consultees-recommendations-no"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="accept-consultees-recommendations-no"
                    >
                      No
                    </label>
                  </div>
                  <div
                    className={`govuk-radios__conditional ${acceptConsulteesRecommendations === "no" ? "" : "govuk-radios__conditional--hidden"}`}
                    id="conditional-accept-consultees-recommendations-no"
                  >
                    <div
                      className={`govuk-form-group${consulteesExplanationError ? " govuk-form-group--error" : ""}`}
                    >
                      <label
                        className="govuk-label govuk-label--s"
                        htmlFor="consultees-explanation"
                      >
                        Explain why you do not accept the consultees'
                        recommendations
                      </label>
                      {consulteesExplanationError && (
                        <p
                          id="consultees-explanation-error"
                          className="govuk-error-message"
                        >
                          <span className="govuk-visually-hidden">Error:</span>{" "}
                          {consulteesExplanationError}
                        </p>
                      )}
                      <textarea
                        className={`govuk-textarea${consulteesExplanationError ? " govuk-textarea--error" : ""}`}
                        id="consultees-explanation"
                        name="consultees-explanation"
                        rows={5}
                        value={consulteesExplanation}
                        onChange={(e) =>
                          onConsulteesExplanationChange(e.target.value)
                        }
                        aria-describedby={
                          consulteesExplanationError
                            ? "consultees-explanation-error"
                            : undefined
                        }
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
              id="consultees-recommendations-no"
              name="consultees-recommendations"
              type="radio"
              value="no"
              checked={consulteesRecommendations === "no"}
              onChange={(e) =>
                onConsulteesRecommendationsChange(e.target.value)
              }
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="consultees-recommendations-no"
            >
              No
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default ConsulteesRecommendationsQuestion;
