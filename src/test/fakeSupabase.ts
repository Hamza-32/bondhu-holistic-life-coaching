/**
 * A real supabase-js client whose `fetch` is faked, for unit-testing the data layer. Tests see
 * exactly which REST/RPC/auth requests the hooks make (method, path, filters, body) and choose
 * the responses, without any network.
 *
 * Use in a test file:
 *   vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export interface FakeRequest {
  method: string;
  /** "profiles", "rpc/get_feed", "auth/signup"… */
  path: string;
  params: URLSearchParams;
  body: unknown;
  headers: Headers;
}

export interface FakeReply {
  status?: number;
  body?: unknown;
}

interface Handler {
  method: string;
  path: string;
  reply: FakeReply | ((request: FakeRequest) => FakeReply);
}

export const fake = {
  requests: [] as FakeRequest[],
  handlers: [] as Handler[],
  /** Register a response (latest registration wins). */
  on(method: string, path: string, reply: Handler['reply']) {
    this.handlers.unshift({ method: method.toUpperCase(), path, reply });
  },
  /** Requests to a path (optionally one method). */
  to(path: string, method?: string) {
    return this.requests.filter(
      (r) => r.path === path && (method === undefined || r.method === method.toUpperCase()),
    );
  },
  reset() {
    this.requests = [];
    this.handlers = [];
  },
};

async function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = input instanceof Request ? input : null;
  const url = new URL(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
  );
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  const raw = init?.body ?? (request ? await request.text() : null);
  let body: unknown = null;
  if (typeof raw === 'string' && raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  }
  const path = url.pathname.replace(/^\/rest\/v1\//, '').replace(/^\/auth\/v1\//, 'auth/');
  const recorded: FakeRequest = {
    method,
    path,
    params: url.searchParams,
    body,
    headers: new Headers(init?.headers ?? request?.headers),
  };
  fake.requests.push(recorded);

  const handler = fake.handlers.find((h) => h.method === method && h.path === path);
  const reply: FakeReply = handler
    ? typeof handler.reply === 'function'
      ? handler.reply(recorded)
      : handler.reply
    : { body: method === 'GET' ? [] : null };
  const status = reply.status ?? 200;
  const text = reply.body === undefined || reply.body === null ? null : JSON.stringify(reply.body);
  return new Response(status === 204 ? null : text, {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const supabase = createClient<Database>(
  'https://test-project.supabase.co',
  'test-publishable-key-0123456789',
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fakeFetch },
  },
);

/** Drop-in replacement for `@/lib/supabase`. */
export const supabaseModule = {
  supabase,
  isSupabaseConfigured: true,
  requireSupabase: () => supabase,
};

/** A PostgREST-style error body. */
export function pgError(message: string, code = 'P0001'): FakeReply {
  return { status: 400, body: { message, code, details: null, hint: null } };
}
