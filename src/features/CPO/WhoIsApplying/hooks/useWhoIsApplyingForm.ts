import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplication } from '../../../../hooks/useApplication';
import { applicationApiService } from '../../../../services/applicationApiService';
import type { AuthUser } from '../../../../types/auth';
import type { NewApplication } from '../../../../types/application';
import type { OrganizationOption } from './useNetworkOperators';

export const useWhoIsApplyingForm = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const draftId = searchParams.get('applicationId');
  const { createNewApplication } = useApplication();
  const applicationId = useRef<string | null>(draftId);
  const submitting = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(draftId));
  const [loadFailed, setLoadFailed] = useState(false);
  const [organisationId, setOrganisationId] = useState('');

  useEffect(() => {
    if (!draftId || submitting.current) return;
    let active = true;
    setLoading(true);
    applicationApiService.getApplicationById(draftId).then(application => {
      if (!active) return;
      if (application.type !== 'CPO' || application.status?.toLowerCase() !== 'draft' || application.permissions?.canEdit === false) {
        throw new Error('This application cannot be updated.');
      }
      applicationId.current = draftId;
      setOrganisationId(application.application_party?.organisation_id || '');
      setLoadFailed(false);
    }).catch(() => {
      if (active) { setLoadFailed(true); setSubmitted(true); setError('Unable to load the application. Refresh the page to try again.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [draftId]);

  const handleSubmit = async (event: FormEvent, organisation: OrganizationOption | null, user: AuthUser | null) => {
    event.preventDefault();
    if (submitting.current || loading || loadFailed) return;
    setSubmitted(true);
    if (!organisation) {
      setError('Select an organisation');
      return;
    }
    setError('');
    submitting.current = true;
    setSaving(true);
    try {
      if (!applicationId.current) {
        const draft: NewApplication & { status: 'DRAFT'; operator_ref: string } = {
          type: 'CPO', status: 'DRAFT', operator_ref: '', created_by: user?.user_id || '',
        };
        const application = await createNewApplication(draft);
        if (!application?.application_id) throw new Error('Failed to create application');
        applicationId.current = application.application_id;
        setSearchParams({ applicationId: application.application_id }, { replace: true });
      }
      const id = applicationId.current;
      if (!id) throw new Error('Failed to create application');
      await applicationApiService.updateOrganisation(
        id,
        organisation.organisation_id,
        organisation.organisation_name,
        organisation.users[0]?.address_line1 || ''
      );
      navigate(`/cpo/${id}/applicant-details`);
    } catch {
      setError('Unable to save the application. Try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return { submitted, error, saving, loading, loadFailed, organisationId, handleSubmit, clearError: () => {
    if (!loadFailed) { setError(''); setSubmitted(false); }
  } };
};