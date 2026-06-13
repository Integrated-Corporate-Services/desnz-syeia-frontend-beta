const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const ENABLED = import.meta.env.VITE_ENABLE_GTM === 'true';
const DEBUG_MODE = import.meta.env.VITE_GTM_DEBUG !== 'false' && import.meta.env.DEV;

const log = import.meta.env.DEV
  ? (...args: unknown[]) => console.log('[GTM]', ...args)
  : () => undefined;

export function initGTM(): void {
  if (!ENABLED || !GTM_ID) return;
  if (document.getElementById('gtm-script')) return;

  log(`Initializing GTM with ID: ${GTM_ID}`);

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

  log(`Initialized (debug_mode=${DEBUG_MODE})`);
}

export function disableGTM(): void {
  if (!GTM_ID) return;
  
  // Remove GTM script
  const script = document.getElementById('gtm-script');
  if (script) {
    script.remove();
    log('GTM script removed');
  }

  // Remove GTM noscript
  const noscript = document.getElementById('gtm-noscript');
  if (noscript) {
    noscript.remove();
    log('GTM noscript removed');
  }

  // Disable GTM tracking
  const win = window as unknown as Record<string, unknown>;
  win[`ga-disable-${GTM_ID}`] = true;
  
  log('Disabled');
}
