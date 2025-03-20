import { Suspense, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { GlobalFilter } from '@/components/GlobalFilter';
import { useLocation, useNavigate } from '@tanstack/react-router';
import QueryParser from '@/lib/QueryParser';
import { ChartGridItem } from '@/components/ChartGridItem';

export default function ReportPage() {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const navigate = useNavigate();
  const parser = new QueryParser(new URLSearchParams(searchParams));
  const initialChartParams = parser.parseForCharts();
  const errors = parser.validateParams();

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

      <Suspense fallback={<div>Loading Filter...</div>}>
        <GlobalFilter />
      </Suspense>

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
