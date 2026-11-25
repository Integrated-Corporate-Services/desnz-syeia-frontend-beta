import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Enter your postal address';
const EMPTY = { addressLine1: '', addressLine2: '', town: '', county: '', postcode: '' };

/** SYEIA-2930 AC9: the address typed in by hand. */
const ManualAddressPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, goNext } = useObjectionForm();
  const [address, setAddress] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (journey && !loaded) {
      const saved = journey.address;
      setAddress(saved
        ? { addressLine1: saved.line1, addressLine2: saved.line2, town: saved.town, county: saved.county, postcode: saved.postcode }
        : { ...EMPTY, postcode: journey.addressSearch.postcode });
      setLoaded(true);
    }
  }, [journey, loaded]);

  const update = (field: keyof typeof EMPTY) => (value: string) => setAddress((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await save(() => publicObjectionService.saveAddress(address))) goNext(OBJECTION_ROUTES.WHO_IS_OBJECTING);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.ADDRESS} errors={errors}>
      {journey && (
        <>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <form onSubmit={submit} noValidate>
            <QuestionInput id="address-line-1" label="Address line 1" isPageHeading={false} widthClass="govuk-!-width-full" autoComplete="address-line1" value={address.addressLine1} onChange={update('addressLine1')} error={errorFor('address-line-1')} />
            <QuestionInput id="address-line-2" label="Address line 2 (optional)" isPageHeading={false} widthClass="govuk-!-width-full" autoComplete="address-line2" value={address.addressLine2} onChange={update('addressLine2')} error={errorFor('address-line-2')} />
            <QuestionInput id="town" label="Town or city" isPageHeading={false} widthClass="govuk-!-width-two-thirds" autoComplete="address-level2" value={address.town} onChange={update('town')} error={errorFor('town')} />
            <QuestionInput id="county" label="County (optional)" isPageHeading={false} widthClass="govuk-!-width-two-thirds" value={address.county} onChange={update('county')} error={errorFor('county')} />
            <QuestionInput id="postcode" label="Postcode" isPageHeading={false} widthClass="govuk-input--width-10" autoComplete="postal-code" value={address.postcode} onChange={update('postcode')} error={errorFor('postcode')} />
            <button className="govuk-button" type="submit" disabled={saving}>Save and continue</button>
          </form>
        </>
      )}
    </ObjectionPage>
  );
};

export default ManualAddressPage;
