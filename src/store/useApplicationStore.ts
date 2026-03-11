import { create } from 'zustand';

import { progressApiService } from '../services/progressApiService';
import { applicationApiService } from '../services/applicationApiService';
import { networkOperatorApiService } from '../services/networkOperatorApiService';

import type { Application, ApplicationParty } from '../types/application';

type State = {
  applications: Application[];
  application: Application | null;
  applicationParty: any | null;
  organisation: any | null;
  loadApplications: (created_by: string) => Promise<void>;
  setApplication: (app: Application | null) => void;
  setApplicationParty: (party: ApplicationParty) => void;
  setOrganisation: (org: any) => void;
  startApplication: (applicationData: Partial<Application>) => Promise<Application>;
  fetchAndSetApplication: (id: string) => Promise<void>;
  saveNetworkOperator: (data: any) => Promise<any>;
  submitApplication: (applicationId: string) => Promise<any>;
  updateApplicantInfo: (applicationId: string, operatorRef: string, type: string, additionalContacts: string) => Promise<Application | null>;
};

export const useApplicationStore = create<State>((set) => ({
  applications: [],
  application: null,
  applicationParty: null,
  organisation: null,
  loadApplications: async (created_by) => {
    const apps = await applicationApiService.fetchApplicationsByUser(created_by);
    // Map operator_ref to your_reference for workbasket display
    const mappedApps = apps.map((app: Application) => ({
      ...app,
      your_reference: app.operator_ref || app.your_reference
    }));
    set({ applications: mappedApps });
  },
  setApplication: (app) => set({ application: app }),
  setApplicationParty: (party) => set({ applicationParty: party }),
  setOrganisation: (org) => set({ organisation: org }),
  startApplication: async (applicationData) => {
    const app = await applicationApiService.createApplication(applicationData);
    set({ application: app });
    return app;
  },
  fetchAndSetApplication: async (id: string) => {
    const app = await applicationApiService.getApplicationById(id);
    set({ application: app , applicationParty: app.application_party });
  },
  saveNetworkOperator: async (data) => {
    const result = await applicationApiService.saveNetworkOperator(data);
    set({
      application: result.application,
      applicationParty: result.application_party
    });
    return result;
  },
  submitApplication: async (applicationId: string) => {
    const updated = await applicationApiService.submitApplication(applicationId);
    if (updated) {
      set({ application: updated, applicationParty: updated.application_party });
    }
    return updated;
  },
  updateApplicantInfo: async (applicationId, operatorRef, type, additionalContacts) => {
    const app = await applicationApiService.updateApplicantInfo(applicationId, operatorRef, type, additionalContacts);
    set({ application: app });
    return app;
  }
}));