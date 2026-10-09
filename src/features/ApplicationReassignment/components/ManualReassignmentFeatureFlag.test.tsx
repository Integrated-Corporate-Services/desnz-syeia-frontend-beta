import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationReassignmentLinks } from './ApplicationReassignmentLinks';
import { ReassignmentSuccessBanner } from './ReassignmentSuccessBanner';
import { useAssignmentHistory } from '../hooks/useAssignmentHistory';
import { applicationApiService } from '../../../services/applicationApiService';

vi.mock('../../../config/appConfig', () => ({ isManualReassignmentEnabled: () => false }));
vi.mock('../../../context/AuthUserContext', () => ({
    useAuthUserContext: () => ({ user: { role: 'APPLICANT_TEAM_COORDINATOR' } }),
}));
vi.mock('../../../services/applicationApiService', () => ({
    applicationApiService: { getEligibleAssignees: vi.fn(), getAssignmentHistory: vi.fn() },
}));

describe('manual reassignment disabled', () => {
    beforeEach(() => vi.clearAllMocks());

    it('hides links and does not request eligibility or history', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/s37/application/application-summary']}>
                <ApplicationReassignmentLinks applicationId="application" status="DRAFT" />
            </MemoryRouter>
        );
        expect(container).toBeEmptyDOMElement();
        expect(applicationApiService.getEligibleAssignees).not.toHaveBeenCalled();
        expect(applicationApiService.getAssignmentHistory).not.toHaveBeenCalled();
    });

    it('returns idle history without making a request', () => {
        const { result } = renderHook(() => useAssignmentHistory('application'));
        expect(result.current).toEqual({ details: null, loading: false, error: null });
        expect(applicationApiService.getAssignmentHistory).not.toHaveBeenCalled();
    });

    it('does not show a stale success banner', () => {
        render(
            <MemoryRouter initialEntries={[{
                pathname: '/s37/application/application-summary',
                state: { reassignment: { reference: 'S3700001', name: 'Contact' } },
            }]}>
                <ReassignmentSuccessBanner />
            </MemoryRouter>
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});