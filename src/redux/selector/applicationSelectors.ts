import { RootState } from '../store';

export const selectApplication = (state: RootState) => state.application.application;
