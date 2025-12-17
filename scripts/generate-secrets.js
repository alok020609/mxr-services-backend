#!/usr/bin/env node

/**
 * Secret Generator Utility
 * Generates cryptographically secure random secrets for JWT tokens
 */

const crypto = require('crypto');

/**
 * Generate a secure random secret
 * @param {number} bytes - Number of bytes to generate (default: 32)
 * @returns {string} Hex-encoded random string
 */
function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate JWT secrets
 * @returns {Object} Object containing JWT_SECRET and JWT_REFRESH_SECRET
 */
function generateJWTSecrets() {
  return {
    JWT_SECRET: generateSecret(32), // 64 hex characters
    JWT_REFRESH_SECRET: generateSecret(32), // 64 hex characters
  };
}

// If run directly, output secrets
if (require.main === module) {
  const secrets = generateJWTSecrets();
  console.log('Generated Secrets:');
  console.log('==================');
  console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
  console.log(`JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}`);
  console.log('\n⚠️  Keep these secrets secure! Do not commit them to version control.');
}

module.exports = {
  generateSecret,
  generateJWTSecrets,
};
