// Analytics Module - Google Analytics 4 & Real User Monitoring
// Provides tracking functionality for user interactions and page views

export { usePageTracking } from './hooks';
export { track } from './services';
export { stripPii } from './utils';
export {
  AnalyticsEvent,
  type PageViewParams,
  type FunnelStepParams,
  type FunnelCompleteParams,
  type FormErrorParams,
  type InternalSearchParams,
  type OutboundLinkParams,
  type SectionFirstCompletedParams,
  type ConsentDecisionParams,
  type ParamsForEvent,
} from './types';
