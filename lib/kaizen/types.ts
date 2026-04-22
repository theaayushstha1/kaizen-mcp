export const CHART_NAMES = [
  'actives',
  'actives_movement',
  'actives_new',
  'arr',
  'churn',
  'cohort_explorer',
  'conversion_to_paying',
  'customers_active',
  'customers_new',
  'ltv_per_customer',
  'ltv_per_paying_customer',
  'mrr',
  'mrr_movement',
  'refund_rate',
  'revenue',
  'subscription_retention',
  'subscription_status',
  'trial_conversion_rate',
  'trials',
  'trials_movement',
  'trials_new',
] as const;

export type ChartName = (typeof CHART_NAMES)[number];

export type Resolution = 'day' | 'week' | 'month';

export type ChartsError = {
  object: 'error';
  type: string;
  message: string;
  param?: string;
  doc_url?: string;
  retryable: boolean;
};

export type ChartMeasure = {
  display_name: string;
  description: string;
  unit: string;
  decimal_precision: number;
  chartable: boolean;
  tabulable: boolean;
};

export type ChartSegment = {
  display_name: string;
  is_total: boolean;
  chartable: boolean;
  tabulable: boolean;
};

export type DataPoint = {
  cohort: number;
  incomplete: boolean;
  measure: number;
  value: number;
  segment?: number;
};

export type ChartResponse = {
  object: 'chart_data';
  category: string;
  display_name: string;
  resolution: Resolution;
  start_date: number;
  end_date: number;
  measures: ChartMeasure[];
  segments: ChartSegment[] | null;
  filtering_allowed: boolean;
  segmenting_allowed: boolean;
  summary: { average: Record<string, number> } | null;
  user_selectors: Record<string, string>;
  values: DataPoint[];
  yaxis: string;
  yaxis_currency?: string;
  documentation_link?: string;
};

export type ChartOptionsResponse = {
  filters: Array<{
    id: string;
    display_name: string;
    options: Array<{ id: string; display_name: string }>;
  }>;
  segments?: Array<{
    id: string;
    display_name: string;
    options: Array<{ id: string; display_name: string }>;
  }>;
};

export type OverviewMetric = {
  id: string;
  name: string;
  description: string;
  unit: string;
  period: string;
  value: number;
  last_updated_at_iso8601: string | null;
};

export type OverviewResponse = {
  metrics: OverviewMetric[];
};
