import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlobalFilter } from '@/components/GlobalFilter';
import { useLocation, useNavigate } from '@tanstack/react-router';
import QueryFilterParser from '@/lib/QueryFilterParser';
import { ChartGridList } from '@/components/ChartGrid';
import { QueryFilterParserProvider } from '@/lib/QueryFilterParserProvider';
import { Metric } from '@/types';
import { MetricSelectorDialog } from '@/components/MetricSelectorDialog';
import { concat, filter, map, pipe, toArray } from '@fxts/core';

export default function ReportPage() {
  const { search } = useLocation();
  const [parser] = useState(new QueryFilterParser(new URLSearchParams(search)));
  const navigate = useNavigate();
  const chartParams = parser.parseForCharts();
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);

  const handleMetricSelection = (selectedMetrics: Metric[]) => {
    setIsMetricDialogOpen(false);

    const currentCharts = parser.parseForCharts();
    const nextCharts = pipe(
      currentCharts,
      filter(({ metric }) => selectedMetrics.includes(metric)),
      concat(
        selectedMetrics
          .filter((metric) => !currentCharts.some((c) => c.metric === metric))
          .map((metric) => ({ metric, group_by: undefined })),
      ),
      map(({ metric, group_by }) => `${metric}${group_by ? `:${group_by}` : ''}`),
      toArray,
    );

    parser.searchParams.set('charts', nextCharts.join(','));

    navigate({
      to: '/reports',
      search: {
        ...parser.searchParamsObject,
      },
    });
  };

  return (
    <div className="p-4">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Report Dashboard</h1>
        <Button
          type="button"
          onClick={() => {
            localStorage.removeItem('token');
            navigate({ to: '/login' });
          }}
        >
          Logout
        </Button>
      </header>

      <QueryFilterParserProvider parser={parser}>
        <Suspense fallback={<div>Loading Filter...</div>}>
          <GlobalFilter />
        </Suspense>

        <Button onClick={() => setIsMetricDialogOpen(true)}>차트 추가</Button>

        <MetricSelectorDialog
          open={isMetricDialogOpen}
          onOpenChange={setIsMetricDialogOpen}
          onSelectionComplete={handleMetricSelection}
          selectedMetrics={chartParams.map((c) => c.metric)}
        />

        <ChartGridList chartParams={chartParams} />
      </QueryFilterParserProvider>
    </div>
  );
}
