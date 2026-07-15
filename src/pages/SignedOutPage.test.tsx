import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import SignedOutPage from './SignedOutPage';

describe('SignedOutPage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/frontend/signed-out');
  });

  it('renders default inactivity message when no reason is provided', () => {
    render(<SignedOutPage />);

    expect(
      screen.getByText('For your security, we signed you out because you were inactive for 30 minutes.')
    ).toBeInTheDocument();
  });

  it('renders device-evicted message for SESSION_EVICTED', () => {
    window.history.pushState({}, '', '/frontend/signed-out?reason=SESSION_EVICTED');

    render(<SignedOutPage />);

    expect(
      screen.getByText('You were signed out because you signed in on another device.')
    ).toBeInTheDocument();
  });

  it('renders max-duration message for SESSION_ABSOLUTE_TIMEOUT', () => {
    window.history.pushState({}, '', '/frontend/signed-out?reason=SESSION_ABSOLUTE_TIMEOUT');

    render(<SignedOutPage />);

    expect(
      screen.getByText('For your security, we signed you out because your session reached the maximum duration.')
    ).toBeInTheDocument();
  });
});
