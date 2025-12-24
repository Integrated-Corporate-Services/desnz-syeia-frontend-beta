export interface AuthUser {
  person_id?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  organisation_id?: string;
  organisation_name?: string;
  isDemo?: boolean;
  [key: string]: any;
}
