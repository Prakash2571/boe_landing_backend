/** Public catalog routes: /v1/public/courses and /v1/public/plans. */
import type { Router } from '../../http/router.js';
import { courseRepository } from '../../data/courseRepository.js';
import { planRepository } from '../../data/planRepository.js';

export function registerPublicRoutes(router: Router): void {
  router.get('/v1/public/courses', async (ctx) => {
    const items = await courseRepository.listPublished();
    ctx.json(200, { ok: true, items });
  });

  router.get('/v1/public/plans', async (ctx) => {
    const items = await planRepository.listPublished();
    ctx.json(200, { ok: true, items });
  });
}
