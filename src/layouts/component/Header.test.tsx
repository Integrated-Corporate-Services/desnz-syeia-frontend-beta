import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';
import GovUKHeader from './GovUKHeader';

vi.mock('../../context/AuthUserContext', () => ({
    useAuthUserContext: () => ({ user: { first_name: 'Hannah', last_name: 'Martin' } }),
}));

describe('GOV.UK headers', () => {
    it('names the signed-in header logo once and shows the user name without a title', () => {
        const { container } = render(<Header />);

        expect(screen.getByRole('img', { name: 'GOV.UK' })).not.toContainHTML('<title>');
        expect(screen.getByText('Hannah Martin')).not.toHaveAttribute('title');
        expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument();
        expect(container.querySelector('[title]')).not.toBeInTheDocument();
    });

    it('names the public header logo once', () => {
        const { container } = render(<MemoryRouter><GovUKHeader /></MemoryRouter>);

        expect(screen.getByRole('img', { name: 'GOV.UK' })).not.toContainHTML('<title>');
        expect(container.querySelector('[title]')).not.toBeInTheDocument();
    });
});