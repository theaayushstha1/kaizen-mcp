#!/usr/bin/env node
/**
 * Kaizen MCP adapter — stdio transport.
 *
 * Reuses the same four primitive tools the web playground uses
 * (lib/kaizen/tools.ts via lib/kaizen/client.ts), exposed over MCP
 * so Claude Desktop, Cursor, or any MCP client can use them directly.
 *
 * Run: RC_CHARTS_API_KEY=... RC_PROJECT_ID=... npx kaizen-mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ChartsClient } from '../lib/kaizen/client';
import { filterSettled, summarizeQuality } from '../lib/kaizen/incomplete';
import { CHART_NAMES } from '../lib/kaizen/types';

const client = new ChartsClient();

const server = new Server(
  { name: 'kaizen-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: 'kaizen_list_charts',
    description:
      'Return the 21 chart names supported by RevenueCat Charts API. Call first when a user asks what can be answered.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'kaizen_get_overview',
    description:
      'Point-in-time snapshot: active trials, subscriptions, MRR, revenue, new customers, active users, transactions.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'kaizen_describe_chart',
    description:
      'List valid segments and filters for a specific chart. Always call before kaizen_get_chart with a segment.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', enum: CHART_NAMES, description: 'Chart name, e.g. "mrr", "revenue".' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'kaizen_get_chart',
    description:
      'Time-series for a chart at day/week/month resolution. Returns settled-only values plus dataQuality summary. ISO dates required.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', enum: CHART_NAMES },
        resolution: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' },
        start_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        end_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        segment: { type: 'string' },
        filter: { type: 'object', additionalProperties: { type: 'string' } },
      },
      required: ['name', 'start_date', 'end_date'],
      additionalProperties: false,
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    const result = await dispatch(name, args as Record<string, unknown>);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: 'text', text: `error: ${message}` }],
    };
  }
});

async function dispatch(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'kaizen_list_charts':
      return { charts: CHART_NAMES, count: CHART_NAMES.length };

    case 'kaizen_get_overview': {
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
    }

    case 'kaizen_describe_chart': {
      const chartName = String(args.name);
      const { data, meta } = await client.describeChart(chartName as (typeof CHART_NAMES)[number]);
      return { name: chartName, filters: data.filters, segments: data.segments ?? null, meta };
    }

    case 'kaizen_get_chart': {
      const { data, meta } = await client.getChart(args as Parameters<typeof client.getChart>[0]);
      return {
        name: args.name,
        displayName: data.display_name,
        resolution: data.resolution,
        measures: data.measures,
        segments: data.segments,
        summary: data.summary,
        unit: data.yaxis,
        currency: data.yaxis_currency,
        settledValues: filterSettled(data.values),
        dataQuality: summarizeQuality(data),
        meta,
      };
    }

    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so stdout stays clean for MCP JSON-RPC.
  console.error('kaizen-mcp v0.1.0 listening on stdio');
}

main().catch((err) => {
  console.error('kaizen-mcp fatal:', err);
  process.exit(1);
});
