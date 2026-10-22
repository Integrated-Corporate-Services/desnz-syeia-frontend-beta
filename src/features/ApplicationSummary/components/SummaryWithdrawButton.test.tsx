import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SummaryWithdrawButton } from './SummaryWithdrawButton';

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: auth }));

describe('SummaryWithdrawButton', () => {
  it('does not offer applicant withdrawal to a Superuser', () => {
    auth.mockReturnValue({ user: { role: 'SUPERUSER' } });
    const onClick = vi.fn();
    render(<SummaryWithdrawButton onClick={onClick} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('preserves applicant withdrawal', () => {
    auth.mockReturnValue({ user: { role: 'APPLICANT_USER' } });
    const onClick = vi.fn();
    render(<SummaryWithdrawButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw application' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});