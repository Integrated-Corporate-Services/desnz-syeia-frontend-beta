import { getTelemetryConfig, getCurrentEnvironment } from './config';

const config = getTelemetryConfig();
const GTM_ID = config.gtmId;
const ENABLED = config.enableGTM;

export function initGTM(): void {
  if (!ENABLED || !GTM_ID) {
    console.warn('[GTM] Not initialized:', { ENABLED, GTM_ID });
    return;
  }
  
  if (document.getElementById('gtm-script')) {
    console.log('[GTM] Already initialized');
    return;
  }

  console.log('[GTM] Initializing with ID:', GTM_ID);
  console.log('[GTM] Detected Environment:', getCurrentEnvironment());

  // Add GTM script to head
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
  console.log('[GTM] Script added to head');

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
  
  console.log('[GTM] Noscript iframe added to body');
  console.log('[GTM] Initialization complete');
}

export function disableGTM(): void {
  if (!GTM_ID) {
    console.warn('[GTM] Cannot disable - No GTM ID configured');
    return;
  }
  
  console.log('[GTM] Disabling GTM');
  
  const script = document.getElementById('gtm-script');
  if (script) {
    script.remove();
    console.log('[GTM] Script removed');
  }

  const noscript = document.getElementById('gtm-noscript');
  if (noscript) {
    noscript.remove();
    console.log('[GTM] Noscript iframe removed');
  }
  
  console.log('[GTM] GTM disabled');
}
