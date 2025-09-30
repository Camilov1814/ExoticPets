// SECRET_HASH utility for Cognito
// ⚠️ WARNING: Using client secrets in frontend code is NOT RECOMMENDED for security reasons
// This is provided as a backup solution only. The recommended approach is to disable
// client secrets in your Cognito App Client configuration.

import CryptoJS from 'crypto-js';
import { createHmac } from 'crypto';


/**
 * Calculate SECRET_HASH for AWS Cognito authentication
 * @param {string} username - The username/email
 * @param {string} clientId - The Cognito App Client ID
 * @param {string} clientSecret - The Cognito App Client Secret
 * @returns {string} - Base64 encoded SECRET_HASH
 */


export const calculateSecretHash = (username, clientId, clientSecret) => {
  const message = username + clientId;
  const hmac = createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
};



/**
 * Get CLIENT_SECRET from environment variables
 * @returns {string|undefined} - The client secret or undefined
 */
export const getClientSecret = () => {
  return import.meta.env.VITE_AWS_USER_POOL_CLIENT_SECRET;
};

/**
 * Check if client secret is configured
 * @returns {boolean} - True if client secret is available
 */
export const hasClientSecret = () => {
  return !!getClientSecret();
};