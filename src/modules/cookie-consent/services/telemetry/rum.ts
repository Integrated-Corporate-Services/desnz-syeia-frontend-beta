import type { AwsRum, AwsRumConfig } from 'aws-rum-web';
import { getRuntimeEnv } from '../../../../config/runtimeEnv';

// In dev, prefer Vite env so .env overrides aren't masked by runtimeEnv.ts defaults
const getRumConfig = () => ({
  appMonitorId: import.meta.env.DEV
    ? import.meta.env.VITE_RUM_APP_MONITOR_ID
    : getRuntimeEnv('VITE_RUM_APP_MONITOR_ID'),
  identityPoolId: import.meta.env.DEV
    ? import.meta.env.VITE_RUM_IDENTITY_POOL_ID
    : getRuntimeEnv('VITE_RUM_IDENTITY_POOL_ID'),
  region: import.meta.env.DEV
    ? (import.meta.env.VITE_RUM_REGION || import.meta.env.VITE_AWS_REGION || 'eu-west-2')
    : (getRuntimeEnv('VITE_RUM_REGION') || getRuntimeEnv('VITE_AWS_REGION', 'eu-west-2')),
});

const SESSION_SAMPLE_RATE = import.meta.env.DEV ? 1 : 0.1;

let rumClient: AwsRum | null = null;

const getVersion = (): string => {
  try {
    return '1.0.0';
  } catch {
    return '1.0.0';
  }
};

export async function initRum(): Promise<void> {
  if (rumClient) return;
  const { appMonitorId, identityPoolId, region } = getRumConfig();
  if (!appMonitorId || !identityPoolId) return;

  const { AwsRum } = await import('aws-rum-web');

  const config: AwsRumConfig = {
    sessionSampleRate: SESSION_SAMPLE_RATE,
    identityPoolId,
    telemetries: ['performance', 'errors', 'http'],
    allowCookies: true,
    enableXRay: false,
    signing: true,
  };

  rumClient = new AwsRum(appMonitorId, getVersion(), region, config);
}

export function tearDownRum(): void {
  rumClient?.disable();
  rumClient = null;
}

export function recordRumPageView(pageId: string): void {
  rumClient?.recordPageView(pageId);
}
