import { TtlCache, stableKey } from './cache';
import type {
  ChartOptionsResponse,
  ChartResponse,
  ChartsError,
  OverviewResponse,
  Resolution,
} from './types';

const BASE = 'https://api.revenuecat.com/v2';
const DEFAULT_TTL_MS = 60_000;
const MAX_RETRIES = 3;

export type ClientOptions = {
  apiKey?: string;
  projectId?: string;
  baseUrl?: string;
  ttlMs?: number;
  fetchImpl?: typeof fetch;
};

export type RequestMeta = {
  cached: boolean;
  ms: number;
  attempts: number;
  rateLimit?: { limit: number; usage: number };
};

export type ChartsResult<T> = { data: T; meta: RequestMeta };

function jitter(baseMs: number, attempt: number): number {
  const exp = baseMs * 2 ** attempt;
  return exp / 2 + Math.random() * (exp / 2);
}

export class ChartsClient {
  private apiKey: string;
  private projectId: string;
  private baseUrl: string;
  private fetchImpl: typeof fetch;
  private cache: TtlCache<unknown>;

  constructor(opts: ClientOptions = {}) {
    const apiKey = opts.apiKey ?? process.env.RC_CHARTS_API_KEY;
    const projectId = opts.projectId ?? process.env.RC_PROJECT_ID;
    if (!apiKey) throw new Error('RC_CHARTS_API_KEY missing');
    if (!projectId) throw new Error('RC_PROJECT_ID missing');
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.baseUrl = opts.baseUrl ?? BASE;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.cache = new TtlCache<unknown>(opts.ttlMs ?? DEFAULT_TTL_MS);
  }

  private async request<T>(path: string, cacheKey: string): Promise<ChartsResult<T>> {
    const cached = this.cache.get(cacheKey) as T | undefined;
    if (cached) return { data: cached, meta: { cached: true, ms: 0, attempts: 0 } };

    const url = `${this.baseUrl}${path}`;
    const started = Date.now();
    let attempts = 0;
    let rateLimit: RequestMeta['rateLimit'];

    while (attempts < MAX_RETRIES) {
      attempts += 1;
      const res = await this.fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      const limitHdr = res.headers.get('revenuecat-rate-limit-current-limit');
      const usageHdr = res.headers.get('revenuecat-rate-limit-current-usage');
      if (limitHdr && usageHdr) {
        rateLimit = { limit: Number(limitHdr), usage: Number(usageHdr) };
      }

      if (res.ok) {
        const body = (await res.json()) as T;
        this.cache.set(cacheKey, body);
        return { data: body, meta: { cached: false, ms: Date.now() - started, attempts, rateLimit } };
      }

      if (res.status === 429 && attempts < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get('retry-after') ?? 0);
        const delay = retryAfter > 0 ? retryAfter * 1000 : jitter(500, attempts);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (res.status >= 500 && attempts < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, jitter(500, attempts)));
        continue;
      }

      const err = (await res.json().catch(() => null)) as ChartsError | null;
      const msg = err?.message ?? `Charts API ${res.status}`;
      throw Object.assign(new Error(msg), { status: res.status, rcError: err });
    }

    throw new Error('ChartsClient: exhausted retries');
  }

  async getOverview(): Promise<ChartsResult<OverviewResponse>> {
    return this.request<OverviewResponse>(
      `/projects/${this.projectId}/metrics/overview`,
      stableKey(['overview', this.projectId]),
    );
  }

  async describeChart(name: string): Promise<ChartsResult<ChartOptionsResponse>> {
    return this.request<ChartOptionsResponse>(
      `/projects/${this.projectId}/charts/${name}/options`,
      stableKey(['options', this.projectId, name]),
    );
  }

  async getChart(args: {
    name: string;
    resolution: Resolution;
    start_date: string;
    end_date: string;
    segment?: string;
    filter?: Record<string, string>;
  }): Promise<ChartsResult<ChartResponse>> {
    const params = new URLSearchParams({
      resolution: args.resolution,
      start_date: args.start_date,
      end_date: args.end_date,
    });
    if (args.segment) params.set('segment', args.segment);
    if (args.filter) {
      for (const [k, v] of Object.entries(args.filter)) params.set(`filter[${k}]`, v);
    }
    const qs = params.toString();
    const path = `/projects/${this.projectId}/charts/${args.name}?${qs}`;
    return this.request<ChartResponse>(path, stableKey(['chart', this.projectId, args.name, qs]));
  }
}
