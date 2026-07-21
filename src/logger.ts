import log from 'loglevel';
import { getMode } from './config/runtimeConfig';

const env = getMode();
if (env === 'production' || env === 'prod' || env === 'staging') {
  //log.setLevel('error'); // Only show errors in production
} else {
  log.setLevel('debug'); // Show all logs in dev/local
}

export default log;
