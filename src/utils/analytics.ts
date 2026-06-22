/**
 * Google Analytics dataLayer utility functions
 * 
 * Provides helper functions to push events to the GTM dataLayer
 * for tracking user interactions and page views.
 */

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

/**
 * Initialize dataLayer if it doesn't exist
 */
const ensureDataLayer = (): void => {
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }
};

/**
 * Push an event to the GTM dataLayer
 * 
 * @param event - Event name (e.g., 'button_click', 'page_view')
 * @param data - Additional event data
 */
export const pushDataLayer = (event: string, data?: Record<string, unknown>): void => {
  ensureDataLayer();
  
  if (typeof window !== 'undefined' && window.dataLayer) {
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    window.dataLayer.push(eventData);
    
    // Log in development mode for debugging
    if (import.meta.env.DEV) {
      console.log('[Analytics] dataLayer.push:', eventData);
    }
  }
};

/**
 * Track page view
 * 
 * @param pagePath - The page path (e.g., '/application-dashboard')
 * @param pageTitle - The page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  pushDataLayer('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
};

/**
 * Track button click
 * 
 * @param buttonLabel - The button label/text
 * @param pagePath - The current page path
 * @param additionalData - Any additional data to track
 */
export const trackButtonClick = (
  buttonLabel: string, 
  pagePath: string, 
  additionalData?: Record<string, unknown>
): void => {
  pushDataLayer('button_click', {
    button_label: buttonLabel,
    page_path: pagePath,
    ...additionalData,
  });
};

/**
 * Track application journey events
 * 
 * @param eventName - Specific journey event (e.g., 'sign_in', 'start_application')
 * @param data - Event-specific data
 */
export const trackJourneyEvent = (eventName: string, data?: Record<string, unknown>): void => {
  pushDataLayer('journey_event', {
    journey_event: eventName,
    ...data,
  });
};

/**
 * Track payment events
 * 
 * @param paymentAction - Payment action (e.g., 'payment_method_selected', 'payment_confirmed')
 * @param data - Payment-specific data
 */
export const trackPaymentEvent = (paymentAction: string, data?: Record<string, unknown>): void => {
  pushDataLayer('payment_event', {
    payment_action: paymentAction,
    ...data,
  });
};
