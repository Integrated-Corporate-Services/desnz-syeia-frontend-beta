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
import { saveSiteAddress } from '../services/landDetailsService';
import { LAND_DETAILS_LABELS } from '../constants';

const SiteAddress: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, isLoading } = useLandDetailsData(applicationId);
  const { errors, validateSiteAddress, clearError } = useFormValidation();
  const { goToCountrySelection } = useLandNavigation(applicationId);

  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    town: '',
    county: '',
    postcode: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing data from backend
  useEffect(() => {
    if (landDetails) {
      setFormData({
        addressLine1: landDetails.site_address_line1 || '',
        addressLine2: landDetails.site_address_line2 || '',
        town: landDetails.site_town || '',
        county: landDetails.site_county || '',
        postcode: landDetails.site_postcode || '',
      });
    }
  }, [landDetails]);

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

    if (!applicationId) return;

    setIsSaving(true);

    try {
      await saveSiteAddress(applicationId, {
        site_address_line1: formData.addressLine1,
        site_address_line2: formData.addressLine2,
        site_town: formData.town,
        site_county: formData.county,
        site_postcode: formData.postcode,
      });

      goToCountrySelection();
    } catch (error) {
      console.error('Error saving site address:', error);
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
