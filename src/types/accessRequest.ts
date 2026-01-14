// Access request type definitions
export interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
  status: string;
}

export interface DashboardStats {
  pendingRequests: number;
  activeUsers: number;
  totalRequests: number;
  approvedRequests: number;
}