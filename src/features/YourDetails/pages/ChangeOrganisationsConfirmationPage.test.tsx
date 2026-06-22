import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ChangeOrganisationsConfirmationPage from './ChangeOrganisationsConfirmationPage';

describe('ChangeOrganisationsConfirmationPage', () => {
  it('renders confirmation content and dashboard link', () => {
    render(
      <MemoryRouter>
        <ChangeOrganisationsConfirmationPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Your changes have been saved' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What happens next' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toHaveAttribute(
      'href',
      '/application-dashboard'
    );
  });
});
