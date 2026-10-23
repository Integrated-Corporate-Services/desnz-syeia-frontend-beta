import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TabNavigation } from './TabNavigation';

const base = { activeTab: 'active-users' as const, organisationsEnabled: true, pendingCount: 3, onTabChange: () => {} };

describe('TabNavigation (SYEIA-2703)', () => {
  it('labels the third tab "Access requests (n)" for Ultrasuperusers', () => {
    render(<TabNavigation {...base} isSuperUser />);
    expect(screen.getByRole('tab', { name: 'Access requests (3)' })).toBeInTheDocument();
  });

  it('keeps "Pending access requests (n)" for team coordinators', () => {
    render(<TabNavigation {...base} />);
    expect(screen.getByRole('tab', { name: 'Pending access requests (3)' })).toBeInTheDocument();
  });
});