/**
 * HTTP server wiring: reads the body, builds the request context, applies a
 * permissive same-origin-friendly CORS policy, and dispatches to the router.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { env } from './config/env.js';
import { createContext, readJsonBody } from './http/context.js';
import { buildRouter } from './routes.js';
import type { Router } from './http/router.js';

export function createApp(): Server {
  const router = buildRouter();

  return createServer((req, res) => {
    // Dev-friendly CORS. In production the landing page proxies same-origin, so
    // these headers are a harmless convenience for direct/local calls.
    const origin = req.headers['origin'];
    res.setHeader('Access-Control-Allow-Origin', Array.isArray(origin) ? origin[0] ?? '*' : origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,x-signup-key,x-device-id',
    );

    if ((req.method || '').toUpperCase() === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    void handle(req, res, router);
  });
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  router: Router,
): Promise<void> {
  try {
    const body = req.method === 'GET' ? {} : await readJsonBody(req);
    const ctx = createContext(req, res, body);
    const matched = await router.handle(ctx);
    if (!matched) {
      ctx.json(404, { ok: false, error: 'Not found.' });
    }
  } catch (error) {
    console.error('Unhandled request error:', error);
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Internal server error.' }));
    }
  }
}

export function startServer(): Server {
  return createApp().listen(env.port, () => {
    console.log(`boe_landing_backend listening on http://127.0.0.1:${env.port}`);
  });
}
