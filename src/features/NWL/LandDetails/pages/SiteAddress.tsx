import React, { useState, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { 
  LandDetailsBreadcrumbs, 
  AddressFormFields, 
  FormActions, 
  ErrorSummary 
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import { LAND_DETAILS_LABELS } from '../constants';

const SiteAddress: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateSiteAddress, clearError } = useFormValidation();
  const { goToCountrySelection } = useLandNavigation(applicationId);
  const { updateProgress } = useNWLProgress(applicationId);

  const [formData, setFormData] = useState({
    addressLine1: landDetails.site_address_line1 || '',
    addressLine2: landDetails.site_address_line2 || '',
    town: landDetails.site_town || '',
    county: landDetails.site_county || '',
    postcode: landDetails.site_postcode || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  // Sync form with fetched data only if user selected "Yes" (same as objector)
  useEffect(() => {
    setFormData({
      addressLine1: landDetails.site_address_line1 || '',
      addressLine2: landDetails.site_address_line2 || '',
      town: landDetails.site_town || '',
      county: landDetails.site_county || '',
      postcode: landDetails.site_postcode || '',
    });
  }, [landDetails.site_address_line1, landDetails.site_address_line2, landDetails.site_town, landDetails.site_county, landDetails.site_postcode]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateSiteAddress(
      formData.addressLine1,
      formData.town,
      formData.postcode
    );

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await updateLandDetails({
        is_site_at_objector_address: false,
        site_address_line1: formData.addressLine1,
        site_address_line2: formData.addressLine2,
        site_town: formData.town,
        site_county: formData.county,
        site_postcode: formData.postcode,
      });

        try {
          await updateProgress('Site address', 'Completed');
        } catch (e) {
          // ignore progress errors
        }

      goToCountrySelection();
    } catch (error) {
      setSaveError("Failed to save site address. Please try again.");
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    addressLine1: 'address-line-1',
    town: 'town',
    postcode: 'postcode',
  };

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={LAND_DETAILS_LABELS.SITE_ADDRESS.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {saveError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{saveError}</p>
                </div>
              </div>
            )}
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{LAND_DETAILS_LABELS.SITE_ADDRESS.PAGE_TITLE}</h1>

            <form>
              <AddressFormFields
                addressLine1={formData.addressLine1}
                addressLine2={formData.addressLine2}
                town={formData.town}
                county={formData.county}
                postcode={formData.postcode}
                onChange={handleFieldChange}
                errors={errors}
              />

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

export default SiteAddress;
