import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EIAFeesSummary from './EIAFeesSummary';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

let savedFees: Record<string, unknown> | null = null;
let draftCheck = 'editable';
vi.mock('../../../hooks/useGetApplicationId', () => ({ useGetApplicationId: () => 'app-1' }));
vi.mock('../../../hooks/useEiaFees', () => ({ useEiaFees: () => ({ eiaFees: savedFees, loading: false, fetchEiaFees: vi.fn() }) }));
vi.mock('../hooks/useEditableDraft', () => ({ useEditableDraft: (_id: string, enabled: boolean) => (enabled ? draftCheck : 'idle') }));

const renderPage = () => render(<BreadcrumbProvider><MemoryRouter><EIAFeesSummary /></MemoryRouter></BreadcrumbProvider>);
const UPLOAD_LINK = { name: 'Upload your EIA report' };

describe('Read-only EIA page: missing report recovery (SYEIA-1485)', () => {
  beforeEach(() => { draftCheck = 'editable'; });

  it('links to the upload for a draft full EIA with no report', () => {
    savedFees = { isEiaDevelopment: true, screeningOnly: true, applicationDocuments: [] };
    renderPage();
    expect(screen.getByRole('link', UPLOAD_LINK)).toHaveAttribute('href', '/s-37/app-1/eia-fees/upload-eia-report');
  });

  it('has no link once the report is uploaded, for other answers, or when the application is not an editable draft', () => {
    savedFees = { isEiaDevelopment: true, screeningOnly: true, applicationDocuments: [{ title: 'eia.pdf' }] };
    const { unmount } = renderPage();
    expect(screen.queryByRole('link', UPLOAD_LINK)).not.toBeInTheDocument();
    unmount();
    savedFees = { isEiaDevelopment: true, screeningOnly: false, applicationDocuments: [] };
    const second = renderPage();
    expect(screen.queryByRole('link', UPLOAD_LINK)).not.toBeInTheDocument();
    second.unmount();
    savedFees = { isEiaDevelopment: true, screeningOnly: true, applicationDocuments: [] };
    draftCheck = 'locked';
    renderPage();
    expect(screen.queryByRole('link', UPLOAD_LINK)).not.toBeInTheDocument();
  });
});
