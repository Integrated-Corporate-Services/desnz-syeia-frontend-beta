import log from 'loglevel';
import { getMode } from './config/runtimeEnv';

const env = getMode();
if (env === 'production' || env === 'staging') {
  //log.setLevel('error'); // Only show errors in production
} else {
  log.setLevel('debug'); // Show all logs in dev/local
}

export default log;
