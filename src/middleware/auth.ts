/** Authentication helpers: resolve the current user from the access cookie. */
import type { Ctx } from '../http/context.js';
import type { User } from '../types/domain.js';
import { verifyToken } from '../lib/jwt.js';
import { userRepository } from '../data/userRepository.js';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

/** Returns the authenticated user, or null when there is no valid session. */
export async function getAuthUser(ctx: Ctx): Promise<User | null> {
  const token = ctx.cookies[ACCESS_COOKIE];
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.type !== 'access') return null;

  return userRepository.findById(payload.sub);
}

/**
 * Guard for admin-only routes. Responds with 401/403 and returns null when the
 * caller is not an authenticated admin; otherwise returns the admin user.
 */
export async function requireAdmin(ctx: Ctx): Promise<User | null> {
  const user = await getAuthUser(ctx);
  if (!user) {
    ctx.json(401, { ok: false, error: 'Authentication required.' });
    return null;
  }
  if (user.role !== 'admin') {
    ctx.json(403, { ok: false, error: 'Admin access required.' });
    return null;
  }
  return user;
}
