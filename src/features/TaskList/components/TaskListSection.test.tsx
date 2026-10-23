import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TaskListSection from './TaskListSection';

describe('TaskListSection', () => {
  it.each([
    ['DRAFT', true, false],
    ['SUBMITTED', true, false],
    ['DRAFT', false, true],
    ['SUBMITTED', false, false],
  ])('controls submission for status %s and read-only %s', (status, isReadOnly, canSubmit) => {
    const handleSubmit = vi.fn();
    render(
      <MemoryRouter>
        <TaskListSection
          section={{ title: 'Submit', items: [{ name: 'Submit application', status: 'Ready', link: '' }] }}
          idx={0}
          applicationId="app-1"
          applicationStatus={status}
          isReadOnly={isReadOnly}
          submitting={false}
          handleSubmit={handleSubmit}
          statusClass={() => 'govuk-tag'}
        />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: 'Submit application' });
    expect(button).toHaveProperty('disabled', !canSubmit);
    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalledTimes(canSubmit ? 1 : 0);
  });

  it('routes read-only task links to the summary', () => {
    render(
      <MemoryRouter>
        <TaskListSection
          section={{ title: 'Project', items: [{ name: 'Route', status: 'Completed', link: '/edit-route' }] }}
          idx={0}
          applicationId="app-1"
          isReadOnly
          submitting={false}
          handleSubmit={vi.fn()}
          statusClass={() => 'govuk-tag'}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/s-37/app-1/application-summary');
  });

  it('renders tasks as a list with statuses associated with their links', () => {
    const { container } = render(
      <MemoryRouter>
        <TaskListSection
          section={{
            title: 'Project details',
            items: [
              { name: 'Project overview', status: 'Completed', link: '/project-overview' },
              { name: 'Assets', status: 'Cannot start yet', link: '/assets', disabled: true, plainTextStatus: true },
            ],
          }}
          idx={1}
          applicationId="application-1"
          submitting={false}
          handleSubmit={vi.fn()}
          statusClass={() => 'govuk-tag'}
        />
      </MemoryRouter>,
    );

    const tasks = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(tasks).toHaveLength(2);
    expect(screen.getByRole('list', { name: '2. Project details' })).toBeInTheDocument();
    const projectLink = screen.getByRole('link', { name: '2. Project details Project overview' });
    expect(projectLink).toHaveAttribute('aria-labelledby', 's37-task-heading-1 s37-task-link-1-0');
    expect(projectLink).toHaveAttribute('aria-describedby', 's37-task-status-1-0');
    expect(screen.getByText('Completed').closest('#s37-task-status-1-0')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Assets' })).not.toBeInTheDocument();
    expect(container.querySelector('table')).not.toBeInTheDocument();
  });
});