import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import type { CpoTaskListData } from '../types/cpoTaskList';

export const cpoTaskListService = {
  async load(applicationId: string): Promise<CpoTaskListData> {
    const [application, progress] = await Promise.all([
      applicationApiService.getApplicationById(applicationId),
      progressApiService.fetchApplicationProgress(applicationId),
    ]);
    if (application.type !== 'CPO') throw new Error('Not a CPO application');
    return { application, progress };
  },
};
