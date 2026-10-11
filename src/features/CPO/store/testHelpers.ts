import { useCpoStore, type CpoApplicationRecord } from './useCpoStore';

// Clears persisted demo data so every test starts from an empty store.
export const resetCpoStore = () => {
  sessionStorage.clear();
  useCpoStore.getState().reset();
};

// Creates (or updates) an application in the store with the given fields.
export const seedApplication = (applicationId: string, patch: Partial<CpoApplicationRecord> = {}) => {
  useCpoStore.getState().getApplication(applicationId);
  useCpoStore.setState((state) => ({
    applications: { ...state.applications, [applicationId]: { ...state.applications[applicationId], ...patch } },
  }));
};
