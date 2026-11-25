import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./SubmittedApplicationsSummary', () => ({ default: () => <div>Submitted applications summary</div> }));
vi.mock('../hooks/useApplicationStatusLookup', () => ({
  useApplicationStatusLookup: () => ({
    reference: '',
    setReference: vi.fn(),
    result: null,
    loading: false,
    error: null,
    search: vi.fn(),
  }),
}));

import OperationalTasks from './OperationalTasks';

const LocationProbe: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderTasks = (url = '/admin/reporting') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/admin/reporting" element={<OperationalTasks />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe('OperationalTasks migration sub-tab', () => {
  it('shows the Migration sub-tab with its links', () => {
    renderTasks();
    fireEvent.click(screen.getByRole('button', { name: 'Migration' }));
    expect(screen.getByRole('link', { name: 'Start a migration batch' })).toHaveAttribute('href', '/admin/migration/batches/new');
    expect(screen.getByRole('link', { name: 'View migration batches' })).toHaveAttribute('href', '/admin/migration/batches');
    expect(screen.getByLabelText('DESNZ reference or application ID')).toBeInTheDocument();
  });


  it('opens on the Migration sub-tab from ?subTab=migration', () => {
    renderTasks('/admin/reporting?subTab=migration');
    expect(screen.getByRole('heading', { name: 'Find a migrated application' })).toBeInTheDocument();
  });

  it('validates the find form with a focused error summary', async () => {
    renderTasks('/admin/reporting?subTab=migration');
    fireEvent.click(screen.getByRole('button', { name: 'Find application' }));
    const summary = await screen.findByRole('alert');
    expect(screen.getByRole('link', { name: 'Enter a DESNZ reference or application ID' })).toHaveAttribute(
      'href',
      '#migrated-application-reference'
    );
    await waitFor(() => expect(summary).toHaveFocus());
  });

  it('goes to the migrated application page', () => {
    renderTasks('/admin/reporting?subTab=migration');
    fireEvent.change(screen.getByLabelText('DESNZ reference or application ID'), { target: { value: ' NWL-2025-000123 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find application' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/migration/applications/NWL-2025-000123');
  });
});
