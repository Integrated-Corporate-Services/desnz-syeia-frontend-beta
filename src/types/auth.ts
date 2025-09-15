export interface AuthUser {
  person_id?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  isDemo?: boolean;
  [key: string]: any;
}
