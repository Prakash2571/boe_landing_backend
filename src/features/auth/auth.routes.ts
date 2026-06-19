/** Auth routes: /v1/auth/signup, /v1/auth/login, /v1/auth/logout. */
import type { Router } from '../../http/router.js';
import type { Ctx } from '../../http/context.js';
import { validateSignup } from '../../lib/validation.js';
import { isSignupAllowed } from '../../middleware/signupKey.js';
import {
  authenticate,
  clearAuthCookies,
  registerUser,
  setAuthCookies,
  type AuthSuccess,
  type ServiceResult,
} from './auth.service.js';

function asObject(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

function sendAuthResult(ctx: Ctx, result: ServiceResult<AuthSuccess>, successStatus: number): void {
  if (!result.ok) {
    ctx.json(result.status, { ok: false, message: result.message });
    return;
  }
  setAuthCookies(ctx, result.value.tokens);
  ctx.json(successStatus, {
    ok: true,
    data: {
      user: result.value.user,
      accessToken: result.value.tokens.accessToken,
      refreshToken: result.value.tokens.refreshToken,
    },
  });
}

export function registerAuthRoutes(router: Router): void {
  router.post('/v1/auth/signup', (ctx) => {
    if (!isSignupAllowed(ctx)) {
      ctx.json(403, { ok: false, message: 'Signup is not allowed from this origin.' });
      return;
    }

    const { ok, values, errors } = validateSignup(asObject(ctx.body));
    if (!ok) {
      ctx.json(400, { ok: false, message: errors[0], details: { errors } });
      return;
    }

    sendAuthResult(ctx, registerUser(values), 201);
  });

  router.post('/v1/auth/login', (ctx) => {
    const body = asObject(ctx.body);
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifier || !password) {
      ctx.json(400, { ok: false, message: 'Enter your email/username and password.' });
      return;
    }

    sendAuthResult(ctx, authenticate(identifier, password), 200);
  });

  router.post('/v1/auth/logout', (ctx) => {
    clearAuthCookies(ctx);
    ctx.json(200, { ok: true });
  });
}
