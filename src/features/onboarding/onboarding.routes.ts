/** Lead capture: POST /v1/onboarding/applications (from the public lead form). */
import type { Router } from '../../http/router.js';
import { validateLead } from '../../lib/validation.js';
import { leadRepository } from '../../data/leadRepository.js';

function asObject(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

export function registerOnboardingRoutes(router: Router): void {
  router.post('/v1/onboarding/applications', async (ctx) => {
    const { ok, values, errors } = validateLead(asObject(ctx.body));
    if (!ok) {
      ctx.json(400, { ok: false, message: errors[0], details: { errors } });
      return;
    }

    const lead = await leadRepository.create({
      name: values.name,
      email: values.email,
      phone: values.phone,
      ...(values.interest ? { interest: values.interest } : {}),
      ...(values.message ? { message: values.message } : {}),
    });

    ctx.json(201, { ok: true, id: lead.id, status: lead.status });
  });
}
