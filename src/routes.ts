/** Builds the application router by registering every feature's routes. */
import { Router } from './http/router.js';
import { registerAuthRoutes } from './features/auth/auth.routes.js';
import { registerPublicRoutes } from './features/public/public.routes.js';
import { registerAdminRoutes } from './features/admin/admin.routes.js';
import { registerOnboardingRoutes } from './features/onboarding/onboarding.routes.js';

export function buildRouter(): Router {
  const router = new Router();

  // Health/status. The backend is an API only — it never serves the public
  // landing page, so the root path returns a small JSON status instead.
  router.get('/', (ctx) => ctx.json(200, { ok: true, service: 'boe_landing_backend' }));
  router.get('/v1/health', (ctx) => ctx.json(200, { ok: true, status: 'healthy' }));

  registerAuthRoutes(router);
  registerPublicRoutes(router);
  registerAdminRoutes(router);
  registerOnboardingRoutes(router);

  return router;
}
