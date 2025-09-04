export interface Application {
  application_id?: string;
  type: 'NWL' | 'S37';
  operator_ref?: string;
  project_name?: string;
  project_desc?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  submitted_at?: string;
}
