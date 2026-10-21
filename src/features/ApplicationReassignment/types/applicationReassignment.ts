export interface EligibleAssignee {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_agent: boolean;
}

export interface AssignmentHistoryEntry {
    previous_assignee_name?: string | null;
    new_assignee_name: string;
    assigned_by_name: string;
    assigned_at: string;
}

export interface AssignmentDetails {
    application_reference: string | null;
    current_assignee_name: string | null;
    history: AssignmentHistoryEntry[];
}

export interface ReassignmentSuccess {
    reference: string;
    name: string;
}
