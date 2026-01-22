const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE;
const isDevelopment = isDev || mode === "local";

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
    return [prefix, ...args];
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
    console.error(...this.formatMessage("ERROR", ...args));
  }
}

export const createLogger = (context: string, correlationId?: string) =>
  new Logger(context, correlationId);
