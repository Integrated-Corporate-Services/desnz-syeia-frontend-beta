import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserAccessRevokedPage from './UserAccessRevokedPage';

describe('UserAccessRevokedPage', () => {
  it('hides the "Warning" label visually so it does not run into the sentence', () => {
    render(<UserAccessRevokedPage />);
    expect(screen.getByText('Warning')).toHaveClass('govuk-visually-hidden');
  });
});
