import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskList from './TaskList';
import NWLTaskList from '../../NWL/TaskList/pages/NWLTaskList';

const { auth, taskData, getApplication } = vi.hoisted(() => ({
  auth: vi.fn(), taskData: vi.fn(), getApplication: vi.fn(),
}));
vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: auth }));
vi.mock('../../../hooks/useTaskListData', () => ({ useTaskListData: taskData }));
vi.mock('../../../hooks/useVisibleLinkFocus', () => ({ useVisibleLinkFocus: vi.fn() }));
vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../services/applicationApiService', () => ({
  applicationApiService: { getApplicationById: getApplication },
}));
vi.mock('../../../services/progressApiService', () => ({
  progressApiService: { fetchApplicationProgress: vi.fn().mockResolvedValue([]) },
}));

describe.each([['s-37', TaskList], ['nwl', NWLTaskList]] as const)('%s task-list permissions', (type, Page) => {
  beforeEach(() => { vi.clearAllMocks(); });

  it.each([
    ['SUPERUSER', 'DRAFT', false],
    ['SUPERUSER', 'SUBMITTED', false],
    ['APPLICANT_USER', 'DRAFT', true],
  ])('controls deletion for %s on %s', async (role, status, canDelete) => {
    auth.mockReturnValue({ user: { role } });
    const application = { application_id: 'app-1', type: 'S37', status, operator_name: 'Test Operator' };
    getApplication.mockResolvedValue(application);
    taskData.mockReturnValue({
      application,
      sections: [{ title: 'Project details', items: [{ name: 'Project overview', status: 'Completed', link: '/edit' }] }],
      submitting: false, handleSubmit: vi.fn(), statusClass: () => 'govuk-tag',
    });
    render(
      <MemoryRouter initialEntries={[`/${type}/app-1/task-list`]}>
        <Routes><Route path="/:type/:applicationId/task-list" element={<Page />} /></Routes>
      </MemoryRouter>,
    );
    if (type === 'nwl') await waitFor(() => expect(getApplication).toHaveBeenCalledWith('app-1'));
    if (canDelete) {
      expect(await screen.findByRole('button', { name: 'Delete application' })).toBeEnabled();
    } else {
      expect(screen.queryByRole('button', { name: 'Delete application' })).not.toBeInTheDocument();
      for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAttribute('href', `/${type}/app-1/application-summary`);
      }
      expect(screen.queryByText(/As an admin, you can still/)).not.toBeInTheDocument();
    }
  });
});