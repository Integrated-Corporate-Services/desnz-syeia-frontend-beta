import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import TabConflictPage from './TabConflictPage';

describe('TabConflictPage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/tab-conflict');
  });

  it('renders the conflict message and encoded sign-out link', () => {
    render(<TabConflictPage />);

    expect(screen.getByRole('heading', { name: 'This service is open in another tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign out' })).toHaveAttribute(
      'href',
      expect.stringContaining('/auth/logout?redirectTo=%2FlandingPage')
    );
  });
});