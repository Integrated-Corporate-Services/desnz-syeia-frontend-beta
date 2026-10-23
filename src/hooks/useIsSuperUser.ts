import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { ROLES } from "../constants/roles";

/** True when the signed-in user is an Ultrasuperuser (role SUPERUSER). */
export const useIsSuperUser = (): boolean => {
  const { user } = useAuthUserContext();
  return (user as AuthUser | null)?.role === ROLES.SUPERUSER;
};