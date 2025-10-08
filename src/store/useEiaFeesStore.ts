import { fetchEiaFeesDetails, createEiaFee, updateEiaFee } from '../services/eiafeesservice';
import { create } from 'zustand';

interface EiaFeesState {
	eiaFees: any | null;
	loading: boolean;
	error: string | null;
	fetchEiaFees: (applicationId: string) => Promise<void>;
	createEiaFees: (payload: any) => Promise<void>;
	updateEiaFees: (payload: any) => Promise<void>;
}

export const useEiaFeesStore = create<EiaFeesState>((set) => ({
	eiaFees: null,
	loading: false,
	error: null,

	fetchEiaFees: async (applicationId: string) => {
		set({ loading: true, error: null });
			try {
				const data = await fetchEiaFeesDetails(applicationId);
				// Set eiaFees to the first item in the array, not the whole response
				set({ eiaFees: data && Array.isArray(data.eiaFees) ? data.eiaFees[0] : null, loading: false });
			} catch (error: any) {
				set({ error: error.message || 'Failed to fetch EIA Fees', loading: false });
			}
	},

	createEiaFees: async (payload: any) => {
		set({ loading: true, error: null });
		try {
			const data = await createEiaFee(payload);
			set({ eiaFees: data, loading: false });
		} catch (error: any) {
			set({ error: error.message || 'Failed to create EIA Fee', loading: false });
		}
	},

	updateEiaFees: async (payload: any) => {
		set({ loading: true, error: null });
		try {
			const data = await updateEiaFee(payload);
			set({ eiaFees: data, loading: false });
		} catch (error: any) {
			set({ error: error.message || 'Failed to update EIA Fee', loading: false });
		}
	},
}));
