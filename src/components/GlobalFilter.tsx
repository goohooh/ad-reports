import { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import Select, { SingleValue } from 'react-select';
import ShareDialog from '@/components/ShareDialog';
import { FilterState } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import fetchClient from '@/lib/api';

type App = {
  id: string;
  name: string;
};

type AppFilterResponse = {
  success: boolean;
  data: App[];
};

export function GlobalFilter() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    app: undefined,
    platform: undefined,
    adType: undefined,
    dateRange: [{ startDate: new Date(), endDate: new Date(), key: 'selection' }],
  });

  const { data, error, isLoading, refetch } = useQuery<AppFilterResponse>({
    queryKey: ['appFilters'],
    queryFn: () => fetchClient('/api/filters'),
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

  return (
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
  );
}
