/**
 * Error handling utility for user-friendly error messages
 * Logs actual errors to console for debugging while showing clean messages to users
 */

/**
 * Maps common error messages to user-friendly versions
 */
const ERROR_MESSAGES = {
  // Auth errors
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email address before signing in.",
  "User already registered": "An account with this email already exists.",
  "User not found": "No account found with this email address.",
  "Password should be at least 6 characters":
    "Password must be at least 6 characters long.",

  // Network errors
  "Failed to fetch": "Unable to connect to the server. Please check your internet connection.",
  "Network request failed":
    "Unable to connect to the server. Please check your internet connection.",
  "NetworkError": "Unable to connect to the server. Please check your internet connection.",
  "TypeError: Failed to fetch":
    "Unable to connect to the server. Please check your internet connection.",

  // Server errors
  "Internal Server Error": "Something went wrong on our end. Please try again later.",
  "Service Unavailable": "The service is temporarily unavailable. Please try again later.",
  "Bad Gateway": "Unable to connect to the service. Please try again later.",
  "Gateway Timeout": "The request timed out. Please try again.",

  // Generic fallbacks
  "500": "Something went wrong on our end. Please try again later.",
  "502": "Unable to connect to the service. Please try again later.",
  "503": "The service is temporarily unavailable. Please try again later.",
  "504": "The request timed out. Please try again.",
};

/**
 * Gets a user-friendly error message for display
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (error) => {
  // Handle null/undefined
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  // Get error message
  const errorMessage =
    typeof error === "string" ? error : error.message || String(error);

  // Check for exact matches
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }

  // Check for partial matches (case insensitive)
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch")
  ) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Auth errors
  if (
    lowerMessage.includes("invalid login") ||
    lowerMessage.includes("invalid credentials") ||
    lowerMessage.includes("invalid email or password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "Please verify your email address before signing in.";
  }

  if (lowerMessage.includes("already registered")) {
    return "An account with this email already exists.";
  }

  // Server errors
  if (
    lowerMessage.includes("internal server error") ||
    lowerMessage.includes("500")
  ) {
    return "Something went wrong on our end. Please try again later.";
  }

  if (
    lowerMessage.includes("service unavailable") ||
    lowerMessage.includes("503")
  ) {
    return "The service is temporarily unavailable. Please try again later.";
  }

  if (lowerMessage.includes("bad gateway") || lowerMessage.includes("502")) {
    return "Unable to connect to the service. Please try again later.";
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("504")) {
    return "The request timed out. Please try again.";
  }

  // Upload errors
  if (lowerMessage.includes("upload")) {
    return "File upload failed. Please try again.";
  }

  // If error message is short and seems user-friendly already, use it
  if (errorMessage.length < 100 && !lowerMessage.includes("error")) {
    return errorMessage;
  }

  // Default fallback
  return "An unexpected error occurred. Please try again.";
};

/**
 * Handles and logs errors consistently
 * @param {Error|string} error - The error to handle
 * @param {string} context - Context where the error occurred (for logging)
 * @returns {string} User-friendly error message
 */
export const handleError = (error, context = "") => {
  // Log the actual error for debugging
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error("Error:", error);
  }

  // Return user-friendly message
  return getUserFriendlyError(error);
};

/**
 * Handles API response errors
 * @param {Response} response - Fetch API response object
 * @param {string} context - Context where the error occurred
 * @returns {Promise<string>} User-friendly error message
 */
export const handleApiError = async (response, context = "") => {
  let errorMessage = "";

  try {
    // Try to parse error from response body
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || response.statusText;
  } catch (e) {
    // If parsing fails, use status text
    errorMessage = response.statusText || `HTTP ${response.status}`;
  }

  // Log the actual error
  console.error(
    `API Error in ${context}:`,
    {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
    }
  );

  // Return user-friendly message
  return getUserFriendlyError(errorMessage);
};
