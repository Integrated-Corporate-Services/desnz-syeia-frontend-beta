import { create } from 'zustand';

import { progressApiService } from '../services/progressApiService';
import { applicationApiService } from '../services/applicationApiService';
import { networkOperatorApiService } from '../services/networkOperatorApiService';

import type { Application } from '../types/application';

type State = {
  applications: Application[];
  application: Application | null;
  applicationParty: any | null;
  organisation: any | null;
  loadApplications: (created_by: string) => Promise<void>;
  setApplication: (app: Application) => void;
  setOrganisation: (org: any) => void;
  startApplication: (applicationData: Partial<Application>) => Promise<Application>;
  fetchAndSetApplication: (id: string) => Promise<void>;
  saveNetworkOperator: (data: any) => Promise<void>;
};

export const useApplicationStore = create<State>((set) => ({
  applications: [],
  application: null,
  applicationParty: null,
  organisation: null,
  loadApplications: async (created_by) => {
    const apps = await applicationApiService.fetchApplicationsByUser(created_by);
    set({ applications: apps });
  },
  setApplication: (app) => set({ application: app }),
  setOrganisation: (org) => set({ organisation: org }),
  startApplication: async (applicationData) => {
    const app = await applicationApiService.createApplication(applicationData);
    set({ application: app });
    return app;
  },
  fetchAndSetApplication: async (id: string) => {
    const app = await applicationApiService.getApplicationById(id);
    set({ application: app });
  },
  saveNetworkOperator: async (data) => {
    const result = await applicationApiService.saveNetworkOperator(data);
    set({
      application: result.application,
      applicationParty: result.application_party
    });
  },
}));