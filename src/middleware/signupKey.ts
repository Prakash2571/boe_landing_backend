/**
 * Signup gate. The landing server injects a shared `x-signup-key` header so the
 * public signup endpoint can only be reached through the trusted proxy. When no
 * signup key is configured, we fall back to an Origin allow-list.
 */
import type { Ctx } from '../http/context.js';
import { env } from '../config/env.js';

export function isSignupAllowed(ctx: Ctx): boolean {
  if (env.signupProxySecret) {
    return ctx.header('x-signup-key') === env.signupProxySecret;
  }
  // Fallback: only accept signups proxied from the allowed landing origin.
  const origin = ctx.header('origin');
  return !origin || origin === env.signupAllowedOrigin;
}
