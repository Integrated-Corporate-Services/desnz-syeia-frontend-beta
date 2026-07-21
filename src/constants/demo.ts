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
    name: "Sarah Williams",
    first_name: "Sarah",
    last_name: "Williams-Admin",
    organisation_id: null,
    organisation_name: "DESNZ",
    role: "DESNZ_ADMIN",
    is_agent: false,
    status: "APPROVED",
  },
  DESNZ_ADMIN_2: {
    user_id: "d5e6f7a8-b9c0-1234-def2-345678901234",
    email: "michael.thompson@ics.gov.uk",
    name: "Michael Thompson",
    first_name: "Michael",
    last_name: "Thompson-Admin",
    organisation_id: null,
    organisation_name: "DESNZ",
    role: "DESNZ_ADMIN",
    is_agent: false,
    status: "APPROVED",
  },
  DESNZ_CASEWORKER_1: {
    user_id: "d6e7f8a9-b0c1-2345-def3-456789012345",
    email: "rachel.green@ics.gov.uk",
    name: "Rachel Green",
    first_name: "Rachel",
    last_name: "Green-Caseworker",
    organisation_id: null,
    organisation_name: "DESNZ",
    role: "DESNZ_CASEWORKER",
    is_agent: false,
    status: "APPROVED",
  },
  DESNZ_CASEWORKER_2: {
    user_id: "d7e8f9a0-b1c2-3456-def4-567890123456",
    email: "james.carter@ics.gov.uk",
    name: "James Carter",
    first_name: "James",
    last_name: "Carter-Caseworker",
    organisation_id: null,
    organisation_name: "DESNZ",
    role: "DESNZ_CASEWORKER",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_NG: {
    user_id: "a3333333-3333-3333-3333-333333333333",
    email: "hannah.martin@nationalgrid.co.uk",
    name: "Hannah Martin",
    first_name: "Hannah",
    last_name: "Martin-NG-TC",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_NG_2: {
    user_id: "a4444444-4444-4444-4444-444444444444",
    email: "jennifer.foster@nationalgrid.co.uk",
    name: "Jennifer Foster",
    first_name: "Jennifer",
    last_name: "Foster-NG-TC",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_SSEN: {
    user_id: "a1111111-1111-1111-1111-111111111111",
    email: "maria.peterson@sse.com",
    name: "Maria Peterson",
    first_name: "Maria",
    last_name: "Peterson-SSEN-TC",
    organisation_id: "66666666-6666-6666-6666-666666666666",
    organisation_name: "Southern Electric Power Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_SSEN_2: {
    user_id: "a2222222-2222-2222-2222-222222222222",
    email: "christine.harris@sse.com",
    name: "Christine Harris",
    first_name: "Christine",
    last_name: "Harris-SSEN-TC",
    organisation_id: "66666666-6666-6666-6666-666666666666",
    organisation_name: "Southern Electric Power Distribution",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_ENWL: {
    user_id: "b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0",
    email: "emma.davies@enwl.co.uk",
    name: "Emma Davies",
    first_name: "Emma",
    last_name: "Davies-ENWL-TC",
    organisation_id: "11111111-1111-1111-1111-111111111111",
    organisation_name: "Electricity North West",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_TEAM_COORDINATOR_UKPN: {
    user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    email: "simon.brooks@ukpowernetworks.co.uk",
    name: "Simon Brooks",
    first_name: "Simon",
    last_name: "Brooks-UKPN-TC",
    organisation_id: "77777777-7777-7777-7777-777777777777",
    organisation_name: "UK Power Networks",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_PREPOPULATED_TEAM_COORDINATOR_NGT: {
    user_id: "a5555555-5555-5555-5555-555555555555",
    email: "elizabeth.parker@nationalgrid.com",
    name: "Elizabeth Parker",
    first_name: "Elizabeth",
    last_name: "Parker-NGET-TC",
    organisation_id: "33333333-3333-3333-3333-333333333333",
    organisation_name: "National Grid Electricity Transmission",
    role: "APPLICANT_TEAM_COORDINATOR",
    is_agent: false,
    status: "PREPOPULATED",
  },
  APPLICANT_USER_APPROVED_NG: {
    user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    email: "thomas.user@nationalgrid.co.uk",
    name: "Thomas Wilson",
    first_name: "Thomas",
    last_name: "Wilson-NG-User",
    organisation_id: "22222222-2222-2222-2222-222222222222",
    organisation_name: "National Grid Electricity Distribution",
    role: "APPLICANT_USER",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_USER_APPROVED_SSEN: {
    user_id: "e1f2a3b4-c5d6-8901-cdef-234567890123",
    email: "robert.user@sse.com",
    name: "Robert Brown",
    first_name: "Robert",
    last_name: "Brown-SSEN-User",
    organisation_id: "66666666-6666-6666-6666-666666666666",
    organisation_name: "Southern Electric Power Distribution",
    role: "APPLICANT_USER",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_USER_APPROVED_ENWL: {
    user_id: "a2b3c4d5-e6f7-9012-abcd-345678901234",
    email: "linda.user@enwl.co.uk",
    name: "Linda Green",
    first_name: "Linda",
    last_name: "Green-ENWL-User",
    organisation_id: "11111111-1111-1111-1111-111111111111",
    organisation_name: "Electricity North West",
    role: "APPLICANT_USER",
    is_agent: false,
    status: "APPROVED",
  },
  APPLICANT_USER_APPROVED_UKPN: {
    user_id: "a3b4c5d6-e7f8-0123-abcd-456789012345",
    email: "oliver.user@ukpowernetworks.co.uk",
    name: "Oliver Taylor",
    first_name: "Oliver",
    last_name: "Taylor-UKPN-User",
    organisation_id: "77777777-7777-7777-7777-777777777777",
    organisation_name: "UK Power Networks",
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

import { getRuntimeEnv } from '../config/runtimeConfig';

// Get user type from environment variable (defaults to APPLICANT_TEAM_COORDINATOR_NG)
const DUMMY_USER_TYPE = getRuntimeEnv('VITE_DUMMY_USER_TYPE', 'APPLICANT_TEAM_COORDINATOR_NG');
const currentDummyUser =
  DUMMY_USERS[DUMMY_USER_TYPE] || DUMMY_USERS.APPLICANT_TEAM_COORDINATOR_NG;

// Export for backward compatibility
export const DEMO_USER_ID = currentDummyUser.user_id;
export const DEMO_USER_EMAIL = currentDummyUser.email;

// Export all user data for more complex scenarios
export const CURRENT_DUMMY_USER = currentDummyUser;
export { DUMMY_USERS, DUMMY_USER_TYPE };
