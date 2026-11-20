import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EiaFeesSummaryCard from './EiaFeesSummaryCard';

describe('EiaFeesSummaryCard (SYEIA-1485)', () => {
  it('shows the assessment option instead of the old Yes/No questions', () => {
    render(<EiaFeesSummaryCard title="EIA fees" isEiaDevelopment={true} screeningOnly={false} />);
    expect(screen.getByText('EIA assessment')).toBeInTheDocument();
    expect(screen.getByText('EIA screening')).toBeInTheDocument();
    expect(screen.queryByText('EIA report')).not.toBeInTheDocument();
    expect(screen.queryByText('Does this application require a full EIA?')).not.toBeInTheDocument();
  });

  it('lists the report for a full EIA', () => {
    render(<EiaFeesSummaryCard title="EIA fees" isEiaDevelopment={true} screeningOnly={true} reportNames={['eia-report.pdf']} />);
    expect(screen.getByText('Full EIA')).toBeInTheDocument();
    expect(screen.getByText('EIA report')).toBeInTheDocument();
    expect(screen.getByText('eia-report.pdf')).toBeInTheDocument();
  });

  it('shows a dash before the question is answered', () => {
    render(<EiaFeesSummaryCard title="EIA fees" />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
