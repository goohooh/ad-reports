import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import { useState, Suspense } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartParams, ReportResponse } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import fetchClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { entries, pipe } from '@fxts/core';

// 차트 컴포넌트
function ChartComponent({ chartParams, index }: { chartParams: ChartParams; index: number }) {
  const { data, isLoading } = useQuery<ReportResponse<(typeof chartParams)['metric']>, Error>({
    queryKey: ['metrics', ...pipe(chartParams, entries)],
    queryFn: async () => {
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
      const res = await fetchClient.post<ReportResponse<(typeof chartParams)['metric']>>(
        '/api/report',
        {
          ...params,
        },
      );
      return res.data;
    },
  });

  if (isLoading || !data) {
    return <div>{index + 1}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-center text-lg">{chartParams.metric}</h3>
      <LineChart width={300} height={200} data={data.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={chartParams.metric} stroke="#8884d8" />
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
            <ChartComponent index={index} chartParams={chartParams[index]} />
          </Suspense>
        </div>
      </GridLayout>
    </div>
  );
};
