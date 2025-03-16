import { ChartParams } from '@/types';

export default class QueryParser {
  private params: URLSearchParams;
  private defaultChartCount: number = 10;

  constructor(searchParams: URLSearchParams) {
    this.params = searchParams;
  }

  private getParam(key: string, defaultValue: string | null = null): string | null {
    const value = this.params.get(key);
    return value !== null ? value : defaultValue;
  }

  private getArrayParam(key: string, defaultValue: string[] = []): string[] {
    const value = this.params.get(key);
    return value ? value.split(',').filter(Boolean) : defaultValue;
  }

  public parseGlobalFilters(): ChartParams {
    return {
      start_date: this.getParam('start_date', new Date().toISOString().split('T')[0])!,
      end_date: this.getParam('end_date', new Date().toISOString().split('T')[0])!,
      app_ids: this.getArrayParam('app_ids'),
      platforms: this.getArrayParam('platforms'),
      ad_types: this.getArrayParam('ad_types'),
      metric: this.getParam('metric', 'request')!,
      group_by: this.getParam('group_by', 'app_id')!,
      chart_id: '', // 차트별로 재정의
    };
  }

  public generateChartParams(index: number): ChartParams {
    const globalFilters = this.parseGlobalFilters();
    return {
      ...globalFilters,
      chart_id: `chart${index}`,
    };
  }

  public parseForCharts(): ChartParams[] {
    const charts: ChartParams[] = [];
    for (let i = 0; i < this.defaultChartCount; i++) {
      charts.push(this.generateChartParams(i));
    }
    return charts;
  }

  public validateParams(): string[] | null {
    const filters = this.parseGlobalFilters();
    const errors: string[] = [];
    if (!filters.start_date || !filters.end_date)
      errors.push('start_date and end_date are required');
    if (new Date(filters.start_date) > new Date(filters.end_date))
      errors.push('start_date must be before end_date');
    return errors.length ? errors : null;
  }
}
