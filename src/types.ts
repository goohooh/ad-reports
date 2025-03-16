// src/types.ts
export interface ChartParams {
  start_date: string;
  end_date: string;
  app_ids: string[];
  platforms: string[];
  ad_types: string[];
  metric: string;
  group_by: string;
  chart_id: string;
}

export interface MetricsData {
  date: string;
  value: number;
}

export interface FilterState {
  app?: string;
  platform?: string;
  adType?: string;
  dateRange: { startDate: Date; endDate: Date; key: string }[];
}
