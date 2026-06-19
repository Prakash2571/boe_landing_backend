/**
 * Tiny HMAC-SHA256 JWT implementation built on `node:crypto`. Kept dependency
 * free on purpose. Tokens are standard `header.payload.signature` JWTs.
 */
import { createHmac } from 'node:crypto';
import { env } from '../config/env.js';

export type JwtPayload = {
  sub: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
};

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string): string {
  return createHmac('sha256', env.jwtSecret).update(data).digest('base64url');
}

/** Create a signed JWT for the given claims, expiring after `ttlSeconds`. */
export function signToken(
  claims: Pick<JwtPayload, 'sub' | 'role' | 'type'>,
  ttlSeconds: number,
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    ...claims,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

/** Verify a JWT signature + expiry. Returns the payload, or null if invalid. */
export function verifyToken(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  if (!header || !body || !signature) return null;

  const expected = sign(`${header}.${body}`);
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;
    if (typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Length-aware constant-time string comparison to avoid timing leaks. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
