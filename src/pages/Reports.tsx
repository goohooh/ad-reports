import { Suspense, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { GlobalFilter } from '@/components/GlobalFilter';
import { useLocation, useNavigate } from '@tanstack/react-router';
import QueryFilterParser from '@/lib/QueryFilterParser';
import { ChartGridItem } from '@/components/ChartGridItem';
import { QueryFilterParserProvider } from '@/lib/QueryFilterParserProvider';
import { Metric } from '@/types';
import { MetricSelectorDialog } from '@/components/MetricSelectorDialog';

export default function ReportPage() {
  const { search } = useLocation();
  const [parser] = useState(new QueryFilterParser(new URLSearchParams(search)));
  const navigate = useNavigate();
  const chartParams = parser.parseForCharts();
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);

  const columnCount = 3;
  const rowCount = Math.ceil(10 / columnCount);
  const items = Array.from({ length: 10 }, (_, index) => index);

  const parentRef = useRef<HTMLDivElement>(null);

  const handleMetricSelection = (selectedMetrics: Metric[]) => {
    setIsMetricDialogOpen(false);

    const currentCharts = parser.searchParams.get('charts');
    const newCharts = selectedMetrics.join(',');
    const nextCharts = currentCharts ? `${currentCharts},${newCharts}` : newCharts;
    parser.searchParams.set('charts', nextCharts);

    navigate({
      to: '/reports',
      search: {
        ...parser.searchParamsObject,
        charts: nextCharts,
      },
    });
  };

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    lanes: columnCount,
    overscan: 2,
  });

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
          initialMetrics={[]} // 초기값 전달
        />

        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
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
                  <ChartGridItem index={index} chartParams={chartParams} />
                </div>
              );
            })}
          </div>
        </div>
      </QueryFilterParserProvider>
    </div>
  );
}
