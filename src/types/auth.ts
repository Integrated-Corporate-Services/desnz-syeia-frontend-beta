export interface AuthUser {
  // NOTE: user_id is from the users table (NOT person_id from person table)
  // All FK constraints (created_by, updated_by, etc.) reference users.user_id
  user_id: string; // REQUIRED - this is the actual user_id from users table
  email: string;
  full_name?: string;
  role: string;
  organisation_id?: string;
  organisation_name?: string;
  is_agent?: boolean;
  status?: string;
  isDemo?: boolean;
  [key: string]: any;
}
