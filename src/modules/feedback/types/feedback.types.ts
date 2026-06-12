export interface RadioOption {
  value: string;
  label: string;
}

export interface FormValues {
  satisfaction:  string;
  ease:          string;
  completedTask: string;
  userRole:      string;
  improvements:  string;
}

export interface FormErrors {
  satisfaction?:  string;
  ease?:          string;
  completedTask?: string;
  userRole?:      string;
  improvements?:  string;
}

export interface FeedbackPayload {
  satisfaction:           string;
  ease:                   string;
  completedTask:          string;
  userRole:               string;
  improvements?:          string;
  sourcePage?:            string;
  sourceApplicationType?: string;
  sourceCategory?:        string;
}
