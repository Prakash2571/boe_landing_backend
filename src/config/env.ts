/**
 * Centralised, server-side-only configuration. Every value has a safe local
 * default so the service runs out of the box in development; override via
 * environment variables in production.
 */

function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export const env = {
  /** Port the API binds to. The landing page proxies /v1 here (default 47502). */
  port: Number(read('PORT', '47502')),

  /** MongoDB connection URL string. e.g. mongodb://127.0.0.1:27017 or an Atlas SRV URI. */
  mongodbUri: read('MONGODB_URI', 'mongodb://127.0.0.1:27017'),

  /** Database name to use within the MongoDB server. */
  mongodbDb: read('MONGODB_DB', 'boe_landing'),

  /** Secret used to sign JWT access/refresh tokens. MUST be set in production. */
  jwtSecret: read('JWT_SECRET', 'dev-insecure-jwt-secret-change-me'),

  /**
   * Shared secret the landing server injects as the `x-signup-key` header on
   * /v1/auth/signup. When empty, signup falls back to an Origin allow-list.
   */
  signupProxySecret: read('SIGNUP_PROXY_SECRET', ''),

  /** Allowed Origin used as the signup fallback gate when no signup key is set. */
  signupAllowedOrigin: read('SIGNUP_ALLOWED_ORIGIN', 'http://127.0.0.1:3100'),

  /** Set to "true" behind HTTPS so auth cookies carry the Secure attribute. */
  cookieSecure: read('COOKIE_SECURE', 'false') === 'true',

  /** Access token lifetime (1 hour). */
  accessTokenTtlSeconds: 60 * 60,

  /** Refresh token lifetime (30 days). */
  refreshTokenTtlSeconds: 60 * 60 * 24 * 30,
} as const;
