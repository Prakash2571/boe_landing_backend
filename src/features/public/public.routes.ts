/** Public catalog routes: /v1/public/courses and /v1/public/plans. */
import type { Router } from '../../http/router.js';
import { courses } from '../../data/courses.js';
import { plans } from '../../data/plans.js';

export function registerPublicRoutes(router: Router): void {
  router.get('/v1/public/courses', (ctx) => {
    const items = courses
      .filter((course) => course.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);
    ctx.json(200, { ok: true, items });
  });

  router.get('/v1/public/plans', (ctx) => {
    const items = plans
      .filter((plan) => plan.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);
    ctx.json(200, { ok: true, items });
  });
}
