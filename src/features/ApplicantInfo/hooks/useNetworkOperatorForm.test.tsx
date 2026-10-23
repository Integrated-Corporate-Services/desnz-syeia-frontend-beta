import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNetworkOperatorForm as useS37Form } from './useNetworkOperatorForm';
import { useNetworkOperatorForm as useNwlForm } from '../../NWL/ApplicantInfo/hooks/useNetworkOperatorForm';
import type { ApplicationParty } from '../../../types/application';

const contact = {
  person_id: 'person-1', organisation_id: 'org-1', person_name: 'Eligible Applicant',
  party_type: 'Network Operator', line1: '', is_primary: true,
} as ApplicationParty;

describe.each([['S37', useS37Form], ['NWL', useNwlForm]] as const)('%s applicant contact validation', (_type, useForm) => {
  it('accepts a contact in the current backend-filtered options', () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.setSelectedOrgName(contact.person_name!);
      result.current.setSelectedOrganisation(contact);
    });
    let valid = false;
    act(() => { valid = result.current.validateForm([contact]); });
    expect(valid).toBe(true);
  });

  it('rejects a stale selected contact removed by backend eligibility filtering', () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.setSelectedOrgName('Former Superuser Contact');
      result.current.setSelectedOrganisation({ ...contact, person_id: 'superuser-person' });
    });
    let valid = true;
    act(() => { valid = result.current.validateForm([contact]); });
    expect(valid).toBe(false);
    expect(result.current.showErrorSummary).toBe(true);
  });

  it('rejects a name without a current selected contact', () => {
    const { result } = renderHook(() => useForm());
    act(() => { result.current.setSelectedOrgName('Former Superuser Contact'); });
    let valid = true;
    act(() => { valid = result.current.validateForm([contact]); });
    expect(valid).toBe(false);
  });
});