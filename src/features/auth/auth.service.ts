/** Auth business logic: token issuance, signup, and login. */
import type { Ctx } from '../../http/context.js';
import type { PublicUser, User } from '../../types/domain.js';
import { env } from '../../config/env.js';
import { signToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';
import { toPublicUser, userStore } from '../../data/store.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../middleware/auth.js';

export type AuthTokens = { accessToken: string; refreshToken: string };

export function issueTokens(user: User): AuthTokens {
  return {
    accessToken: signToken(
      { sub: user.id, role: user.role, type: 'access' },
      env.accessTokenTtlSeconds,
    ),
    refreshToken: signToken(
      { sub: user.id, role: user.role, type: 'refresh' },
      env.refreshTokenTtlSeconds,
    ),
  };
}

/** Set the httpOnly auth cookies the landing page relays back to the browser. */
export function setAuthCookies(ctx: Ctx, tokens: AuthTokens): void {
  ctx.setCookie(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    maxAgeSeconds: env.accessTokenTtlSeconds,
    sameSite: 'Lax',
  });
  ctx.setCookie(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    maxAgeSeconds: env.refreshTokenTtlSeconds,
    sameSite: 'Lax',
  });
}

export function clearAuthCookies(ctx: Ctx): void {
  ctx.clearCookie(ACCESS_COOKIE);
  ctx.clearCookie(REFRESH_COOKIE);
}

export type AuthSuccess = { user: PublicUser; tokens: AuthTokens };

export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; message: string };

export function registerUser(input: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}): ServiceResult<AuthSuccess> {
  if (userStore.existsByEmail(input.email)) {
    return { ok: false, status: 409, message: 'An account with this email already exists.' };
  }
  if (userStore.existsByUsername(input.username)) {
    return { ok: false, status: 409, message: 'This username is already taken.' };
  }

  const user = userStore.create(input);
  return { ok: true, value: { user: toPublicUser(user), tokens: issueTokens(user) } };
}

export function authenticate(identifier: string, password: string): ServiceResult<AuthSuccess> {
  const user = userStore.findByIdentifier(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, status: 401, message: 'Invalid credentials. Please try again.' };
  }
  if (user.status === 'rejected') {
    return { ok: false, status: 403, message: 'This account is not permitted to sign in.' };
  }
  return { ok: true, value: { user: toPublicUser(user), tokens: issueTokens(user) } };
}
