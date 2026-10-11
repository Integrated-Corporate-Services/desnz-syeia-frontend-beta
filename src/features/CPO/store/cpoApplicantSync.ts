import { applicationApiService } from '../../../services/applicationApiService';
import { progressApiService } from '../../../services/progressApiService';
import { useCpoStore } from './useCpoStore';

const synced = new Set<string>();

// Applicant pages use the real API; this copies their result into the store for the local-only sections.
export const syncApplicantFromBackend = async (applicationId: string, force = false) => {
  if (!force && synced.has(applicationId)) return;
  try {
    const [application, progress] = await Promise.all([
      applicationApiService.getApplicationById(applicationId),
      progressApiService.fetchApplicationProgress(applicationId),
    ]);
    useCpoStore.getState().syncApplicant(applicationId, application, Array.isArray(progress) ? progress : []);
    synced.add(applicationId);
  } catch {
    // Backend unavailable: keep whatever the store already holds.
  }
};
