import React, { useState } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import {
  LandDetailsBreadcrumbs,
  FormActions,
} from '../components';
import {
  useLandDetailsData,
  useLandNavigation,
} from '../hooks';
import { LAND_DETAILS_LABELS } from '../constants';

const UploadSiteInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { goToEquipmentVisibility } = useLandNavigation(applicationId);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    try {
      updateLandDetails({});

      goToEquipmentVisibility();
    } catch (error) {
      setIsSaving(false);
    }
  };

  const labels = LAND_DETAILS_LABELS.UPLOAD_SITE_INFORMATION;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <p className="govuk-body">
              {labels.DESCRIPTION}
            </p>

            <form>
              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{labels.DOCUMENTS_UPLOADED}</h2>
                <div className="govuk-summary-card">
                  <div className="govuk-summary-card__content">
                    <dl className="govuk-summary-list">
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          <a href="#" className="govuk-link">photo.jpg</a>
                        </dt>
                        <dd className="govuk-summary-list__actions">
                          <a href="#" className="govuk-link">Delete</a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{labels.UPLOAD_SECTION_TITLE}</h2>
                <div className="govuk-hint">
                  {labels.UPLOAD_HINT}
                </div>
                <div className="govuk-file-upload" style={{ border: '2px dashed #b1b4b6', padding: '20px', textAlign: 'center', backgroundColor: '#f3f2f1' }}>
                  <p className="govuk-body" style={{ color: '#505a5f' }}>No file chosen</p>
                  <div className="govuk-button-group">
                    <button type="button" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                      Choose file
                    </button>
                    <span className="govuk-body">or drop file</span>
                  </div>
                </div>
              </div>

              <FormActions
                onSaveAndContinue={handleSaveAndContinue}
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadSiteInformation;
