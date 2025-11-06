import log from 'loglevel';

const env = import.meta.env.MODE;
if (env === 'production' || env === 'prod' || env === 'staging') {
  //log.setLevel('error'); // Only show errors in production
} else {
  log.setLevel('debug'); // Show all logs in dev/local
}

export default log;
