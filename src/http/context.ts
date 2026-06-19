/**
 * Request context + helpers that wrap Node's raw `http` request/response into
 * a small, ergonomic object used by every route handler.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { env } from '../config/env.js';

export type CookieOptions = {
  maxAgeSeconds?: number;
  httpOnly?: boolean;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

export type Ctx = {
  req: IncomingMessage;
  res: ServerResponse;
  method: string;
  pathname: string;
  query: Record<string, string>;
  params: Record<string, string>;
  cookies: Record<string, string>;
  body: unknown;
  header(name: string): string;
  json(status: number, payload: unknown): void;
  setCookie(name: string, value: string, options?: CookieOptions): void;
  clearCookie(name: string): void;
};

/** Read and JSON-parse the request body. Returns {} for empty/invalid bodies. */
export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: unknown) => {
      raw += String(chunk);
    });
    req.on('end', () => {
      const trimmed = raw.trim();
      if (!trimmed) return resolve({});
      try {
        resolve(JSON.parse(trimmed));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers['cookie'];
  const value = Array.isArray(header) ? header.join(';') : header || '';
  const out: Record<string, string> = {};
  for (const part of value.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}

/** Split a raw request URL into pathname + decoded query parameters. */
export function parseUrl(rawUrl: string): { pathname: string; query: Record<string, string> } {
  const [path, search = ''] = rawUrl.split('?');
  const query: Record<string, string> = {};
  if (search) {
    for (const pair of search.split('&')) {
      if (!pair) continue;
      const index = pair.indexOf('=');
      const key = index === -1 ? pair : pair.slice(0, index);
      const value = index === -1 ? '' : pair.slice(index + 1);
      query[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    }
  }
  return { pathname: path || '/', query };
}

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);
  if (typeof options.maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  if (env.cookieSecure) parts.push('Secure');
  return parts.join('; ');
}

/** Build the request context, appending cookies safely to existing ones. */
export function createContext(
  req: IncomingMessage,
  res: ServerResponse,
  body: unknown,
): Ctx {
  const { pathname, query } = parseUrl(req.url || '/');
  const pendingCookies: string[] = [];

  function applyCookies(): void {
    if (pendingCookies.length > 0) {
      res.setHeader('Set-Cookie', pendingCookies.slice());
    }
  }

  return {
    req,
    res,
    method: (req.method || 'GET').toUpperCase(),
    pathname,
    query,
    params: {},
    cookies: parseCookies(req),
    body,
    header(name: string): string {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] ?? '' : value ?? '';
    },
    json(status: number, payload: unknown): void {
      applyCookies();
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
    },
    setCookie(name: string, value: string, options: CookieOptions = {}): void {
      pendingCookies.push(serializeCookie(name, value, options));
    },
    clearCookie(name: string): void {
      pendingCookies.push(serializeCookie(name, '', { maxAgeSeconds: 0 }));
    },
  };
}
