import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import LPAModificationsQuestion from "../components/LPAModificationsQuestion";
import FormButtons from "../components/FormButtons";

const PostConsultation: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = params.applicationId || params.id;

  const [lpaModifications, setLpaModifications] = useState<string>("");
  const [acceptConditions, setAcceptConditions] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent, saveType: 'continue' | 'later') => {
    e.preventDefault();
    
    // TODO: Save post consultation data
    // await savePostConsultationData(applicationId, { lpaModifications, acceptConditions });
    
    if (saveType === 'continue') {
      navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
    } else {
      // Save for later - stay on page or show confirmation
      console.log("Saved for later");
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="true">
              Post consultation actions
            </li>
          </ol>
        </nav>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Post consultation actions</h1>

            <form noValidate>
              <LPAModificationsQuestion
                lpaModifications={lpaModifications}
                acceptConditions={acceptConditions}
                explanation={explanation}
                onLpaModificationsChange={setLpaModifications}
                onAcceptConditionsChange={setAcceptConditions}
                onExplanationChange={setExplanation}
              />

              <FormButtons
                onSaveLater={(e) => handleSubmit(e, 'later')}
                onSaveContinue={(e) => handleSubmit(e, 'continue')}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostConsultation;
