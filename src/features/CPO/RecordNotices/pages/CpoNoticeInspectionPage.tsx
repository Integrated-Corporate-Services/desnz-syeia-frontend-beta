import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import DateInput from '../components/DateInput';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import { cpoNoticesService } from '../services/cpoNoticesService';
import type { InspectionAddress, NoticesResponse } from '../types/notices';
import { inspectionAddresses, inspectionAddressText, noticeDateText, validNoticeDate } from '../utils/noticeRecord';

const emptyAddress = (): InspectionAddress => ({ id: crypto.randomUUID(), line1: '', line2: '', townCity: '', postcode: '', from: '' });
type FormError = { id: string; message: string };

const CpoNoticeInspectionPage = () => {
  const applicationId = useCpoApplicationId();
  const { noticeStep = 'inspection' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const base = `/cpo/${applicationId}/record-notices`;
  const returnQuery = params.get('from') ? `?from=${params.get('from')}` : '';
  const entryUrl = (step: string, id: string) => `${base}/${step}?id=${id}${params.get('from') ? `&from=${params.get('from')}` : ''}`;
  const [data, setData] = useState<NoticesResponse | null>(null);
  const [address, setAddress] = useState<InspectionAddress>(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const summary = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const list = inspectionAddresses(data?.record.inspection);
  const addressPage = noticeStep === 'inspection-address';
  const datePage = noticeStep === 'inspection-date';
  const heading = addressPage ? 'Enter an address where the order and maps can be inspected'
    : datePage ? 'Enter the date the order and maps were made available for inspection at this address' : 'Record order inspection addresses';
  const blocked = loading || saving || !data || data.canEdit === false;
  const back = addressPage || datePage ? `${base}/inspection${returnQuery}` : params.get('from') ? `${base}/check${returnQuery}` : `${base}/requirements`;

  useEffect(() => {
    let active = true;
    setLoading(true); setErrors([]); setData(null);
    cpoNoticesService.get(applicationId).then(result => {
      if (!active) return;
      const saved = inspectionAddresses(result.record.inspection).find(item => item.id === params.get('id'));
      if (params.get('id') && !saved) throw new Error('Inspection address not found. Return to the address list.');
      if (datePage && !saved) throw new Error('Add an inspection address before entering its date.');
      setData(result); setAddress(saved || emptyAddress());
    }).catch(() => { if (active) setErrors([{ id: 'inspection-heading', message: 'Unable to load inspection addresses. Return to the address list or refresh the page.' }]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, noticeStep, params.get('id')]);
  useEffect(() => { if (errors.length) summary.current?.focus(); }, [errors]);
  useEffect(() => { if (!loading && data) headingRef.current?.focus(); }, [loading, data]);

  const save = async (later: boolean) => {
    if (blocked) return;
    const problems: FormError[] = [];
    if (addressPage) {
      for (const [id, label] of [['line1', 'address line 1'], ['townCity', 'town or city'], ['postcode', 'postcode']] as const) {
        if (!address[id]?.trim()) problems.push({ id, message: `Enter ${label}` });
      }
    } else if (datePage && !validNoticeDate(address.from)) problems.push({ id: 'inspection-date-day', message: 'Enter a valid inspection availability date' });
    else if (!addressPage && !datePage && !later && (!list.length || list.some(item => !validNoticeDate(item.from)))) problems.push({ id: 'inspection-heading', message: list.length ? 'Enter an availability date for every inspection address' : 'Add at least one inspection address' });
    if (problems.length) { setErrors(problems); return; }
    setSaving(true); setErrors([]);
    try {
      const savedAddress = addressPage ? { ...address, line1: address.line1.trim(), line2: address.line2.trim(), townCity: address.townCity.trim(), postcode: address.postcode.trim().toUpperCase(), legacyAddress: '' } : address;
      const addresses = addressPage || datePage ? list.some(item => item.id === address.id)
        ? list.map(item => item.id === address.id ? savedAddress : item) : [...list, savedAddress] : list;
      await cpoNoticesService.save(applicationId, 'inspection', { ...data?.record.inspection, format: 'reference', addresses }, later || addressPage || datePage);
      if (later) navigate('/application-dashboard');
      else if (addressPage) navigate(entryUrl('inspection-date', address.id));
      else if (datePage) navigate(`${base}/inspection${returnQuery}`);
      else navigate(`${base}/${params.get('from') ? 'check' : 'online'}${params.get('from') === 'application-review' ? '?from=application-review' : ''}`);
    } catch (failure) { setErrors([{ id: 'inspection-heading', message: failure instanceof Error ? failure.message : 'Unable to save the inspection address. Try again.' }]); }
    finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (blocked) return;
    setSaving(true); setErrors([]);
    try { setData(await cpoNoticesService.save(applicationId, 'inspection', { ...data?.record.inspection, format: 'reference', addresses: list.filter(item => item.id !== id) }, true)); }
    catch { setErrors([{ id: 'inspection-heading', message: 'Unable to remove the address. Try again.' }]); }
    finally { setSaving(false); }
  };
  const field = (id: 'line1' | 'line2' | 'townCity' | 'postcode', label: string, width = '') => <div className={`govuk-form-group${errors.some(error => error.id === id) ? ' govuk-form-group--error' : ''}`}>
    <label className="govuk-label" htmlFor={id}>{label}</label>
    {errors.filter(error => error.id === id).map(error => <p className="govuk-error-message" id={`${id}-error`} key={id}><span className="govuk-visually-hidden">Error:</span> {error.message}</p>)}
    <input className={`govuk-input${errors.some(error => error.id === id) ? ' govuk-input--error' : ''} ${width}`} id={id} value={address[id]} autoComplete={id === 'line1' ? 'address-line1' : id === 'line2' ? 'address-line2' : id === 'townCity' ? 'address-level2' : 'postal-code'} maxLength={id === 'postcode' ? 10 : id === 'townCity' ? 200 : 250} aria-describedby={errors.some(error => error.id === id) ? `${id}-error` : undefined} onChange={event => setAddress(current => ({ ...current, [id]: event.target.value }))} />
  </div>;
  return <>
    <PageTitle title={errors.length ? `Error: ${heading}` : heading} />
    <div className="govuk-width-container"><Link className="govuk-back-link govuk-!-margin-bottom-6" to={back}>Back</Link><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {!!errors.length && <div className="govuk-error-summary" ref={summary} role="alert" tabIndex={-1}><h2 className="govuk-error-summary__title">There is a problem</h2><div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map(error => <li key={error.id}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div></div>}
      <span className="govuk-caption-l">Record your notices</span><h1 className="govuk-heading-l" id="inspection-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
      {loading && <p className="govuk-body" role="status">Loading inspection addresses...</p>}
      {data?.canEdit === false && <p className="govuk-body">You can view these inspection addresses but cannot change them.</p>}
      <form noValidate onSubmit={event => { event.preventDefault(); void save(false); }}><fieldset className="govuk-fieldset" disabled={blocked}>
        <legend className="govuk-visually-hidden">{heading}</legend>
        {addressPage ? <>{field('line1', 'Address line 1')}{field('line2', 'Address line 2 (optional)')}{field('townCity', 'Town or city', 'govuk-input--width-20')}{field('postcode', 'Postcode', 'govuk-input--width-10')}</>
          : datePage ? <><p className="govuk-body">{inspectionAddressText(address)}</p><DateInput id="inspection-date" hideLabel label="Available to inspect from" value={address.from} onChange={from => setAddress(current => ({ ...current, from }))} error={errors.find(error => error.id === 'inspection-date-day')?.message} /></>
            : <><p className="govuk-body">Your public notices must list at least one place where people can inspect the order and maps.</p>
              {list.map((item, index) => <section className="govuk-summary-card govuk-!-margin-bottom-4" key={item.id}><div className="govuk-summary-card__title-wrapper"><h2 className="govuk-summary-card__title">Inspection address {index + 1}</h2>{data?.canEdit !== false && <button type="button" className="govuk-link cpo-notice-text-action" onClick={() => void remove(item.id)}>Remove<span className="govuk-visually-hidden"> inspection address {index + 1}</span></button>}</div><div className="govuk-summary-card__content"><dl className="govuk-summary-list">
                <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Address</dt><dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{inspectionAddressText(item)}</dd>{data?.canEdit !== false && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={entryUrl('inspection-address', item.id)}>Change<span className="govuk-visually-hidden"> inspection address {index + 1}</span></Link></dd>}</div>
                <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Available to inspect from</dt><dd className="govuk-summary-list__value">{noticeDateText(item.from)}</dd>{data?.canEdit !== false && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={entryUrl('inspection-date', item.id)}>Change<span className="govuk-visually-hidden"> availability date for inspection address {index + 1}</span></Link></dd>}</div>
              </dl></div></section>)}
              {data?.canEdit !== false && <Link className="govuk-button govuk-button--secondary" to={`${base}/inspection-address${returnQuery}`}>Add an address</Link>}
            </>}
        {data?.canEdit !== false && <div className="govuk-button-group"><button className="govuk-button" type="submit">{addressPage || datePage ? 'Continue' : 'Save and continue'}</button>{!addressPage && !datePage && <button className="govuk-button govuk-button--secondary" type="button" onClick={() => void save(true)}>Save for later</button>}</div>}
      </fieldset></form>
    </div></div></div>
  </>;
};

export default CpoNoticeInspectionPage;