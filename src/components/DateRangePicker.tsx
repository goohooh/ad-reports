import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, isAfter } from 'date-fns';

interface DateRangePickerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  onApply: (startDate: string, endDate: string) => void;
  nextSelectorRef?: React.RefObject<HTMLButtonElement>;
}

export function DateRangePicker({
  isOpen,
  setIsOpen,
  triggerRef,
  onApply,
  nextSelectorRef,
}: DateRangePickerProps) {
  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  });

  const handleSelect = (newRange: DateRange | undefined) => {
    if (newRange?.from && isAfter(newRange.from, today)) return; // 미래 날짜 선택 방지
    if (newRange?.to && isAfter(newRange.to, today)) return;
    setRange(newRange);
  };

  const handleApply = () => {
    if (range?.from && range?.to) {
      const startDate = format(range.from, 'yyyy-MM-dd');
      const endDate = format(range.to, 'yyyy-MM-dd');
      onApply(startDate, endDate);
    }
    setIsOpen(false);
    if (nextSelectorRef?.current) {
      nextSelectorRef.current.focus();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!range?.from || !range?.to) return 'Date Range';
    return `${format(range.from, 'yyyy-MM-dd')} - ${format(range.to, 'yyyy-MM-dd')}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="w-[200px] justify-between truncate">
          <span className="truncate">{getDisplayText()}</span>
          <span>▼</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={(date) => isAfter(date, today)} // 미래 날짜 비활성화
          defaultMonth={today}
        />
        <footer className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </footer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
