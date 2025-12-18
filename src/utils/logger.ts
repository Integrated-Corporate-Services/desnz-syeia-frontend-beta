const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE;
const isDevelopment = isDev || mode === 'local';

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(...args: any[]) {
    if (isDevelopment) {
      console.debug(`[${this.context}]`, ...args);
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(`[${this.context}]`, ...args);
    }
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(`[${this.context}]`, ...args);
    }
  }

  error(...args: any[]) {
    console.error(`[${this.context}]`, ...args);
  }
}

export const createLogger = (context: string) => new Logger(context);
