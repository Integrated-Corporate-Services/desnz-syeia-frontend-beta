import { create } from "zustand";

interface AccessRequestFormData {
  email: string;
  title?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postCode: string;
  isAgent?: boolean;
  agencyName?: string;
  companyNumber?: string;
  agencyAddress?: string;
  organisationIds: string[];
}

interface AccessRequestStore {
  formData: Partial<AccessRequestFormData>;
  updateFormData: (data: Partial<AccessRequestFormData>) => void;
  clearFormData: () => void;
}

export const useAccessRequestStore = create<AccessRequestStore>((set) => ({
  formData: {},
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  clearFormData: () => set({ formData: {} }),
}));
