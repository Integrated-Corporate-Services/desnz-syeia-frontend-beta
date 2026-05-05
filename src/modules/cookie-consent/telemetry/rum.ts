import type { AwsRum, AwsRumConfig } from 'aws-rum-web';

const APP_MONITOR_ID   = import.meta.env.VITE_RUM_APP_MONITOR_ID;
const IDENTITY_POOL_ID = import.meta.env.VITE_RUM_IDENTITY_POOL_ID;
const AWS_REGION       = import.meta.env.VITE_AWS_REGION ?? 'eu-west-2';

const SESSION_SAMPLE_RATE = import.meta.env.DEV ? 1 : 0.1;

let rumClient: AwsRum | null = null;

const getVersion = (): string => {
  try {
    return '1.0.0'; // Fallback version
  } catch {
    return '1.0.0';
  }
};

export async function initRum(): Promise<void> {
  if (rumClient) return;
  if (!APP_MONITOR_ID || !IDENTITY_POOL_ID) return;

  const { AwsRum } = await import('aws-rum-web');

  const config: AwsRumConfig = {
    sessionSampleRate: SESSION_SAMPLE_RATE,
    identityPoolId: IDENTITY_POOL_ID,
    telemetries: ['performance', 'errors', 'http'],
    allowCookies: true,
    enableXRay: false,
    signing: true,
  };

  rumClient = new AwsRum(APP_MONITOR_ID, getVersion(), AWS_REGION, config);
}

export function tearDownRum(): void {
  rumClient?.disable();
  rumClient = null;
}

export function recordRumPageView(pageId: string): void {
  rumClient?.recordPageView(pageId);
}
