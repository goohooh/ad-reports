import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import { useState, Suspense, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartParams, GroupBy, groupByList, ReportResponse } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import fetchClient from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { entries, pipe } from '@fxts/core';
import { useQueryFilterParser } from '@/lib/QueryFilterParserProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNavigate } from '@tanstack/react-router';

export function ChartGridList({ chartParams }: { chartParams: ChartParams[] }) {
  const layouts = chartParams.map((chartParam, i) => ({
    i: generateChartKey(chartParam, i),
    x: i % 3,
    y: Math.floor(i / 3),
    w: 1,
    h: 1,
  }));
  const [layout, setLayout] = useState<GridLayout.Layout[]>(layouts);

  if (chartParams.length === 0) {
    return (
      <div className="bg-gray-50">
        <div className="flex justify-center items-center h-[400px]">No Data</div>
      </div>
    );
  }

  useEffect(() => {
    setLayout(layouts);
  }, [JSON.stringify(chartParams)]);

  const maxRows = Math.ceil(chartParams.length / 3);
  const handleDrag = (
    layout: GridLayout.Layout[],
    oldItem: GridLayout.Layout,
    newItem: GridLayout.Layout,
    placeholder: GridLayout.Layout,
    e: MouseEvent,
    element: HTMLElement,
  ) => {
    if (newItem.y >= maxRows) {
      // maxRows 초과 시 원래 위치로 복원
      newItem.x = oldItem.x;
      newItem.y = oldItem.y;
      placeholder.x = oldItem.x;
      placeholder.y = oldItem.y;
    }
  };
  // 드래그 종료 시 스왑 처리 및 빈 공간 방지
  // 드래그 종료 시 스왑 및 maxRows 제한 적용
  const handleDragStop = (newLayout: GridLayout.Layout[]) => {
    let updatedLayout = [...newLayout];

    newLayout.forEach((newItem) => {
      const originalItem = layout.find((l) => l.i === newItem.i);
      if (!originalItem) return;

      // 겹치는 아이템 확인
      const overlappingItem = layout.find(
        (l) => l.i !== newItem.i && l.x === newItem.x && l.y === newItem.y,
      );

      if (overlappingItem) {
        // 스왑: 겹친 아이템과 위치 교환
        updatedLayout = updatedLayout.map((item) =>
          item.i === overlappingItem.i
            ? { ...item, x: originalItem.x, y: originalItem.y }
            : item.i === newItem.i
              ? { ...item, x: overlappingItem.x, y: overlappingItem.y }
              : item,
        );
      } else {
        // 빈 공간이거나 maxRows 초과 시 원래 위치로 복원
        updatedLayout = updatedLayout.map((item) =>
          item.i === newItem.i ? { ...item, x: originalItem.x, y: originalItem.y } : item,
        );
      }
    });

    // maxRows 제한 및 연속 배치 적용
    const sortedLayout = updatedLayout
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((item, i) => {
        const newX = i % 3;
        const newY = Math.floor(i / 3);
        return {
          ...item,
          x: newX,
          y: newY < maxRows ? newY : maxRows - 1, // maxRows 초과 방지
        };
      });

    setLayout(sortedLayout);
  };

  return (
    <GridLayout
      className="bg-gray-50 w-[1200px]"
      compactType={null}
      layout={layout}
      onDragStop={handleDragStop}
      cols={3}
      rowHeight={300}
      width={1200}
      isDraggable={true}
      isResizable={false}
      preventCollision={false}
      maxRows={maxRows}
    >
      {chartParams.map((chartParam, index) => (
        <div key={generateChartKey(chartParam, index)} className="border rounded-lg max-w-[400px]">
          <Suspense fallback={<div>Loading...</div>}>
            <ChartComponent index={index} chartParams={chartParams[index]} />
          </Suspense>
        </div>
      ))}
    </GridLayout>
  );
}

function generateChartKey(chartParam: ChartParams, index: number) {
  return `chart-${chartParam.metric}-${index}`;
}

function ChartComponent({ chartParams, index }: { chartParams: ChartParams; index: number }) {
  const parser = useQueryFilterParser();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<
    ReportResponse<(typeof chartParams)['metric'], (typeof chartParams)['group_by']>,
    Error
  >({
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
      const res = await fetchClient.post<
        ReportResponse<(typeof chartParams)['metric'], (typeof chartParams)['group_by']>
      >('/api/report', {
        ...params,
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  if (isLoading || !data) {
    return <div>{index + 1}</div>;
  }

  if (data.data.length === 0) {
    return <div className="text-center p-4">No Data</div>;
  }
  let chartData = [];
  let groupByKeys: string[] = [];

  if (chartParams.group_by) {
    const groupByKey = getGroupByKey(chartParams.group_by);
    groupByKeys = [
      ...new Set(data.data.map((item) => (item as unknown as Record<string, string>)[groupByKey])),
    ];

    const grouped = data.data.reduce(
      (acc, item) => {
        const key = item.date;
        if (!acc[key]) {
          acc[key] = { date: key };
          groupByKeys.forEach((p) => (acc[key][p] = 0));
        }
        acc[key][item[groupByKey as keyof typeof item]] = item[chartParams.metric];
        return acc;
      },
      {} as { [key: string]: { [key: string]: number | string } },
    );

    chartData = Object.values(grouped);
  } else {
    chartData = data.data;
  }

  return (
    <div className="p-4 bg-white h-full rounded-lg">
      <header className="flex justify-between items-center">
        <h3 className="text-center text-lg">{chartParams.metric}</h3>

        <SelectGroupBy
          value={chartParams.group_by}
          onChange={(val) => {
            parser.updateChartParams(chartParams.metric, val);

            navigate({
              to: '/reports',
              search: {
                ...parser.searchParamsObject,
              },
            });
          }}
        />
      </header>

      <LineChart width={300} height={200} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {chartParams.group_by ? (
          groupByKeys.map((key, i) => (
            <Line
              key={`${key}-${i.toString()}`}
              type="monotone"
              dataKey={key}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              name={key}
            />
          ))
        ) : (
          <Line type="monotone" dataKey={chartParams.metric} stroke="#8884d8" />
        )}
      </LineChart>
    </div>
  );
}

function SelectGroupBy({
  value,
  onChange,
}: {
  value?: GroupBy;
  onChange: (value?: GroupBy) => void;
}) {
  return (
    <Select
      defaultValue={value ? value : 'none'}
      value={value}
      onValueChange={(val) => {
        if (val === 'none') {
          onChange(undefined);
        } else {
          onChange(val as GroupBy);
        }
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="그룹화 기준 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">그룹화 기준 선택</SelectItem>
        {groupByList.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function assert(condition: unknown, errorMessage?: string): asserts condition {
  if (!condition) {
    throw new Error(errorMessage || 'condition 조건이 truethy가 아닙니다.');
  }
}

export function getGroupByKey<T extends string>(key: T | null): T {
  assert(key !== null); // true

  return key; // string
}
