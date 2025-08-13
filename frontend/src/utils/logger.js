/**
 * Simple logger utility for frontend
 * Provides consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  getLogLevel() {
    const envLevel = process.env.REACT_APP_LOG_LEVEL || 'INFO';
    return LOG_LEVELS[envLevel.toUpperCase()] || LOG_LEVELS.INFO;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (typeof message === 'string') {
      return [prefix, message, ...args];
    } else {
      return [prefix, message, ...args];
    }
  }

  error(message, ...args) {
    if (this.shouldLog('ERROR')) {
      console.error(...this.formatMessage('ERROR', message, ...args));
      
      // In production, you might want to send errors to a logging service
      if (!this.isDevelopment) {
        this.sendToLoggingService('ERROR', message, args);
      }
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('WARN')) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  info(message, ...args) {
    if (this.shouldLog('INFO')) {
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  debug(message, ...args) {
    if (this.shouldLog('DEBUG')) {
      console.debug(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  // Log API calls
  apiCall(method, url, data = null) {
    if (this.isDevelopment) {
      this.debug(`API ${method.toUpperCase()} ${url}`, data);
    }
  }

  // Log API responses
  apiResponse(method, url, status, data = null) {
    if (this.isDevelopment) {
      this.debug(`API ${method.toUpperCase()} ${url} - ${status}`, data);
    }
  }

  // Log user actions
  userAction(action, details = null) {
    this.info(`User Action: ${action}`, details);
  }

  // Log performance metrics
  performance(metric, value, unit = 'ms') {
    if (this.isDevelopment) {
      this.debug(`Performance: ${metric} = ${value}${unit}`);
    }
  }

  // Send to external logging service (placeholder)
  sendToLoggingService(level, message, args) {
    // This would integrate with services like LogRocket, Sentry, etc.
    // For now, it's just a placeholder
    try {
      // Example: Send to external service
      // externalLogger.log({ level, message, args, timestamp: new Date() });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  // Create a timer for performance measurement
  time(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group related logs
  group(label) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  // Log component lifecycle events
  componentMount(componentName) {
    this.debug(`Component mounted: ${componentName}`);
  }

  componentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  // Log route changes
  routeChange(from, to) {
    this.info(`Route change: ${from} -> ${to}`);
  }

  // Log form submissions
  formSubmit(formName, data = null) {
    this.info(`Form submitted: ${formName}`, data);
  }

  // Log authentication events
  authEvent(event, details = null) {
    this.info(`Auth event: ${event}`, details);
  }

  // Log errors with context
  errorWithContext(error, context = {}) {
    this.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { error, warn, info, debug } = logger;

export default logger;
