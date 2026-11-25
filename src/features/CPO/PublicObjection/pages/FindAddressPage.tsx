import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Find your postal address';

/** SYEIA-2930: postcode lookup, with manual entry when the lookup finds nothing or is unavailable. */
const FindAddressPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [postcode, setPostcode] = useState('');
  const [property, setProperty] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (journey && !loaded) {
      setPostcode(journey.addressSearch.postcode);
      setProperty(journey.addressSearch.property);
      setLoaded(true);
    }
  }, [journey, loaded]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await save(() => publicObjectionService.searchAddress(postcode, property));
    if (result?.addressSearch.status === 'found') navigate(OBJECTION_ROUTES.CHOOSE_ADDRESS);
    else if (result) setSearched(true);
  };

  // The "no addresses" and "unavailable" messages belong to the search just made, not to an earlier visit.
  const status = searched ? journey?.addressSearch.status : null;

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.CHECK_EMAIL} errors={errors}>
      {journey && (
        <>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <p className="govuk-body">
            We will use this address on official letters we send you about the CPO. We usually send these letters as
            attachments via email to the address you have provided.
          </p>
          {status === 'none' && (
            <div className="govuk-inset-text" role="status">
              We could not find any addresses for {journey.addressSearch.postcode}. Check the postcode or{' '}
              <Link className="govuk-link" to={OBJECTION_ROUTES.MANUAL_ADDRESS}>enter the address manually</Link>.
            </div>
          )}
          {status === 'unavailable' && (
            <div className="govuk-inset-text" role="status">
              Sorry, we cannot find addresses at the moment.{' '}
              <Link className="govuk-link" to={OBJECTION_ROUTES.MANUAL_ADDRESS}>Enter the address manually</Link>.
            </div>
          )}
          <form onSubmit={submit} noValidate>
            <QuestionInput
              id="postcode"
              label="Enter your postcode"
              isPageHeading={false}
              widthClass="govuk-input--width-10"
              autoComplete="postal-code"
              value={postcode}
              onChange={(value) => { setPostcode(value); setSearched(false); }}
              error={errorFor('postcode')}
            />
            <QuestionInput
              id="property"
              label="Enter your property name or number (optional)"
              hint="For example, The Mill, 116 or Flat 37a."
              isPageHeading={false}
              value={property}
              onChange={setProperty}
              error={errorFor('property')}
            />
            <p className="govuk-body">
              <Link className="govuk-link" to={OBJECTION_ROUTES.MANUAL_ADDRESS}>Enter the address manually</Link>
            </p>
            <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
          </form>
        </>
      )}
    </ObjectionPage>
  );
};

export default FindAddressPage;
