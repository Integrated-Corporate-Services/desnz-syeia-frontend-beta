import { getTelemetryConfig, getCurrentEnvironment } from './config';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('GTM');

const TRUSTED_GTM_DOMAIN = 'www.googletagmanager.com';
const TRUSTED_GTM_PROTOCOL = 'https:';

let _config: ReturnType<typeof getTelemetryConfig> | null = null;
function getConfig() {
  if (!_config) {
    _config = getTelemetryConfig();
  }
  return _config;
}

function validateGTMUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== TRUSTED_GTM_PROTOCOL) {
      logger.error('Invalid GTM protocol', { protocol: urlObj.protocol });
      return false;
    }
    if (urlObj.hostname !== TRUSTED_GTM_DOMAIN) {
      logger.error('Invalid GTM domain', { domain: urlObj.hostname });
      return false;
    }
    return true;
  } catch (error) {
    logger.error('Invalid GTM URL', { url, error });
    return false;
  }
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

  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  const scriptSrc = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  
  if (!validateGTMUrl(scriptSrc)) {
    logger.error('GTM URL validation failed - aborting initialization');
    return;
  }

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = scriptSrc;
  script.setAttribute('crossorigin', 'anonymous');
  
  script.addEventListener('error', () => {
    logger.error('Failed to load GTM script', { src: scriptSrc });
  });
  
  script.addEventListener('load', () => {
    logger.debug('GTM script loaded successfully');
  });
  
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
  logger.debug('Script added to head');

  const iframeSrc = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  
  if (!validateGTMUrl(iframeSrc)) {
    logger.error('GTM iframe URL validation failed - skipping noscript');
    return;
  }

  const noscript = document.createElement('noscript');
  noscript.id = 'gtm-noscript';
  const iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  noscript.appendChild(iframe);
  
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
