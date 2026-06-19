/**
 * Admin routes for the approvals dashboard. All require an authenticated admin
 * (the landing page forwards the httpOnly access cookie):
 *   GET  /v1/admin/users?status=
 *   POST /v1/admin/users/:id/approve
 *   POST /v1/admin/users/:id/reject
 */
import type { Router } from '../../http/router.js';
import type { Ctx } from '../../http/context.js';
import type { AccountStatus } from '../../types/domain.js';
import { requireAdmin } from '../../middleware/auth.js';
import { toPublicUser } from '../../data/mappers.js';
import { userRepository } from '../../data/userRepository.js';

const VALID_STATUSES: AccountStatus[] = ['pending_review', 'approved', 'rejected'];

function isStatus(value: string): value is AccountStatus {
  return (VALID_STATUSES as string[]).includes(value);
}

async function updateStatus(ctx: Ctx, status: AccountStatus): Promise<void> {
  if (!(await requireAdmin(ctx))) return;

  const id = ctx.params.id || '';
  const target = await userRepository.findById(id);
  if (!target || target.role === 'admin') {
    ctx.json(404, { ok: false, error: 'Account not found.' });
    return;
  }

  const updated = await userRepository.setStatus(id, status);
  if (!updated) {
    ctx.json(404, { ok: false, error: 'Account not found.' });
    return;
  }
  ctx.json(200, { ok: true, user: toPublicUser(updated) });
}

export function registerAdminRoutes(router: Router): void {
  router.get('/v1/admin/users', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const statusFilter = ctx.query.status || '';
    const status = statusFilter && isStatus(statusFilter) ? statusFilter : undefined;

    const learners = await userRepository.listLearners(status);
    const counts = await userRepository.counts();

    ctx.json(200, { ok: true, items: learners.map(toPublicUser), counts });
  });

  router.post('/v1/admin/users/:id/approve', (ctx) => updateStatus(ctx, 'approved'));
  router.post('/v1/admin/users/:id/reject', (ctx) => updateStatus(ctx, 'rejected'));
}
