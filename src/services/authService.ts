import type { AuthUser } from '../types/auth';

export type AuthUserResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};

/**
 * Get current authenticated user from backend session
 * Always uses relative paths for same-origin requests
 */
export async function getAuthUser(): Promise<AuthUserResponse> {
  const response = await fetch("/backend/auth/user", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

export async function signOut(): Promise<void> {
  await fetch("/backend/auth/signout", {
    method: "POST",
    credentials: "include",
  });
}

export async function logout(): Promise<void> {
  console.log("Logging out user...");

  // Let the backend handle all logout logic including OIDC session destruction
  // The backend will redirect appropriately after destroying sessions
  window.location.assign("/backend/auth/logout");
}
