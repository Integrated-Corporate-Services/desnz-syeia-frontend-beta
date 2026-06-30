import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorksOverview from './WorksOverview';
import { WORKS_OVERVIEW_VALIDATION_MESSAGES } from '../../../constants/workOverviewError';
import * as worksOverviewApiService from '../../../services/worksOverviewApiService';

vi.mock('../../../hooks/useGetApplicationId', () => ({
  useGetApplicationId: () => 'test-application-id',
}));

vi.mock('../../../hooks/useAuthUser', () => ({
  useAuthUser: () => ({ user: { user_id: 'user-1' } }),
}));

vi.mock('../../../services/worksOverviewApiService', () => ({
  getWorksOverview: vi.fn().mockResolvedValue(null),
  createWorksOverview: vi.fn(),
  updateWorksOverview: vi.fn(),
}));

vi.mock('../../../components/SkipLink', () => ({
  default: () => null,
}));

vi.mock('../../../components/FileUpload', () => ({
  default: React.forwardRef(() => <div data-testid="file-upload" />),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/s-37/test-application-id/works-overview']}>
      <Routes>
        <Route path="/s-37/:applicationId/works-overview" element={<WorksOverview />} />
      </Routes>
    </MemoryRouter>
  );

describe('WorksOverview validation clearing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when required yes/no fields are empty', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Works Overview' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(screen.getAllByText(WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_POLES_REQUIRED).length).toBeGreaterThan(0);
    expect(worksOverviewApiService.createWorksOverview).not.toHaveBeenCalled();
  });

  it('clears yes/no validation after selecting an option', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Works Overview' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(document.getElementById('addingOrReplacingPoles-error')).toBeInTheDocument();

    fireEvent.click(document.getElementById('addingOrReplacingPoles-no')!);

    expect(document.getElementById('addingOrReplacingPoles-error')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="#addingOrReplacingPoles"]')).not.toBeInTheDocument();
  });

  it('clears conditional field errors when selecting no', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Works Overview' })).toBeInTheDocument();

    fireEvent.click(document.getElementById('addingOrReplacingPoles-yes')!);
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(document.getElementById('poleMaterial-error')).toBeInTheDocument();

    fireEvent.click(document.getElementById('addingOrReplacingPoles-no')!);

    expect(document.getElementById('poleMaterial-error')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="#poleMaterial"]')).not.toBeInTheDocument();
  });
});
