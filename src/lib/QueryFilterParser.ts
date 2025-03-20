import {
  AdType,
  ChartFilterState,
  ChartParams,
  GlobalFilterState,
  GroupBy,
  Metric,
  Platform,
} from '@/types';
import { map, pipe, toArray, uniqBy } from '@fxts/core';
import { isAfter } from 'date-fns';

export default class QueryFilterParser {
  private params: URLSearchParams;

  constructor(searchParams: URLSearchParams) {
    this.params = searchParams;
  }

  get searchParams() {
    return this.params;
  }

  set searchParams(searchParams: URLSearchParams) {
    this.params = searchParams;
  }

  get searchParamsObject() {
    return Object.fromEntries(this.params.entries());
  }

  private getParam(key: string, defaultValue?: string): string | undefined {
    const value = this.params.get(key);
    return value !== null ? value : defaultValue;
  }

  private getArrayParam(key: string, defaultValue: string[] = []): string[] {
    const value = this.params.get(key);
    return value ? value.split(',').filter(Boolean) : defaultValue;
  }

  private parseChartFilters(): ChartFilterState[] {
    return this.getArrayParam('charts').map((chart) => {
      return {
        metric: chart.split(':')[0] as Metric,
        group_by: chart.split(':')[1] as GroupBy | undefined,
      };
    });
  }

  parseGlobalFilters(): GlobalFilterState {
    return {
      apps: this.getArrayParam('app_ids'),
      platforms: this.getArrayParam('platforms') as Platform[],
      adTypes: this.getArrayParam('ad_types') as AdType[],
      range: {
        from: new Date(this.getParam('start_date', new Date().toISOString().split('T')[0])!),
        to: new Date(this.getParam('end_date', new Date().toISOString().split('T')[0])!),
      },
    };
  }

  parseForCharts(): ChartParams[] {
    const charts = this.parseChartFilters();
    const app_ids = this.getArrayParam('app_ids');
    const platforms = this.getArrayParam('platforms') as Platform[];
    const ad_types = this.getArrayParam('ad_types') as AdType[];
    const start_date = this.getParam('start_date');
    const end_date = this.getParam('end_date');

    if (!start_date || !end_date) return [];

    return pipe(
      charts,
      map(({ metric, group_by }) => {
        return {
          start_date,
          end_date,
          metric,
          app_ids,
          platforms,
          ad_types,
          group_by,
        };
      }),
      uniqBy(({ metric, group_by }) => `${metric}${group_by ? `:${group_by}` : ''}`),
      toArray,
    );
  }

  updateChartParams(metric: Metric, group_by?: GroupBy) {
    const charts = this.parseChartFilters();
    const newCharts = charts.map((chart) => {
      if (chart.metric === metric) {
        return {
          ...chart,
          group_by,
        };
      }
      return chart;
    });
    this.params.set(
      'charts',
      newCharts
        .map(({ metric, group_by }) => `${metric}${group_by ? `:${group_by}` : ''}`)
        .join(','),
    );
    return this.params;
  }

  public validateFilters(filters: GlobalFilterState): string[] | null {
    const errors: string[] = [];
    if (!filters.range.from || !filters.range.to) errors.push('from date and to date are required');
    if (isAfter(filters.range.from, filters.range.to))
      errors.push('from date must be before to date');
    return errors.length ? errors : null;
  }
}
