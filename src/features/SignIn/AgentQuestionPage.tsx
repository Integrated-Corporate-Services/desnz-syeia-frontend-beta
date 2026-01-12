import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useGetAccessRequest } from "../../hooks/useGetAccessRequest";

const AgentQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const { saveAccessRequest, isLoading } = useSaveAccessRequest();
  
  // Fetch existing access request data
  const { data: existingRequest, isLoading: isLoadingRequest } = useGetAccessRequest(user?.email);

  const [isAgent, setIsAgent] = useState<boolean | null>(
    formData.isAgent !== undefined ? formData.isAgent : null
  );
  const [error, setError] = useState<string>("");

  // Update form data from existing access request if available
  useEffect(() => {
    if (existingRequest && existingRequest.is_agent !== undefined) {
      setIsAgent(existingRequest.is_agent);
      updateFormData({ isAgent: existingRequest.is_agent });
    }
  }, [existingRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAgent === null) {
      setError("Select whether you are an agent or an employee");
      return;
    }

    try {
      // Save to backend
      await saveAccessRequest({
        email: formData.email!,
        isAgent,
      });

      // Update store
      updateFormData({ isAgent });

      // Navigate based on selection
      if (isAgent) {
        navigate("/request-access/company-name");
      } else {
        navigate("/request-access/select-organisation");
      }
    } catch (error) {
      setError("Failed to save. Please try again.");
    }
  };

  const handleChange = (value: boolean) => {
    setIsAgent(value);
    setError("");
  };

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access/work-address"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access/work-address");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {isLoadingRequest ? (
              <p className="govuk-body">Loading your details...</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}
              >
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby="agent-hint"
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      Are you an agent representing an organisation?
                    </h1>
                  </legend>

                  {error && (
                    <p id="agent-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}

                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="agent-yes"
                        name="isAgent"
                        type="radio"
                        value="yes"
                        checked={isAgent === true}
                        onChange={() => handleChange(true)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="agent-yes"
                      >
                        Yes, I am an agent
                      </label>
                      <div
                        id="agent-yes-hint"
                        className="govuk-hint govuk-radios__hint"
                      >
                        You act as an agent on behalf of one or more
                        organisations
                      </div>
                    </div>

                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="agent-no"
                        name="isAgent"
                        type="radio"
                        value="no"
                        checked={isAgent === false}
                        onChange={() => handleChange(false)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="agent-no"
                      >
                        No, I am an employee
                      </label>
                      <div
                        id="agent-no-hint"
                        className="govuk-hint govuk-radios__hint"
                      >
                        You're an employee of the organisation that submits its
                        own applications
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save and continue"}
              </button>
            </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentQuestionPage;
