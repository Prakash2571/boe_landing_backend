/**
 * Minimal path router with `:param` support. Routes are registered once at
 * startup and matched per request by HTTP method + path segments.
 */
import type { Ctx } from './context.js';

export type Handler = (ctx: Ctx) => Promise<void> | void;

type Route = {
  method: string;
  segments: string[];
  handler: Handler;
};

function split(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export class Router {
  private routes: Route[] = [];

  add(method: string, path: string, handler: Handler): this {
    this.routes.push({ method: method.toUpperCase(), segments: split(path), handler });
    return this;
  }

  get(path: string, handler: Handler): this {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: Handler): this {
    return this.add('POST', path, handler);
  }

  /** Match the request and invoke the handler. Returns false if no route matched. */
  async handle(ctx: Ctx): Promise<boolean> {
    const requestSegments = split(ctx.pathname);

    for (const route of this.routes) {
      if (route.method !== ctx.method) continue;
      if (route.segments.length !== requestSegments.length) continue;

      const params: Record<string, string> = {};
      let matched = true;

      for (let i = 0; i < route.segments.length; i += 1) {
        const routeSegment = route.segments[i] as string;
        const requestSegment = requestSegments[i] as string;
        if (routeSegment.startsWith(':')) {
          params[routeSegment.slice(1)] = decodeURIComponent(requestSegment);
        } else if (routeSegment !== requestSegment) {
          matched = false;
          break;
        }
      }

      if (matched) {
        ctx.params = params;
        await route.handler(ctx);
        return true;
      }
    }

    return false;
  }
}
