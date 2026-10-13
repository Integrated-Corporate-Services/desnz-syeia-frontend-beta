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
    expect(progress(id)).toEqual({ 'Applicant details': 'Completed' });
    store().syncApplicant(id, {}, []);
    expect(progress(id)).toEqual({});
    expect(store().getApplication(id).desnz_ref).toBe('CPO00001');
  });

  it('mirrors the meeting answer and progress saved through the API', () => {
    const id = 'app-1';
    store().syncApplicant(id, {
      pre_submission_meeting_requested: true, pre_submission_meeting_answer: 'request-meeting', pre_submission_meeting_reason: null,
      pre_submission_meeting_requested_at: '2026-10-06T12:00:00Z', pre_submission_meeting_completed_at: '2026-10-06T12:00:00Z',
    } as any, [{ subsection_name: 'Pre-submission meeting', status: 'Completed' }]);
    expect(progress(id)['Pre-submission meeting']).toBe('Completed');
    expect(store().getApplication(id)).toMatchObject({
      pre_submission_meeting_requested: true, pre_submission_meeting_answer: 'request-meeting', pre_submission_meeting_reason: '',
      pre_submission_meeting_requested_at: '2026-10-06T12:00:00Z',
    });
    store().syncApplicant(id, {}, []);
    expect(progress(id)['Pre-submission meeting']).toBeUndefined();
    expect(store().getApplication(id).pre_submission_meeting_requested_at).toBeNull();
  });

  it('completes order details only from the check step with a title and purpose', () => {
    const id = 'app-1';
    store().saveOrderDetails(id, 'name', { orderName: 'North Ridge CPO' }, false);
    expect(progress(id)['Order details']).toBe('In progress');
    store().saveOrderDetails(id, 'purpose', { purpose: 'Acquire rights' }, false);
    expect(progress(id)['Order details']).toBe('In progress');
    expect(store().saveOrderDetails(id, 'check', {}, false).details).toMatchObject({ orderName: 'North Ridge CPO', purpose: 'Acquire rights' });
    expect(progress(id)['Order details']).toBe('Completed');
  });

  it('completes the executive summary without an uploaded file', () => {
    const id = 'app-1';
    store().saveOrderDetails(id, 'executive-summary', {}, true);
    expect(progress(id)['Executive summary']).toBe('In progress');
    store().saveOrderDetails(id, 'executive-summary', {}, false);
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
