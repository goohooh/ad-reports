import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import { useState, Suspense } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartParams, Metric, MetricsData } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import fetchClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { entries, pipe } from '@fxts/core';

type MetricResponse = {
  success: boolean;
  data: Metric;
};

// API 데이터 페칭 함수
const fetchMetrics = async (chartParams: ChartParams): Promise<MetricsData[]> => {
  const { start_date, end_date, app_ids, platforms, ad_types, metric, group_by } = chartParams;
  const params = {
    start_date,
    end_date,
    filters: {
      app_ids: app_ids,
      platforms: platforms,
      ad_types: ad_types,
    },
    metric,
    group_by,
  };
  const res = await fetchClient.post<MetricsData[]>('/api/report', { ...params });
  return res.data;
};

// 차트 컴포넌트
function ChartComponent({ chartParams }: { chartParams: ChartParams }) {
  const { data, isLoading } = useQuery<MetricsData[], Error>({
    queryKey: ['metrics', ...pipe(chartParams, entries)],
    queryFn: () => fetchMetrics(chartParams),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
}
export const ChartGridItem: React.FC<{ index: number; chartParams: ChartParams[] }> = ({
  index,
  chartParams,
}) => {
  const [layout, setLayout] = useState<GridLayout.Layout[]>([
    { i: `chart${index}`, x: index % 3, y: Math.floor(index / 3), w: 1, h: 1 },
  ]);

  return (
    <div style={{ height: '300px', width: '400px' }}>
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
          <Suspense fallback={<div>Loading...</div>}>
            <ChartComponent chartParams={chartParams[index]} />
          </Suspense>
        </div>
      </GridLayout>
    </div>
  );
};
