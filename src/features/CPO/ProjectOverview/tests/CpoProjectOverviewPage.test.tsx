import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CpoProjectOverviewPage from '../pages/CpoProjectOverviewPage';
import { cpoProjectOverviewService } from '../services/cpoProjectOverviewService';
import { EMPTY_PROJECT_OVERVIEW } from '../constants/projectOverviewConstants';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../../context/BreadcrumbContext';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};
const renderPage = () => render(
  <BreadcrumbProvider>
    <MemoryRouter initialEntries={['/cpo/application-id/project-overview']}>
      <BreadcrumbOutlet />
      <Routes><Route path="/cpo/:applicationId/project-overview" element={<CpoProjectOverviewPage />} /></Routes>
    </MemoryRouter>
  </BreadcrumbProvider>
);
const button = () => screen.getByRole('button', { name: 'Save and continue' });
const ready = () => waitFor(() => expect(button()).toBeEnabled());
const nameInput = () => screen.getByLabelText('Enter the name of the project that requires this CPO');
const summaryInput = () => screen.getByLabelText('Summarise the project');

describe('CPO project overview page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(cpoProjectOverviewService, 'get').mockResolvedValue({ details: EMPTY_PROJECT_OVERVIEW, canEdit: true });
    vi.spyOn(cpoProjectOverviewService, 'save').mockImplementation(async (_id, details) => ({ details, canEdit: true }));
  });

  it('shows the heading, both questions, the character count, a back link and only Save and continue', async () => {
    renderPage();
    await ready();
    expect(screen.getByRole('heading', { level: 1, name: 'Project overview' })).toBeInTheDocument();
    expect(nameInput()).toHaveAttribute('maxLength', '400');
    expect(screen.getByText('Provide a brief summary of the project that this CPO application supports.')).toBeInTheDocument();
    expect(screen.getAllByText('You can enter up to 4,000 characters').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('shows both errors and focuses the summary when nothing is entered', async () => {
    renderPage();
    await ready();
    fireEvent.click(button());
    const alert = screen.getByRole('alert');
    expect(alert).toHaveFocus();
    expect(alert).toHaveTextContent('There is a problem');
    expect(screen.getByRole('link', { name: 'Enter the name of the project that requires this CPO' })).toHaveAttribute('href', '#projectName');
    expect(screen.getByRole('link', { name: 'Summarise the project' })).toHaveAttribute('href', '#projectSummary');
    expect(nameInput()).toHaveClass('govuk-input--error');
    expect(summaryInput()).toHaveClass('govuk-textarea--error');
    expect(cpoProjectOverviewService.save).not.toHaveBeenCalled();
  });

  it('clears a field error and its summary entry as the user types, like S37', async () => {
    renderPage();
    await ready();
    fireEvent.click(button());
    expect(screen.getByRole('alert')).toHaveFocus();
    fireEvent.change(nameInput(), { target: { value: 'N' } });
    expect(screen.queryByRole('link', { name: 'Enter the name of the project that requires this CPO' })).not.toBeInTheDocument();
    expect(nameInput()).not.toHaveClass('govuk-input--error');
    expect(nameInput()).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('link', { name: 'Summarise the project' })).toBeInTheDocument();
    expect(summaryInput()).toHaveClass('govuk-textarea--error');
    fireEvent.change(summaryInput(), { target: { value: 'S' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(summaryInput()).not.toHaveClass('govuk-textarea--error');
  });

  it('rejects a summary over 4,000 characters and counts the overflow', async () => {
    renderPage();
    await ready();
    fireEvent.change(nameInput(), { target: { value: 'North Ridge' } });
    fireEvent.change(summaryInput(), { target: { value: 'a'.repeat(4002) } });
    expect(screen.getAllByText('You have 2 characters too many').length).toBeGreaterThan(0);
    fireEvent.click(button());
    expect(screen.getByRole('alert')).toHaveTextContent('Project summary must be 4,000 characters or fewer');
    expect(cpoProjectOverviewService.save).not.toHaveBeenCalled();
  });

  it('saves trimmed answers and returns to the task list', async () => {
    renderPage();
    await ready();
    fireEvent.change(nameInput(), { target: { value: '  North Ridge  ' } });
    fireEvent.change(summaryInput(), { target: { value: ' Grid reinforcement ' } });
    fireEvent.click(button());
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/task-list'));
    expect(cpoProjectOverviewService.save).toHaveBeenCalledWith('application-id', { projectName: 'North Ridge', projectSummary: 'Grid reinforcement' });
  });

  it('shows the saved answers when the page is reopened', async () => {
    vi.mocked(cpoProjectOverviewService.get).mockResolvedValue({ details: { projectName: 'North Ridge', projectSummary: 'Summary' }, canEdit: true });
    renderPage();
    await ready();
    expect(nameInput()).toHaveValue('North Ridge');
    expect(summaryInput()).toHaveValue('Summary');
  });

  it('shows a server error without leaving the page', async () => {
    vi.mocked(cpoProjectOverviewService.save).mockRejectedValue(new Error('Only draft compulsory purchase order applications can be updated.'));
    renderPage();
    await ready();
    fireEvent.change(nameInput(), { target: { value: 'North Ridge' } });
    fireEvent.change(summaryInput(), { target: { value: 'Summary' } });
    fireEvent.click(button());
    expect(await screen.findByRole('alert')).toHaveTextContent('Only draft compulsory purchase order applications can be updated.');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('disables the form when the application cannot be edited', async () => {
    vi.mocked(cpoProjectOverviewService.get).mockResolvedValue({ details: EMPTY_PROJECT_OVERVIEW, canEdit: false });
    renderPage();
    expect(await screen.findByText('You can view this project overview but cannot change it.')).toBeInTheDocument();
    expect(button()).toBeDisabled();
  });
});
