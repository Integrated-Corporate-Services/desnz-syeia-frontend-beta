import type { AuthUser } from '../../types/auth';

export type AuthUserResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};
