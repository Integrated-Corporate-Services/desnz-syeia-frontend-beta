import type { AwsRum, AwsRumConfig } from 'aws-rum-web';
import { getRuntimeEnv } from '@/config/runtimeEnv';

const getAppMonitorId = (): string => getRuntimeEnv('VITE_RUM_APP_MONITOR_ID', '');
const getIdentityPoolId = (): string => getRuntimeEnv('VITE_RUM_IDENTITY_POOL_ID', '');
const getAwsRegion = (): string => getRuntimeEnv('VITE_AWS_REGION', 'eu-west-2');

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
  
  const appMonitorId = getAppMonitorId();
  const identityPoolId = getIdentityPoolId();
  const awsRegion = getAwsRegion();
  
  if (!appMonitorId || !identityPoolId) return;

  const { AwsRum } = await import('aws-rum-web');

  const config: AwsRumConfig = {
    sessionSampleRate: SESSION_SAMPLE_RATE,
    identityPoolId: identityPoolId,
    telemetries: ['performance', 'errors', 'http'],
    allowCookies: true,
    enableXRay: false,
    signing: true,
  };

  rumClient = new AwsRum(appMonitorId, getVersion(), awsRegion, config);
}

export function tearDownRum(): void {
  rumClient?.disable();
  rumClient = null;
}

export function recordRumPageView(pageId: string): void {
  rumClient?.recordPageView(pageId);
}
