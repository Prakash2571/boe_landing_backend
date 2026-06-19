/**
 * Password hashing using scrypt from `node:crypto`. Stored format is
 * `salt:derivedKey` (both hex). No external bcrypt dependency required.
 */
import { randomBytes, scryptSync } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, derived] = stored.split(':');
  if (!salt || !derived) return false;
  const candidate = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return constantTimeEqual(candidate, derived);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
