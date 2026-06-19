/**
 * Minimal ambient type declarations for the Node.js built-ins used by this
 * service. This project is intentionally dependency-free (it runs on Node's
 * built-in `http` and `crypto` modules only), so we ship just enough typings
 * here to build with `tsconfig.types: []` and no `@types/node` install.
 *
 * If you later add `@types/node`, delete this file to avoid duplicate globals.
 */

declare module 'node:http' {
  export interface IncomingMessage {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string | number | readonly string[]): void;
    getHeader(name: string): string | number | string[] | undefined;
    end(chunk?: string): void;
    writableEnded: boolean;
  }

  export interface Server {
    listen(port: number, callback?: () => void): Server;
  }

  export type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

  export function createServer(listener: RequestListener): Server;
}

declare module 'node:crypto' {
  export interface Hashable {
    update(data: string): Hashable;
    digest(encoding: string): string;
  }
  export interface BinaryLike {
    toString(encoding?: string): string;
  }
  export function createHmac(algorithm: string, key: string): Hashable;
  export function randomBytes(size: number): BinaryLike;
  export function scryptSync(password: string, salt: string, keylen: number): BinaryLike;
}

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exit(code?: number): never;
};

declare const console: {
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

declare const Buffer: {
  from(data: string, encoding?: string): { toString(encoding?: string): string };
};
