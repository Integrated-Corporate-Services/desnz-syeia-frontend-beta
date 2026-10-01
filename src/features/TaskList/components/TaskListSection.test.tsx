import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TaskListSection from './TaskListSection';

describe('TaskListSection', () => {
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
    expect(screen.getByRole('link', { name: 'Project overview' })).toHaveAttribute('aria-describedby', 's37-task-status-1-0');
    expect(screen.getByText('Completed').closest('#s37-task-status-1-0')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Assets' })).not.toBeInTheDocument();
    expect(container.querySelector('table')).not.toBeInTheDocument();
  });
});