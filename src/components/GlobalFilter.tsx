import { Suspense, useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import ShareDialog from '@/components/ShareDialog';
import { FilterState, platforms } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { AppSelector } from './AppSelector';
import QueryParser from '@/lib/QueryParser';
import { PlatformSelector } from './PlatformSelector';
import { AdTypeSelector } from './AdTypeSelector';

const platformOptions = platforms.map((platform) => ({
  value: platform,
  label: platform.charAt(0).toUpperCase() + platform.slice(1),
}));

export function GlobalFilter() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [parser] = useState(new QueryParser(new URLSearchParams(search)));
  const initialChartParams = parser.parseGlobalFilters();
  const [filters, setFilters] = useState<FilterState>({
    apps: undefined,
    platforms: undefined,
    adTypes: undefined,
    dateRange: [{ startDate: new Date(), endDate: new Date(), key: 'selection' }],
  });

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
    if (filters.apps) newParams.set('app_ids', filters.apps.join(','));
    if (filters.platforms) newParams.set('platforms', filters.platforms.join(','));
    if (filters.adTypes) newParams.set('ad_types', filters.adTypes.join(','));
    navigate({ to: '/reports', search: newParams.toString() });
  };

  return (
    <div className="mb-4 flex space-x-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AppSelector
          selectedAppIds={initialChartParams.app_ids}
          onSelectionChange={(selectedApps) => {
            setFilters({ ...filters, apps: selectedApps.map((app) => app.id).join(',') });
            handleFilterChange();
          }}
        />
      </Suspense>
      <PlatformSelector
        onSelectionChange={(selectedPlatforms) => {
          setFilters({ ...filters, platforms: selectedPlatforms });
          handleFilterChange();
        }}
      />
      <AdTypeSelector
        onSelectionChange={(selectedAdTypes) => {
          setFilters({ ...filters, adTypes: selectedAdTypes });
          handleFilterChange();
        }}
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
