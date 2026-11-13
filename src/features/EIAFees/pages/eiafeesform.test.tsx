import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EIAFeesForm from './eiafeesform';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

const createEiaFees = vi.fn();
const updateEiaFees = vi.fn();
let savedFees: Record<string, unknown> | null = null;
let requirement = { loading: false, mandatory: false, highVoltage: false, sensitiveArea: false };

vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user-1' } }) }));
vi.mock('../../../hooks/useConsultationsStarted', () => ({ useConsultationsStarted: () => ({ consultationsStarted: false, loading: false }) }));
vi.mock('../../../hooks/useEiaFees', () => ({
  useEiaFees: () => ({ eiaFees: savedFees, fetchEiaFees: vi.fn(), createEiaFees, updateEiaFees }),
}));
vi.mock('../hooks/useEiaScreeningRequirement', () => ({ useEiaScreeningRequirement: () => requirement }));

const APP = 'app-1';
const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[`/s-37/${APP}/eia-fees`]}>
        <Routes>
          <Route path="/s-37/:applicationId/eia-fees" element={<EIAFeesForm />} />
          <Route path="/s-37/:applicationId/eia-fees/upload-eia-report" element={<h1>Upload page</h1>} />
          <Route path="/s-37/:applicationId/task-list" element={<h1>Task list page</h1>} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

const optionLabels = () => within(screen.getByRole('group', { name: 'Select an assessment option' })).getAllByRole('radio').map((r) => (r as HTMLInputElement).labels?.[0].textContent);

describe('EIA fees page (SYEIA-1485)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedFees = null;
    requirement = { loading: false, mandatory: false, highVoltage: false, sensitiveArea: false };
    createEiaFees.mockResolvedValue({});
    updateEiaFees.mockResolvedValue({});
  });

  it('offers three options by cost when screening is not mandatory (Image 2)', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Environmental Impact Assessment (EIA)' })).toBeInTheDocument();
    expect(screen.getByText('A mandatory EIA screening decision is not required for this application.')).toBeInTheDocument();
    expect(optionLabels()).toEqual(['No assessment required', 'EIA screening', 'Full EIA']);
  });

  it('offers full EIA first and lists only the reasons that apply when screening is mandatory (Image 3)', () => {
    requirement = { loading: false, mandatory: true, highVoltage: false, sensitiveArea: true };
    renderPage();
    expect(optionLabels()).toEqual(['Full EIA', 'EIA screening']);
    expect(screen.getByText('route passes through one or more sensitive areas')).toBeInTheDocument();
    expect(screen.queryByText('lines carry a voltage of 132kV or higher')).not.toBeInTheDocument();
  });

  it('shows an error when no option is chosen', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findAllByText('Select an assessment option', { selector: 'a, p' })).not.toHaveLength(0);
    expect(createEiaFees).not.toHaveBeenCalled();
  });

  it('saves EIA screening as Yes / No and moves to the next task', async () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('EIA screening'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(createEiaFees).toHaveBeenCalledWith(expect.objectContaining({ isEiaDevelopment: true, screeningOnly: false })));
    expect(await screen.findByRole('heading', { name: 'Task list page' })).toBeInTheDocument();
  });

  it('goes to the upload page after a full EIA', async () => {
    savedFees = { eiaFeeId: 'e-1', applicationId: APP, isEiaDevelopment: false, screeningOnly: false };
    renderPage();
    fireEvent.click(screen.getByLabelText('Full EIA'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(updateEiaFees).toHaveBeenCalledWith(expect.objectContaining({ eiaFeeId: 'e-1', isEiaDevelopment: true, screeningOnly: true })));
    expect(await screen.findByRole('heading', { name: 'Upload page' })).toBeInTheDocument();
  });

  it('leaves an old "No" unselected when screening is mandatory', () => {
    requirement = { loading: false, mandatory: true, highVoltage: true, sensitiveArea: false };
    savedFees = { eiaFeeId: 'e-1', applicationId: APP, isEiaDevelopment: false, screeningOnly: false };
    renderPage();
    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('Save for later returns to the task list without asking for an option', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(await screen.findByRole('heading', { name: 'Task list page' })).toBeInTheDocument();
    expect(createEiaFees).not.toHaveBeenCalled();
  });
});
