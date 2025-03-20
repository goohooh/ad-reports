import { Suspense, useState } from 'react';
import ShareDialog from '@/components/ShareDialog';
import { FilterState } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { AppSelector } from './AppSelector';
import QueryParser from '@/lib/QueryParser';
import { PlatformSelector } from './PlatformSelector';
import { AdTypeSelector } from './AdTypeSelector';
import { DateRangePicker } from './DateRangePicker';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';

export function GlobalFilter() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [parser] = useState(new QueryParser(new URLSearchParams(search)));
  const initialChartParams = parser.parseGlobalFilters();

  // TODO: Init params from search
  const [filters, setFilters] = useState<FilterState>({
    apps: undefined,
    platforms: undefined,
    adTypes: undefined,
    range: { from: new Date(), to: new Date() },
  });

  const [isAppSelectorOpen, setIsAppSelectorOpen] = useState(false);
  const [isPlatformSelectorOpen, setIsPlatformSelectorOpen] = useState(false);
  const [isAdTypeSelectorOpen, setIsAdTypeSelectorOpen] = useState(false);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  const handleFilterChange = () => {
    const newParams = new URLSearchParams();
    if (filters.range.from && filters.range.to) {
      newParams.set('start_date', format(filters.range.from, 'yyyy-MM-dd'));
      newParams.set('end_date', format(filters.range.from, 'yyyy-MM-dd'));
    }
    if (filters.apps) newParams.set('app_ids', filters.apps.join(','));
    if (filters.platforms) newParams.set('platforms', filters.platforms.join(','));
    if (filters.adTypes) newParams.set('ad_types', filters.adTypes.join(','));
  };

  const submitFilters = () => {
    const newParams = new URLSearchParams();
    if (filters.range.from && filters.range.to) {
      newParams.set('start_date', format(filters.range.from, 'yyyy-MM-dd'));
      newParams.set('end_date', format(filters.range.from, 'yyyy-MM-dd'));
    }
    if (filters.apps) newParams.set('app_ids', filters.apps.join(','));
    if (filters.platforms) newParams.set('platforms', filters.platforms.join(','));
    if (filters.adTypes) newParams.set('ad_types', filters.adTypes.join(','));

    const errors = parser.validateParams();
    if (errors) {
      toast.error(errors.join('\n'));
      return;
    }

    navigate({ to: '/reports', search: newParams.toString() });
  };

  return (
    <div className="mb-4 flex space-x-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AppSelector
          isOpen={isAppSelectorOpen}
          setIsOpen={setIsAppSelectorOpen}
          selectedAppIds={initialChartParams.app_ids}
          onSelectionChange={(selectedApps) => {
            setFilters({ ...filters, apps: selectedApps.map((app) => app.id) });
            handleFilterChange();
          }}
          onSelectionComplete={() => {
            setIsPlatformSelectorOpen(true);
          }}
        />
      </Suspense>
      <PlatformSelector
        isOpen={isPlatformSelectorOpen}
        setIsOpen={setIsPlatformSelectorOpen}
        onSelectionChange={(selectedPlatforms) => {
          setFilters({ ...filters, platforms: selectedPlatforms });
          handleFilterChange();
        }}
        onSelectionComplete={() => {
          setIsAdTypeSelectorOpen(true);
        }}
      />
      <AdTypeSelector
        isOpen={isAdTypeSelectorOpen}
        setIsOpen={setIsAdTypeSelectorOpen}
        onSelectionChange={(selectedAdTypes) => {
          setFilters({ ...filters, adTypes: selectedAdTypes });
          handleFilterChange();
        }}
        onSelectionComplete={() => {
          setIsDateRangePickerOpen(true);
        }}
      />
      <DateRangePicker
        isOpen={isDateRangePickerOpen}
        setIsOpen={setIsDateRangePickerOpen}
        onApply={(range) => {
          setFilters({ ...filters, range });
          submitFilters();
        }}
        initialRange={filters.range}
      />

      <ShareDialog />

      <Toaster />
    </div>
  );
}
