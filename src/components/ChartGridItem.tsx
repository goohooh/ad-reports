import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import { useState, Suspense } from 'react';
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

  return (
    <GridLayout
      compactType="horizontal"
      layout={layout}
      onLayoutChange={(newLayout) => setLayout(newLayout)}
      cols={3}
      rowHeight={300}
      width={1200}
      isDraggable={true}
      isResizable={false}
      preventCollision={false}
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
    <div className="p-4 bg-white rounded-lg">
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
