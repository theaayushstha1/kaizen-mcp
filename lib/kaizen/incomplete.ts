import type { ChartResponse, DataPoint } from './types';

export type DataQuality = {
  totalPeriods: number;
  completePeriods: number;
  incompletePeriods: Array<{ cohortIso: string; value: number }>;
};

function toIso(cohort: number): string {
  return new Date(cohort * 1000).toISOString().slice(0, 10);
}

export function summarizeQuality(chart: ChartResponse): DataQuality {
  const rows = chart.values;
  const incompletes = rows
    .filter((r) => r.incomplete)
    .map((r) => ({ cohortIso: toIso(r.cohort), value: r.value }));
  return {
    totalPeriods: rows.length,
    completePeriods: rows.length - incompletes.length,
    incompletePeriods: incompletes,
  };
}

export function filterSettled(values: DataPoint[]): DataPoint[] {
  return values.filter((v) => !v.incomplete);
}
