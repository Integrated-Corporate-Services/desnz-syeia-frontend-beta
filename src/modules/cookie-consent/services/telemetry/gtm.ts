import { getTelemetryConfig, getCurrentEnvironment } from './config';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('GTM');

let _config: ReturnType<typeof getTelemetryConfig> | null = null;
function getConfig() {
  if (!_config) {
    _config = getTelemetryConfig();
  }
  return _config;
}

export function initGTM(): void {
  const config = getConfig();
  const GTM_ID = config.gtmId;
  const ENABLED = config.enableGTM;
  
  if (!ENABLED || !GTM_ID) {
    logger.warn('Not initialized:', { ENABLED, GTM_ID });
    return;
  }
  
  if (document.getElementById('gtm-script')) {
    logger.debug('Already initialized');
    return;
  }

  logger.debug('Initializing with ID:', GTM_ID);
  logger.debug('Detected Environment:', getCurrentEnvironment());

  // Initialize dataLayer
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // Add GTM script to head
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
  logger.debug('Script added to head');

  // Add GTM noscript iframe to body
  const noscript = document.createElement('noscript');
  noscript.id = 'gtm-noscript';
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  
  // Insert at the beginning of body
  if (document.body.firstChild) {
    document.body.insertBefore(noscript, document.body.firstChild);
  } else {
    document.body.appendChild(noscript);
  }
  
  logger.debug('Noscript iframe added to body');
  logger.debug('Initialization complete');
}

export function disableGTM(): void {
  const config = getConfig();
  const GTM_ID = config.gtmId;
  
  if (!GTM_ID) {
    logger.warn('Cannot disable - No GTM ID configured');
    return;
  }
  
  logger.debug('Disabling GTM');
  
  const script = document.getElementById('gtm-script');
  if (script) {
    script.remove();
    logger.debug('Script removed');
  }

  const noscript = document.getElementById('gtm-noscript');
  if (noscript) {
    noscript.remove();
    logger.debug('Noscript iframe removed');
  }
  
  logger.debug('GTM disabled');
}
