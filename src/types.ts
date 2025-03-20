import { Metric } from './types';
// src/types.ts
export interface ChartParams {
  start_date: string;
  end_date: string;
  app_ids: string[];
  platforms: Platform[];
  ad_types: AdType[];
  metric: Metric;
  group_by?: string;
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

export type GroupBy = 'app_id' | 'platform' | 'ad_type';

export type ReportResponse<T extends Metric> = {
  success: boolean;
  data: MetricData<T>[];
  meta: {
    metric: T;
    start_date: string;
    end_date: string;
    filters: {
      app_id?: string;
      platform?: Platform;
      ad_type?: AdType;
    };
    group_by?: string;
  };
};
export type MetricData<T extends Metric> = {
  date: string;
} & {
  [key in T]: number;
};

export interface GlobalFilterState {
  apps: string[];
  platforms: Platform[];
  adTypes: AdType[];
  range: { from: Date; to: Date };
}

export interface ChartFilterState {
  metric: Metric;
  group_by?: GroupBy;
}
