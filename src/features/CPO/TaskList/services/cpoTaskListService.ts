// LOCAL (frontend-only) MODE: data comes from the Zustand CPO store. The backend calls are kept commented for later.
import { useCpoStore } from '../../store/useCpoStore';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';
// import { applicationApiService } from '../../../../services/applicationApiService';
// import { progressApiService } from '../../../../services/progressApiService';
import type { CpoTaskListData } from '../types/cpoTaskList';

export const cpoTaskListService = {
  async load(applicationId: string): Promise<CpoTaskListData> {
    await syncApplicantFromBackend(applicationId, true);
    const { getApplication, getProgress } = useCpoStore.getState();
    return { application: getApplication(applicationId), progress: getProgress(applicationId) };
    // const [application, progress] = await Promise.all([
    //   applicationApiService.getApplicationById(applicationId),
    //   progressApiService.fetchApplicationProgress(applicationId),
    // ]);
    // if (application.type !== 'CPO') throw new Error('Not a CPO application');
    // return { application, progress };
  },
};
