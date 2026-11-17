import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CheckYourAnswers from './CheckYourAnswers';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

vi.mock('../../../components/SensitiveAreaCheckMap', () => ({ default: () => <div data-testid="map" /> }));

const APP = 'app-1';
// Every section CheckYourAnswers needs before Pay and submit is enabled, with the EIA answer varied per test.
const reviewData = (eiaFees: Record<string, unknown>, eiaReportDocuments: { title: string }[]) => ({
  permissions: { canView: true, canEdit: true, canDelete: false, canSubmit: true, canDownload: true, canWithdraw: false },
  sections: {
    networkOperator: { details: { name: 'NG' } },
    projectDetails: { overview: { project_name: 'Line' }, assetInformation: { voltage: 33 } },
    location: { route: [{ route_name: 'R1' }] },
    worksOverview: { works: 'x' },
    sensitiveAreaChecks: { tolerance_required: false },
    sensitiveAreaReview: { reviewed: true },
    parishes: [{ name: 'P1' }],
    supportingInformation: { supportingQuestions: { q: 1 }, eiaFees, eiaReportDocuments },
    postConsultationOutcome: { lpa_conditions_imposed: false },
  },
});

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[`/s-37/${APP}/check-your-answers`]}>
        <Routes>
          <Route path="/s-37/:applicationId/check-your-answers" element={<CheckYourAnswers />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('Check your answers: EIA report before Pay and submit (SYEIA-1485)', () => {
  let data: unknown;
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => data })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps Pay and submit disabled for a full EIA with no report, even with the declaration ticked', async () => {
    data = reviewData({ is_eia_development: true, screening_only: true }, []);
    renderPage();
    const button = await screen.findByRole('button', { name: 'Pay and submit application' });
    screen.getByRole('checkbox').click();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(button).toBeDisabled();
  });

  it('enables Pay and submit for a full EIA once the report is uploaded', async () => {
    data = reviewData({ is_eia_development: true, screening_only: true }, [{ title: 'eia.pdf' }]);
    renderPage();
    const button = await screen.findByRole('button', { name: 'Pay and submit application' });
    screen.getByRole('checkbox').click();
    expect(await screen.findByRole('button', { name: 'Pay and submit application' })).toBeEnabled();
    expect(button).toBeEnabled();
  });

  it('does not need a report for EIA screening', async () => {
    data = reviewData({ is_eia_development: true, screening_only: false }, []);
    renderPage();
    await screen.findByRole('button', { name: 'Pay and submit application' });
    screen.getByRole('checkbox').click();
    expect(await screen.findByRole('button', { name: 'Pay and submit application' })).toBeEnabled();
  });
});
