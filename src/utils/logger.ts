import { getMode } from '../config/runtimeConfig';

const mode = getMode();
const isDevelopment = mode === 'local' || mode === 'development';

const SENSITIVE_PATTERNS = [
  'password', 'passwd', 'pwd',
  'token', 'accessToken', 'refreshToken', 'sessionToken', 'csrfToken', 'csrf',
  'apiKey', 'api_key', 'secret', 'privateKey',
  'authorization', 'auth',
  'cookie', 'session',
  'email', 'emailAddress',
  'ssn', 'socialSecurityNumber',
  'creditCard', 'cardNumber', 'cvv', 'cvc',
  'accountNumber', 'payment'
];

const redactSensitiveData = (obj: any, depth = 0): any => {
  if (depth > 5) return '[MAX_DEPTH]';
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(item => redactSensitiveData(item, depth + 1));
  
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern =>
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
};

class Logger {
  private context: string;
  private correlationId?: string;

  constructor(context: string, correlationId?: string) {
    this.context = context;
    this.correlationId = correlationId;
  }

  private formatMessage(level: string, ...args: any[]) {
    const prefix = this.correlationId
      ? `[${this.context}] [correlationId: ${this.correlationId}]`
      : `[${this.context}]`;
    
    const redactedArgs = args.map(arg => 
      typeof arg === 'object' ? redactSensitiveData(arg) : arg
    );
    
    return [prefix, ...redactedArgs];
  }

  debug(...args: any[]) {
    if (isDevelopment) {
      console.debug(...this.formatMessage("DEBUG", ...args));
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(...this.formatMessage("INFO", ...args));
    }
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(...this.formatMessage("WARN", ...args));
    }
  }

  error(...args: any[]) {
    const redactedArgs = this.formatMessage("ERROR", ...args);
    if (isDevelopment) {
      console.error(...redactedArgs);
    } else {
      console.error(redactedArgs[0]);
    }
  }
}

export const createLogger = (context: string, correlationId?: string) =>
  new Logger(context, correlationId);
