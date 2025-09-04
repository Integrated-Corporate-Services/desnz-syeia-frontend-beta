import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Application } from '../models/application';

interface ApplicationState {
  application: Application | null;
}

const initialState: ApplicationState = {
  application: null,
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setApplication(state, action: PayloadAction<Application>) {
      state.application = action.payload;
    },
    updateApplication(state, action: PayloadAction<Partial<Application>>) {
      if (state.application) {
        state.application = { ...state.application, ...action.payload };
      }
    },
    clearApplication(state) {
      state.application = null;
    },
  },
});

export const { setApplication, updateApplication, clearApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
