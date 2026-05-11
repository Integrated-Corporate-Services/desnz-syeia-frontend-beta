export enum AnalyticsEvent {
  PageView              = 'page_view',
  FunnelStep            = 'funnel_step',
  FunnelComplete        = 'funnel_complete',
  FormError             = 'form_error',
  InternalSearch        = 'internal_search',
  OutboundLink          = 'outbound_link',
  SectionFirstCompleted = 'section_first_completed',
  ConsentDecision       = 'consent_decision',
}

export interface PageViewParams        { path: string; }
export interface FunnelStepParams      { funnel: string; step: number; step_name: string; }
export interface FunnelCompleteParams  { funnel: string; session_minutes: number; }
export interface FormErrorParams       { form: string; field: string; error_type: 'required' | 'pattern' | 'range'; }
export interface InternalSearchParams  { query: string; result_count: number; }
export interface OutboundLinkParams    { target_domain: string; }
export interface SectionFirstCompletedParams { section: string; total_days: number; }
export interface ConsentDecisionParams {
  source: 'banner' | 'settings_page' | 'withdrawal';
  analytics_accepted: boolean;
  monitoring_accepted: boolean;
}

export type ParamsForEvent<E extends AnalyticsEvent> =
  E extends AnalyticsEvent.PageView              ? PageViewParams :
  E extends AnalyticsEvent.FunnelStep            ? FunnelStepParams :
  E extends AnalyticsEvent.FunnelComplete        ? FunnelCompleteParams :
  E extends AnalyticsEvent.FormError             ? FormErrorParams :
  E extends AnalyticsEvent.InternalSearch        ? InternalSearchParams :
  E extends AnalyticsEvent.OutboundLink          ? OutboundLinkParams :
  E extends AnalyticsEvent.SectionFirstCompleted ? SectionFirstCompletedParams :
  E extends AnalyticsEvent.ConsentDecision       ? ConsentDecisionParams :
  Record<string, unknown>;
