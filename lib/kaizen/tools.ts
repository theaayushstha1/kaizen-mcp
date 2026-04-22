import { tool } from 'ai';
import { z } from 'zod';
import { ChartsClient } from './client';
import { filterSettled, summarizeQuality } from './incomplete';
import { CHART_NAMES } from './types';

const ChartNameEnum = z.enum(CHART_NAMES);
const ResolutionEnum = z.enum(['day', 'week', 'month']);
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');

export function buildTools(client: ChartsClient) {
  return {
    kaizen_list_charts: tool({
      description:
        'Return the full list of chart names supported by the RevenueCat Charts API. Use this first when the user asks what you can do.',
      parameters: z.object({}),
      execute: async () => ({
        charts: CHART_NAMES,
        count: CHART_NAMES.length,
      }),
    }),

    kaizen_get_overview: tool({
      description:
        'Get a point-in-time snapshot of the project: active trials, active subscriptions, MRR, revenue, new customers, active users, transactions. Use for "how is the business doing right now?" questions.',
      parameters: z.object({}),
      execute: async () => {
        const { data, meta } = await client.getOverview();
        return {
          metrics: data.metrics.map((m) => ({
            id: m.id,
            name: m.name,
            value: m.value,
            unit: m.unit,
            period: m.period,
            description: m.description,
            lastUpdated: m.last_updated_at_iso8601,
          })),
          meta,
        };
      },
    }),

    kaizen_describe_chart: tool({
      description:
        'List the valid segments and filters for a specific chart. Always call this before calling kaizen_get_chart with a segment or filter, because every chart has a different set of valid keys.',
      parameters: z.object({
        name: ChartNameEnum.describe('The chart name, e.g. "mrr", "revenue", "customers_active".'),
      }),
      execute: async ({ name }) => {
        const { data, meta } = await client.describeChart(name);
        return {
          name,
          filters: data.filters,
          segments: data.segments ?? null,
          meta,
        };
      },
    }),

    kaizen_get_chart: tool({
      description:
        'Get time-series data for a chart at day, week, or month resolution. Returns settled-only values plus a dataQuality summary so you can caveat any still-incomplete periods. Always pass ISO dates (YYYY-MM-DD).',
      parameters: z.object({
        name: ChartNameEnum,
        resolution: ResolutionEnum.default('day'),
        start_date: IsoDate,
        end_date: IsoDate,
        segment: z
          .string()
          .optional()
          .describe('Optional segment id, e.g. "store". Call kaizen_describe_chart first to find valid ids.'),
        filter: z
          .record(z.string())
          .optional()
          .describe('Optional filter map, e.g. { store: "app_store" }. Validate keys via kaizen_describe_chart.'),
      }),
      execute: async (args) => {
        const { data, meta } = await client.getChart(args);
        const quality = summarizeQuality(data);
        const settled = filterSettled(data.values);
        return {
          name: args.name,
          displayName: data.display_name,
          resolution: data.resolution,
          measures: data.measures,
          segments: data.segments,
          summary: data.summary,
          unit: data.yaxis,
          currency: data.yaxis_currency,
          settledValues: settled,
          dataQuality: quality,
          meta,
        };
      },
    }),
  } as const;
}

export type KaizenTools = ReturnType<typeof buildTools>;
