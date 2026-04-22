# RevenueCat Charts API — Field Notes

Empirical findings from probing the live v2 API against Dark Noise's project.
Populated by `scripts/probe.mjs` + `scripts/probe2.mjs` on 2026-04-21.

---

## Base

- Base URL: `https://api.revenuecat.com/v2`
- Auth: `Authorization: Bearer sk_...` (v2 secret key)
- Scopes required for Charts: `charts_metrics:overview:read`, `charts_metrics:charts:read`
- Project ID (Dark Noise): `proj058a6330`

## Rate limits

The API returns per-response headers that give you the real picture:

```
revenuecat-rate-limit-current-limit: 15
revenuecat-rate-limit-current-usage: 11
```

Note: header names are `revenuecat-rate-limit-*`, not `x-ratelimit-*`. The `x-ratelimit-*` headers are **not** present.

| Endpoint | Observed limit |
|---|---|
| `GET /projects/{id}/metrics/overview` | 5 / min |
| `GET /projects/{id}/charts/{name}` | 15 / min |
| `GET /projects/{id}/charts/{name}/options` | 15 / min |

During the probe run (12 chart-data calls in ~60 s) we hit `current-usage: 14` out of 15 without receiving a 429. No `Retry-After` header was ever emitted because we never breached.

## Date format

Chart endpoints require **ISO dates** (`YYYY-MM-DD`), not Unix timestamps. Passing a Unix timestamp returns:

```json
{
  "doc_url": "https://errors.rev.cat/parameter-error",
  "message": "'1774230808' is not a 'date'",
  "object": "error",
  "param": "start_date",
  "retryable": false,
  "type": "parameter_error"
}
```

Internally the API converts them back to Unix seconds in the response (`start_date`, `end_date`, and each `cohort` are Unix seconds).

---

## Valid chart names (authoritative, from a 400 error response)

When you call `/charts/active_subscriptions/options` the API returns the full enum in the error message:

```
actives, actives_movement, actives_new, arr, churn, cohort_explorer,
conversion_to_paying, customers_new, ltv_per_customer, ltv_per_paying_customer,
mrr, mrr_movement, refund_rate, revenue, subscription_retention,
subscription_status, trials, trials_movement, trials_new, customers_active,
trial_conversion_rate
```

21 chart names total. This matches the count in RevenueCat's public announcement of the official MCP.

## Invalid names (negative results)

- `active_subscriptions` → not a chart; overview metric only
- `subscribers`, `new_customers` → overview-metric names, not chart names (chart equivalents are `customers_active` and `customers_new`)

---

## `GET /projects/{id}/metrics/overview`

Returns a `metrics` array. Each entry:

```json
{
  "id": "mrr",
  "name": "MRR",
  "description": "Monthly Recurring Revenue",
  "unit": "$",
  "period": "P28D",       // ISO-8601 duration; "P0D" = point-in-time
  "value": 4561,
  "last_updated_at_iso8601": "2026-04-21T21:58:59.641617+00:00"
}
```

Dark Noise overview captured 2026-04-21:

| Metric | Value | Period |
|---|---|---|
| Active Trials | 67 | point-in-time |
| Active Subscriptions | 2,535 | point-in-time |
| MRR | $4,561 | P28D |
| Revenue (28d) | $4,916 | P28D |
| New Customers (28d) | 1,401 | P28D |
| Active Users (28d) | 13,580 | P28D |
| Transactions (28d) | 627 | P28D |

## `GET /projects/{id}/charts/{name}/options`

Lists valid `filter` and `segment` keys for a chart. Shape:

```json
{
  "filters": [
    { "id": "store", "display_name": "Store", "options": [{ "id": "app_store", "display_name": "App Store" }, ...] },
    { "id": "first_platform", ... },
    { "id": "country", ... },
    ...
  ],
  "segments": [ ... same shape as filters ... ]
}
```

This is the differentiator vs. hardcoding: a tool call against `/options` lets the agent auto-discover that segmenting MRR by `store` is valid before it calls `/charts/mrr?segment=store`.

## `GET /projects/{id}/charts/{name}`

Query params: `resolution` (`day`|`week`|`month`), `start_date`, `end_date` (ISO), optional `segment=<key>`, optional `filter[<key>]=<value>`.

Response shape:

```json
{
  "category": "revenue",
  "display_name": "MRR",
  "resolution": "day",
  "measures": [
    { "display_name": "MRR", "unit": "$", "decimal_precision": 0, "chartable": true }
  ],
  "segments": null,            // or array when segment= was passed
  "filtering_allowed": true,
  "segmenting_allowed": true,
  "summary": { "average": { "MRR": 4539.7 } },
  "user_selectors": { "revenue_type": "revenue" },
  "values": [
    { "cohort": 1774224000, "incomplete": false, "measure": 0, "value": 4540.62 },
    ...
    { "cohort": 1776816000, "incomplete": true,  "measure": 0, "value": 4561.75 }
  ],
  "yaxis": "$",
  "yaxis_currency": "USD"
}
```

### DataPoint fields

- `cohort` — Unix seconds, bucket start
- `incomplete` — boolean, period is unsettled (typically the last bucket)
- `measure` — index into `measures[]` (0 unless the chart is multi-measure)
- `value` — numeric, unit determined by `measures[measure].unit`
- `segment` — index into `segments[]`, only present when `segment=` was passed

### Multi-measure / segmented shape

When `segment=store` is passed, `values[]` grows by `segments.length`. Each `(cohort, segment)` pair is its own row:

```json
{
  "segments": [
    { "display_name": "Total", "is_total": true, "chartable": false },
    { "display_name": "App Store", "is_total": false, "chartable": true },
    { "display_name": "Play Store", ... },
    ...
  ],
  "values": [
    { "cohort": 1768694400, "segment": 0, "measure": 0, "value": 4527.04, "incomplete": false },
    { "cohort": 1768694400, "segment": 1, "measure": 0, "value": 4527.04, "incomplete": false },
    ...
  ]
}
```

Clients need to fan out by `segment` (and `measure` for multi-measure charts like `subscription_status`) when rendering.

---

## `incomplete` flag behavior

- Lives on every `DataPoint`, not on the envelope
- On a 30-day daily MRR probe (2026-03-23 → 2026-04-22), only the last bucket (`cohort: 1776816000`, 2026-04-22) was `incomplete: true`
- Same on the annual monthly probe (last month incomplete)
- The flag is the source of truth; there is **no query param** to filter incomplete periods out server-side. Filtering is a client responsibility.

**Kaizen's policy**: drop `incomplete: true` rows from summary stats by default, but echo them back in the tool response as `dataQuality.incompletePeriods` so the model can caveat.

## Response-shape quirks worth knowing

- `last_computed_at` is always `null` in observed responses — don't rely on it.
- `category` field is free-form (`"revenue"`, etc.) — not an enum to switch on.
- `documentation_link` is a relative path, not a URL. Prefix with `https://www.revenuecat.com/docs/`.
- `user_selectors.revenue_type` defaults to `"revenue"`. Other known value: `"proceeds"` (platform-fees subtracted).
- Overview returns `period: "P0D"` for point-in-time metrics (trials, subs) and `"P28D"` for trailing-28 windows (MRR, revenue).

## Rate-limit headers observed

```
revenuecat-rate-limit-current-limit: 15
revenuecat-rate-limit-current-usage: 11
```

- No `x-ratelimit-*`, no `retry-after` on 2xx responses.
- 429 not observed during probe. Retry-After behavior is assumed to match the documented "wait until next window" pattern; retry logic should respect `Retry-After` header if present and fall back to exponential backoff.

## CDN / edge metadata (not actionable, just noted)

All responses proxy through CloudFront (`IAD55-P2` pop) and Envoy. `x-envoy-upstream-service-time` in 2–3s range for fresh chart queries — CDN cache misses are common, meaning the agent-facing latency is dominated by upstream, not edge. Our 60 s client cache should blunt this.
