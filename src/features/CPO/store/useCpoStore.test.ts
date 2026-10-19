import { beforeEach, describe, expect, it } from 'vitest';
import { resetCpoStore } from './testHelpers';
import { useCpoStore } from './useCpoStore';

const store = () => useCpoStore.getState();
const progress = (id: string) => Object.fromEntries(store().getProgress(id).map(item => [item.subsection_name, item.status]));

describe('CPO local store journey', () => {
  beforeEach(() => resetCpoStore());

  it('opens an unknown application id as a local CPO draft with a placeholder reference', () => {
    expect(store().getApplication('typed-in-url')).toMatchObject({ type: 'CPO', status: 'DRAFT', desnz_ref: expect.stringMatching(/^CPO-\d{4}-0001$/) });
  });

  it('copies the applicant details and progress saved through the API, replacing stale applicant progress', () => {
    const id = 'app-1';
    store().syncApplicant(id, { desnz_ref: 'CPO00001', operator_ref: 'REF-1', application_party: { organisation_name: 'Grid Operator', contact_person_name: 'Alex Smith' } as any }, [
      { subsection_name: 'Applicant details', status: 'Completed' }, { subsection_name: 'Order details', status: 'Completed' },
    ]);
    expect(store().getApplication(id)).toMatchObject({ desnz_ref: 'CPO00001', operator_ref: 'REF-1', application_party: { contact_person_name: 'Alex Smith' } });
    expect(progress(id)).toEqual({ 'Applicant details': 'Completed', 'Order details': 'Completed' });
    store().syncApplicant(id, {}, []);
    expect(progress(id)).toEqual({});
    expect(store().getApplication(id).desnz_ref).toBe('CPO00001');
  });

  it('completes the meeting task and then locks a submitted request', () => {
    const id = 'app-1';
    store().saveMeeting(id, true, false, { answer: 'request-meeting', reason: '' });
    expect(progress(id)['Pre-submission meeting']).toBe('In progress');
    store().saveMeeting(id, true, true, { answer: 'request-meeting', reason: '' });
    expect(progress(id)['Pre-submission meeting']).toBe('Completed');
    expect(store().getApplication(id).pre_submission_meeting_requested_at).toBeTruthy();
    expect(() => store().saveMeeting(id, false, true, { answer: 'had-meeting', reason: '' })).toThrow('already been submitted');
  });

  it('mirrors saved order details and only invalidates Order documents when a land answer changes', () => {
    const id = 'app-1';
    const details = { orderName: 'North Ridge CPO', purpose: 'Acquire rights', includesSpecialLand: false, exchangeLand: null, hasRelatedApplications: null, relatedApplications: [] };
    store().syncOrderDetails(id, details);
    expect(store().applications[id].orderDetails).toMatchObject({ orderName: 'North Ridge CPO', includesSpecialLand: false });
    store().saveOrderDocuments(id, 'check', false, true);
    store().syncOrderDetails(id, { ...details, orderName: 'Renamed' }, 'name');
    expect(progress(id)['Order documents']).toBe('Completed');
    store().syncOrderDetails(id, { ...details, includesSpecialLand: true }, 'special-land');
    expect(progress(id)['Order documents']).toBe('In progress');
    expect(store().applications[id].orderDetails.includesSpecialLand).toBe(true);
  });

  it('completes the executive summary without an uploaded file', () => {
    const id = 'app-1';
    store().saveExecutiveSummary(id, true);
    expect(progress(id)['Executive summary']).toBe('In progress');
    store().saveExecutiveSummary(id, false);
    expect(progress(id)['Executive summary']).toBe('Completed');
  });

  it('completes order documents from the confirmed check step without uploaded files', () => {
    const id = 'app-1';
    store().saveOrderDocuments(id, 'order', false, null);
    store().saveOrderDocuments(id, 'reasons', false, null);
    expect(progress(id)['Order documents']).toBe('In progress');
    store().saveOrderDocuments(id, 'check', false, true);
    expect(progress(id)['Order documents']).toBe('Completed');
  });

  it('completes notices once the typed answers are recorded and confirmed, without uploaded files', () => {
    const id = 'app-1';
    expect(() => store().saveNotices(id, 'check', { format: 'reference', confirmed: true }, false)).toThrow('acknowledge');
    store().saveNotices(id, 'requirements', { format: 'reference', acknowledged: true }, false);
    store().saveNotices(id, 'inspection', { format: 'reference', addresses: [{ id: 'a', line1: '1 Street', line2: '', townCity: 'London', postcode: 'SE1 1AA', from: '2026-10-07' }] }, false);
    expect(() => store().saveNotices(id, 'check', { format: 'reference' }, false)).toThrow('website address');
    store().saveNotices(id, 'online', { format: 'reference', url: 'https://example.gov.uk/order' }, false);
    store().saveNotices(id, 'newspapers', { format: 'reference', firstDate: '2026-10-07', secondDate: '2026-10-14' }, false);
    store().saveNotices(id, 'site', { format: 'reference', completionDate: '2026-10-15' }, false);
    expect(progress(id)['Record your notices']).toBe('In progress');
    const result = store().saveNotices(id, 'check', { format: 'reference' }, false);
    expect(progress(id)['Record your notices']).toBe('Completed');
    expect(result).toMatchObject({ finalObjectionDate: '2026-11-05', reference: store().getApplication(id).desnz_ref });
    expect(store().getApplication(id).cpo_publicity).toMatchObject({ requirements: { acknowledged: true }, check: { confirmed: true } });
    store().saveNotices(id, 'online', { format: 'reference', url: 'https://example.gov.uk/changed' }, false);
    expect(progress(id)['Record your notices']).toBe('In progress');
    expect(store().getApplication(id).cpo_publicity.check?.confirmed).toBe(false);
  });
});
