/**
 * Enhanced Error Handler Utility
 * 
 * Provides comprehensive error handling for API calls and user interactions
 */

import { logger } from './logger';

/**
 * Error types for better categorization
 */
export const ErrorTypes = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * Get user-friendly error message based on error type and status
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Check if it's an axios error with response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data.error || data.message || 'Invalid request. Please check your input.';
      
      case 401:
        return 'Your session has expired. Please log in again.';
      
      case 403:
        return 'You do not have permission to perform this action.';
      
      case 404:
        return data.error || 'The requested resource was not found.';
      
      case 409:
        return data.error || 'This action conflicts with existing data.';
      
      case 422:
        return data.error || 'Validation failed. Please check your input.';
      
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      
      case 500:
        return 'Server error. Our team has been notified. Please try again later.';
      
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      
      default:
        return data.error || data.message || 'An error occurred. Please try again.';
    }
  }

  // Network error (no response from server)
  if (error.request) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Other errors
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Get error type based on error object
 */
export const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  if (error.response) {
    const status = error.response.status;

    if (status === 401) return ErrorTypes.AUTHENTICATION;
    if (status === 403) return ErrorTypes.AUTHORIZATION;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status === 429) return ErrorTypes.RATE_LIMIT;
    if (status === 400 || status === 422) return ErrorTypes.VALIDATION;
    if (status >= 500) return ErrorTypes.SERVER;
  }

  if (error.request) return ErrorTypes.NETWORK;

  return ErrorTypes.UNKNOWN;
};

/**
 * Determine if error should trigger automatic logout
 */
export const shouldLogout = (error) => {
  if (!error || !error.response) return false;
  return error.response.status === 401;
};

/**
 * Determine if error is retryable
 */
export const isRetryableError = (error) => {
  if (!error) return false;

  // Network errors are retryable
  if (error.request && !error.response) return true;

  // Server errors (5xx) are retryable
  if (error.response) {
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  return false;
};

/**
 * Get retry delay based on attempt number (exponential backoff)
 */
export const getRetryDelay = (attemptNumber, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 10000);
};

/**
 * Handle API error with comprehensive error processing
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Handler options
 * @param {Function} options.showSnackbar - Function to show snackbar notification
 * @param {Function} options.onLogout - Function to call on authentication error
 * @param {boolean} options.silent - If true, don't show notification
 * @param {string} options.customMessage - Custom error message to show
 * @returns {Object} Processed error information
 */
export const handleApiError = (error, options = {}) => {
  const {
    showSnackbar,
    onLogout,
    silent = false,
    customMessage
  } = options;

  // Get error details
  const message = customMessage || getErrorMessage(error);
  const type = getErrorType(error);
  const retryable = isRetryableError(error);

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error('API Error:', {
      message,
      type,
      status: error.response?.status,
      data: error.response?.data,
      retryable
    });
  }

  // Handle authentication errors
  if (shouldLogout(error) && onLogout) {
    if (!silent && showSnackbar) {
      showSnackbar(message, 'warning');
    }
    
    // Delay logout to allow user to see the message
    setTimeout(() => {
      onLogout();
    }, 2000);
  } else if (!silent && showSnackbar) {
    // Show error notification
    const severity = type === ErrorTypes.VALIDATION ? 'warning' : 'error';
    showSnackbar(message, severity);
  }

  return {
    message,
    type,
    retryable,
    status: error.response?.status,
    data: error.response?.data
  };
};

/**
 * Retry API call with exponential backoff
 * 
 * @param {Function} apiCall - The API call function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise} The API call result
 */
export const retryApiCall = async (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response.status !== 429) {
          throw error;
        }
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = getRetryDelay(attempt, baseDelay);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, delay, error);
      }

      // Log retry in development
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Retrying API call (attempt ${attempt}/${maxRetries}) after ${delay}ms`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handle form validation errors
 * 
 * @param {Error} error - The error object
 * @returns {Object} Field-specific error messages
 */
export const handleValidationErrors = (error) => {
  const fieldErrors = {};

  if (error.response?.data?.errors) {
    // Handle structured validation errors
    const errors = error.response.data.errors;
    
    if (Array.isArray(errors)) {
      errors.forEach(err => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
    } else if (typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        fieldErrors[field] = errors[field];
      });
    }
  }

  return fieldErrors;
};

/**
 * Create error handler for specific context
 * 
 * @param {Object} context - Context-specific options
 * @returns {Function} Configured error handler
 */
export const createErrorHandler = (context = {}) => {
  return (error, options = {}) => {
    return handleApiError(error, { ...context, ...options });
  };
};

/**
 * Format error for logging/debugging
 */
export const formatErrorForLogging = (error) => {
  return {
    message: error.message,
    stack: error.stack,
    response: error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : null,
    request: error.request ? {
      method: error.config?.method,
      url: error.config?.url
    } : null
  };
};

export default {
  handleApiError,
  retryApiCall,
  getErrorMessage,
  getErrorType,
  shouldLogout,
  isRetryableError,
  getRetryDelay,
  handleValidationErrors,
  createErrorHandler,
  formatErrorForLogging,
  ErrorTypes
};
