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

  it('completes the meeting task and then locks a submitted request', () => {
    const id = 'app-1';
    store().saveMeeting(id, true, false, { answer: 'request-meeting', reason: '' });
    expect(progress(id)['Pre-submission meeting']).toBe('In progress');
    store().saveMeeting(id, true, true, { answer: 'request-meeting', reason: '' });
    expect(progress(id)['Pre-submission meeting']).toBe('Completed');
    expect(store().getApplication(id).pre_submission_meeting_requested_at).toBeTruthy();
    expect(() => store().saveMeeting(id, false, true, { answer: 'had-meeting', reason: '' })).toThrow('already been submitted');
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

  it('mirrors the notices progress saved through the API', () => {
    const id = 'app-1';
    store().syncApplicant(id, {}, [{ subsection_name: 'Record your notices', status: 'Completed' }]);
    expect(progress(id)['Record your notices']).toBe('Completed');
    store().syncApplicant(id, {}, [{ subsection_name: 'Record your notices', status: 'In progress' }]);
    expect(progress(id)['Record your notices']).toBe('In progress');
    store().syncApplicant(id, {}, []);
    expect(progress(id)['Record your notices']).toBeUndefined();
  });
});
