import { useAuthStore } from "../store/useAuthStore";

export type AuthUserResponse = {
  authenticated: boolean;
  user: any;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com";

/**
 * Get current authenticated user from backend session
 */
export async function getAuthUser(): Promise<AuthUserResponse> {
  const response = await fetch(`${API_BASE_URL}/backend/auth/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

export async function signOut(): Promise<void> {
  await fetch(`${API_BASE_URL}/backend/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function logout(): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) {
    window.location.assign("/frontend");
    return;
  }

  // Check if using OneLogin (has id_token) or dummy mode
  if (user.id_token && !user.isDemo) {
    const oidcLogoutUrl = "https://oidc.integration.account.gov.uk/logout";
    const postLogoutRedirectUri = encodeURIComponent(
      window.location.origin + "/frontend"
    );
    const logoutUrl = `${oidcLogoutUrl}?id_token_hint=${user.id_token}&post_logout_redirect_uri=${postLogoutRedirectUri}`;
    window.location.assign(logoutUrl);
  }

  try {
    await useAuthStore.getState().signOut();
  } catch (err) {
    // Ignore errors
  }
  window.location.assign("/frontend");
}
