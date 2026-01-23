// Dummy user types matching backend system
// Change VITE_DUMMY_USER_TYPE in run-frontend.ps1 to switch users

interface DummyUser {
  user_id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  organisation_id: string | null;
  organisation_name?: string;
  role: string;
  is_agent: boolean;
  status: string;
}

const DUMMY_USERS: Record<string, DummyUser> = {
  DESNZ_ADMIN: {
    user_id: "d4e5f6a7-b8c9-0123-def1-234567890123",
    email: "desnz.admin@ics.gov.uk",
    name: "DESNZ Admin",
    first_name: "DESNZ",
    last_name: "Admin",
    organisation_id: null,
    organisation_name: "DESNZ",
    role: "DESNZ_ADMIN",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR: {
    user_id: "a3333333-3333-3333-3333-333333333333",
    email: "hannah.martin@nationalgrid.co.uk",
    name: "Hannah Martin",
    first_name: "Hannah",
    last_name: "Martin",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_2: {
    user_id: "a4444444-4444-4444-4444-444444444444",
    email: "jennifer.foster@nationalgrid.co.uk",
    name: "Jennifer Foster",
    first_name: "Jennifer",
    last_name: "Foster",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_PREPOPULATED: {
    user_id: "a5555555-5555-5555-5555-555555555555",
    email: "elizabeth.parker@nationalgrid.com",
    name: "Elizabeth Parker",
    first_name: "Elizabeth",
    last_name: "Parker",
    organisation_id: "33333333-3333-3333-3333-333333333333",
    organisation_name: "National Grid Electricity Transmission",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "PREPOPULATED",
  },
  APPLICANT_USER_APPROVED: {
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    email: "thomas.user@nationalgrid.co.uk",
    name: "Thomas Wilson",
    first_name: "Thomas",
    last_name: "Wilson-User",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_USER",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_AGENT_APPROVED: {
    user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    email: "david.agent@consultant.co.uk",
    name: "David Clarke",
    first_name: "David",
    last_name: "Clarke-Agent",
    organisation_id: null,
    organisation_name: "Multiple Organizations",
    role: "APPLICANT_AGENT",
    is_agent: true,
    status: "APPROVED",
  },
  APPLICANT_AGENT_PARTIALLY_APPROVED: {
    user_id: "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    email: "sofia.agent@engineering.co.uk",
    name: "Sofia Martinez",
    first_name: "Sofia",
    last_name: "Martinez-PartialAgent",
    organisation_id: null,
    organisation_name: "Multiple Organizations (2 approved, 1 pending)",
    role: "APPLICANT_AGENT",
    is_agent: true,
    status: "APPROVED",
  },
};

// Get user type from environment variable (defaults to APPLICANT_TEAM_COORDINATOR)
const DUMMY_USER_TYPE =
  (import.meta.env.VITE_DUMMY_USER_TYPE as string) ||
  "APPLICANT_TEAM_COORDINATOR";
const currentDummyUser =
  DUMMY_USERS[DUMMY_USER_TYPE] || DUMMY_USERS.APPLICANT_TEAM_COORDINATOR;

// Export for backward compatibility
export const DEMO_USER_ID = currentDummyUser.user_id;
export const DEMO_USER_EMAIL = currentDummyUser.email;

// Export all user data for more complex scenarios
export const CURRENT_DUMMY_USER = currentDummyUser;
export { DUMMY_USERS, DUMMY_USER_TYPE };
