import { useState, useRef } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import GridLayout from 'react-grid-layout';
import { DateRangePicker } from 'react-date-range';
import Select, { SingleValue } from 'react-select';
import axios from 'axios';
import ShareDialog from '@/components/ShareDialog';
import QueryParser from '@/lib/QueryParser';
import { ChartParams, MetricsData, FilterState } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// API 데이터 페칭 함수
const fetchMetrics = async (chartParams: ChartParams): Promise<MetricsData[]> => {
  const { chart_id, start_date, end_date, app_ids, platforms, ad_types, metric, group_by } =
    chartParams;
  const params = {
    chart: chart_id,
    start_date,
    end_date,
    app_ids: app_ids.join(','),
    platforms: platforms.join(','),
    ad_types: ad_types.join(','),
    metric,
    group_by,
  };
  const res = await axios.get<MetricsData[]>('/api/metrics', { params });
  return res.data;
};

// 차트 컴포넌트
const ChartComponent: React.FC<{ data: MetricsData[] }> = ({ data }) => (
  <div className="p-4 bg-white rounded-lg shadow-md">
    <LineChart width={300} height={200} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </div>
);

// 차트 그리드 아이템
const ChartGridItem: React.FC<{ index: number; chartParams: ChartParams[] }> = ({
  index,
  chartParams,
}) => {
  const [layout, setLayout] = useState<GridLayout.Layout[]>([
    { i: `chart${index}`, x: index % 3, y: Math.floor(index / 3), w: 1, h: 1 },
  ]);
  const { data: chartData, isLoading } = useQuery<MetricsData[], Error>({
    queryKey: ['metrics', chartParams[index]],
    queryFn: () => fetchMetrics(chartParams[index]),
    staleTime: 5 * 60 * 1000,
    enabled: !!chartParams[index],
  });

  return (
    <div style={{ height: '200px', width: '300px' }}>
      <GridLayout
        layout={layout}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        cols={3}
        rowHeight={200}
        width={300}
        isDraggable={true}
        isResizable={false}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <div key={`chart${index}`} className="border rounded-lg">
          {isLoading ? (
            <div>Loading...</div>
          ) : chartData ? (
            <ChartComponent data={chartData} />
          ) : (
            <div>No Data</div>
          )}
        </div>
      </GridLayout>
    </div>
  );
};

export default function ReportPage() {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const navigate = useNavigate();
  const parser = new QueryParser(new URLSearchParams(searchParams));
  const initialChartParams = parser.parseForCharts();
  const errors = parser.validateParams();

  const [filters, setFilters] = useState<FilterState>({
    app: undefined,
    platform: undefined,
    adType: undefined,
    dateRange: [{ startDate: new Date(), endDate: new Date(), key: 'selection' }],
  });

  const appOptions = [
    { value: 'app1', label: 'App 1' },
    { value: 'app2', label: 'App 2' },
  ];
  const platformOptions = [
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
  ];
  const adTypeOptions = [
    { value: 'banner', label: 'Banner' },
    { value: 'video', label: 'Video' },
  ];

  const handleFilterChange = () => {
    const newParams = new URLSearchParams();
    if (filters.dateRange[0].startDate) {
      newParams.set('start_date', filters.dateRange[0].startDate.toISOString().split('T')[0]);
      newParams.set('end_date', filters.dateRange[0].endDate.toISOString().split('T')[0]);
    }
    if (filters.app) newParams.set('app_ids', filters.app);
    if (filters.platform) newParams.set('platforms', filters.platform);
    if (filters.adType) newParams.set('ad_types', filters.adType);
    newParams.set('metric', 'request');
    newParams.set('group_by', 'app_id');
    navigate({ to: '/reports', search: newParams.toString() });
  };

  if (errors) {
    return <div>Error: {errors.join(', ')}</div>;
  }

  const columnCount = 3;
  const rowCount = Math.ceil(10 / columnCount);
  const items = Array.from({ length: 10 }, (_, index) => index);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2,
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Report Dashboard</h1>
      <div className="mb-4 flex space-x-4">
        <Select
          options={appOptions}
          onChange={(val: SingleValue<{ value: string; label: string }>) => {
            setFilters({ ...filters, app: val?.value });
            handleFilterChange();
          }}
          placeholder="Select App"
          className="w-40"
        />
        <Select
          options={platformOptions}
          onChange={(val: SingleValue<{ value: string; label: string }>) => {
            setFilters({ ...filters, platform: val?.value });
            handleFilterChange();
          }}
          placeholder="Select Platform"
          className="w-40"
        />
        <Select
          options={adTypeOptions}
          onChange={(val: SingleValue<{ value: string; label: string }>) => {
            setFilters({ ...filters, adType: val?.value });
            handleFilterChange();
          }}
          placeholder="Select Ad Type"
          className="w-40"
        />
        <DateRangePicker
          onChange={(ranges: any) => {
            setFilters({ ...filters, dateRange: [ranges.selection] });
            handleFilterChange();
          }}
          ranges={filters.dateRange}
          className="w-80"
        />
        <ShareDialog />
      </div>
      <div ref={parentRef} style={{ height: '600px', width: '900px', overflow: 'auto' }}>
        <div
          style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const index = virtualItem.index;
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: 'flex',
                }}
              >
                <ChartGridItem index={index} chartParams={initialChartParams} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
