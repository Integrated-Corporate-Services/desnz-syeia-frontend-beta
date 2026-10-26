import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TabNavigation } from './TabNavigation';

const base = { activeTab: 'active-users' as const, organisationsEnabled: true, pendingCount: 3, onTabChange: () => {} };

describe('TabNavigation (SYEIA-2703)', () => {
  it('labels the third tab "Access requests (n)" for every role', () => {
    render(<TabNavigation {...base} />);
    expect(screen.getByRole('tab', { name: 'Access requests (3)' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Pending access requests/ })).not.toBeInTheDocument();
  });
});