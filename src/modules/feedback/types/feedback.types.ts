export interface RadioOption {
  value: string;
  label: string;
}

export interface FormValues {
  completedTask: string;
  satisfaction:  string;
  ease:          string;
  likelihood:    string;
  improvements:  string;
}

export interface FormErrors {
  completedTask?: string;
  satisfaction?:  string;
  ease?:          string;
  likelihood?:    string;
  improvements?:  string;
}

/** Shape sent to POST /api/feedback */
export interface FeedbackPayload {
  completedTask:          string;
  satisfaction:           string;
  ease:                   string;
  likelihood:             string;
  improvements?:          string;
  sourcePage?:            string;
  sourceApplicationType?: string;
  sourceCategory?:        string;
}
