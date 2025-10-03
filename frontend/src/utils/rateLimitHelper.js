// Rate limiting helper utilities

class RateLimitHelper {
  constructor() {
    this.lastApiCall = {};
    this.minDelay = 100; // Minimum delay between API calls in ms
  }

  // Add delay before API call to prevent rate limiting
  async addDelay(endpoint = 'default') {
    const now = Date.now();
    const lastCall = this.lastApiCall[endpoint] || 0;
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    this.lastApiCall[endpoint] = Date.now();
  }

  // Exponential backoff for retries
  getRetryDelay(retryCount) {
    return Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
  }

  // Check if error is rate limiting
  isRateLimitError(error) {
    return error?.response?.status === 429 || 
           error?.response?.data?.isRateLimit ||
           error?.message?.toLowerCase().includes('too many requests');
  }

  // Get user-friendly rate limit message
  getRateLimitMessage(error) {
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Reset rate limit tracking for an endpoint
  resetEndpoint(endpoint) {
    delete this.lastApiCall[endpoint];
  }

  // Clear all rate limit tracking
  reset() {
    this.lastApiCall = {};
  }
}

// Create singleton instance
const rateLimitHelper = new RateLimitHelper();

export default rateLimitHelper;

// Export utility functions for convenience
export const addApiDelay = (endpoint) => rateLimitHelper.addDelay(endpoint);
export const getRetryDelay = (retryCount) => rateLimitHelper.getRetryDelay(retryCount);
export const isRateLimitError = (error) => rateLimitHelper.isRateLimitError(error);
export const getRateLimitMessage = (error) => rateLimitHelper.getRateLimitMessage(error);
