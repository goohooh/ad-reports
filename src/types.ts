// src/types.ts
export interface ChartParams {
  start_date: string;
  end_date: string;
  app_ids: string[];
  platforms: string[];
  ad_types: string[];
  metric: string;
  group_by: string;
}

export const metrics = [
  'request',
  'matched_request',
  'impression',
  'click',
  'install',
  'revenue',
  'ecpm',
  'fill_rate',
  'show_rate',
  'ctr',
] as const;
export type Metric = (typeof metrics)[number];

export const platforms = ['ios', 'android', 'web'] as const;
export type Platform = (typeof platforms)[number];

export const adTypes = ['banner', 'native', 'video'] as const;
export type AdType = (typeof adTypes)[number];

export interface MetricsData {
  date: string;
  value: number;
}

export interface FilterState {
  apps?: string[];
  platforms?: string[];
  adTypes?: string[];
  dateRange: { startDate: Date; endDate: Date; key: string }[];
}
