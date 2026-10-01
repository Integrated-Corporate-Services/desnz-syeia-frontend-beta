import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ConsultationSummaryCard from './SummaryCard';

describe('ConsultationSummaryCard', () => {
    it('uses a labelled summary list for consultation details', () => {
        const { container } = render(
            <MemoryRouter>
                <ConsultationSummaryCard
                    orgName="North Yorkshire Council"
                    status="Not required"
                    consultationId="consultation-1"
                    applicationId="application-1"
                    notRequiredMessage="No response needed"
                />
            </MemoryRouter>,
        );

        const details = container.querySelector('dl.govuk-summary-list');
        expect(details).toBeInTheDocument();
        expect(within(details as HTMLElement).getByText('Why this consultation is not required').tagName).toBe('DT');
        expect(within(details as HTMLElement).getByText('No response needed').tagName).toBe('DD');
        expect(screen.getByRole('heading', { name: 'North Yorkshire Council' })).toBeInTheDocument();
        expect(container.querySelector('table')).not.toBeInTheDocument();
    });
});