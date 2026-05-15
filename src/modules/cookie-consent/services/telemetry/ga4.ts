const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
const ENABLED = import.meta.env.VITE_ENABLE_GA4 === 'true';
const DEBUG_MODE = import.meta.env.VITE_GA4_DEBUG !== 'false' && import.meta.env.DEV;

const log = import.meta.env.DEV
  ? (...args: unknown[]) => console.log('[GA4]', ...args)
  : () => undefined;

export function initGa4(): void {
  if (!ENABLED || !MEASUREMENT_ID) return;
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.onerror = () => console.error('[GA4] gtag.js failed to load');
  document.head.appendChild(script);

  const win = window as unknown as { dataLayer: IArguments[]; gtag: (...args: unknown[]) => void };
  win.dataLayer = win.dataLayer ?? [];
  win.gtag = function () { win.dataLayer.push(arguments as unknown as IArguments); };
  win.gtag('js', new Date());
  win.gtag('config', MEASUREMENT_ID, { debug_mode: DEBUG_MODE });
  log(`Initialised (debug_mode=${DEBUG_MODE})`);
}

export function disableGa4(): void {
  if (!MEASUREMENT_ID) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = true;
  document.getElementById('ga4-script')?.remove();
}
