import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportingInfo from './SupportingInfo';

const saveSupportingInfoMock = vi.fn();

vi.mock('../../../hooks/useAuthUser', () => ({
  useAuthUser: () => ({ user: { user_id: 'user-1' } }),
}));

vi.mock('../../../hooks/useSupportingInfo', () => ({
  useSupportingInfo: () => ({
    supportingInfo: null,
    fetchSupportingInfo: vi.fn(),
    saveSupportingInfo: saveSupportingInfoMock,
    loading: false,
  }),
}));

vi.mock('../../../components/FileUpload', () => ({
  default: React.forwardRef(() => <div data-testid="file-upload" />),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/s-37/test-application-id/supporting-info']}>
      <Routes>
        <Route path="/s-37/:applicationId/supporting-info" element={<SupportingInfo />} />
      </Routes>
    </MemoryRouter>
  );

describe('SupportingInfo validation clearing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears wayleaves validation after selecting yes or no', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Supporting information' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(document.getElementById('wayleaves-error')).toBeInTheDocument();

    fireEvent.click(document.getElementById('wayleaves-yes')!);

    expect(document.getElementById('wayleaves-error')).not.toBeInTheDocument();
  });

  it('clears supporting documents validation after selecting an option', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Supporting information' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(document.getElementById('supportingDocs-error')).toBeInTheDocument();

    fireEvent.click(document.getElementById('hasSupportingDocuments-no')!);

    expect(document.getElementById('supportingDocs-error')).not.toBeInTheDocument();
  });
});
