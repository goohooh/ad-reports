import { Suspense, useState } from 'react';
import ShareDialog from '@/components/ShareDialog';
import { GlobalFilterState } from '@/types';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { useNavigate } from '@tanstack/react-router';
import { AppSelector } from './AppSelector';
import { PlatformSelector } from './PlatformSelector';
import { AdTypeSelector } from './AdTypeSelector';
import { DateRangePicker } from './DateRangePicker';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { useQueryFilterParser } from '@/lib/QueryFilterParserProvider';

export function GlobalFilter() {
  const navigate = useNavigate();
  const parser = useQueryFilterParser();
  const [filters, setFilters] = useState<GlobalFilterState>(parser.parseGlobalFilters());

  const [isAppSelectorOpen, setIsAppSelectorOpen] = useState(false);
  const [isPlatformSelectorOpen, setIsPlatformSelectorOpen] = useState(false);
  const [isAdTypeSelectorOpen, setIsAdTypeSelectorOpen] = useState(false);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  const handleFilterChange = () => {
    const errors = parser.validateFilters(filters);

    if (errors) {
      toast.error(errors.join('\n'));
      return;
    }

    if (filters.range.from && filters.range.to) {
      parser.searchParams.set('start_date', format(filters.range.from, 'yyyy-MM-dd'));
      parser.searchParams.set('end_date', format(filters.range.to, 'yyyy-MM-dd'));
    }
    if (filters.apps) parser.searchParams.set('app_ids', filters.apps.join(','));
    if (filters.platforms) parser.searchParams.set('platforms', filters.platforms.join(','));
    if (filters.adTypes) parser.searchParams.set('ad_types', filters.adTypes.join(','));

    navigate({
      to: '/reports',
      search: {
        ...parser.searchParamsObject,
      },
    });
  };

  return (
    <div className="mb-4 flex space-x-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AppSelector
          isOpen={isAppSelectorOpen}
          setIsOpen={setIsAppSelectorOpen}
          selectedAppIds={filters.apps}
          onSelectionChange={(selectedApps) => {
            setFilters({ ...filters, apps: selectedApps.map((app) => app.id) });
          }}
          onSelectionComplete={() => {
            setIsPlatformSelectorOpen(true);
          }}
        />
      </Suspense>

      <PlatformSelector
        isOpen={isPlatformSelectorOpen}
        setIsOpen={setIsPlatformSelectorOpen}
        selectedPlatforms={filters.platforms}
        onSelectionChange={(selectedPlatforms) => {
          setFilters({ ...filters, platforms: selectedPlatforms });
        }}
        onSelectionComplete={() => {
          setIsAdTypeSelectorOpen(true);
        }}
        onDeselectAll={() => {
          setFilters({ ...filters, platforms: [] });
          setIsAppSelectorOpen(true);
        }}
      />

      <AdTypeSelector
        isOpen={isAdTypeSelectorOpen}
        setIsOpen={setIsAdTypeSelectorOpen}
        selectedAdTypes={filters.adTypes}
        onSelectionChange={(selectedAdTypes) => {
          setFilters({ ...filters, adTypes: selectedAdTypes });
        }}
        onSelectionComplete={() => {
          setIsDateRangePickerOpen(true);
        }}
        onDeselectAll={() => {
          setFilters({ ...filters, platforms: [] });
          setIsPlatformSelectorOpen(true);
        }}
      />

      <DateRangePicker
        isOpen={isDateRangePickerOpen}
        setIsOpen={setIsDateRangePickerOpen}
        selectedDateRange={filters.range}
        onApply={(range) => {
          setFilters({ ...filters, range });
          handleFilterChange();
        }}
      />

      <ShareDialog />

      <Toaster />
    </div>
  );
}
