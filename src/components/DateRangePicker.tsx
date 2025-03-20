import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { DateRange, DayPicker } from 'react-day-picker';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DateRangePickerProps {
  isOpen: boolean;
  selectedDateRange: DateRange | undefined;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  onApply: (range: { from: Date; to: Date }) => void;
  setIsOpen: (open: boolean) => void;
}

export function DateRangePicker({
  isOpen,
  selectedDateRange = {
    from: new Date(),
    to: new Date(),
  },
  triggerRef,
  onApply,
  setIsOpen,
}: DateRangePickerProps) {
  const today = new Date();
  const [range, setRange] = useState<DateRange>(selectedDateRange);

  const handleSelect = (newRange: DateRange | undefined) => {
    if (newRange) {
      setRange(newRange);
    }
  };

  const handleApply = () => {
    if (range?.from && range?.to) {
      const { from, to } = range;
      onApply({ from, to });
    }
    setIsOpen(false);
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
        <Button ref={triggerRef} variant="outline" className="justify-between truncate">
          <span className="truncate">{getDisplayText()}</span>
          <span>{isOpen ? <ChevronDown /> : <ChevronUp />}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-4">
        <DayPicker
          animate
          required
          mode="range"
          selected={range}
          numberOfMonths={2}
          onSelect={handleSelect}
          disabled={{ after: today }}
          max={0}
          footer={
            <footer className="mt-4 flex items-center gap-2 justify-end">
              <p className="text-sm">
                {range?.from ? format(range?.from, 'yyyy-MM-dd') : null} ~{' '}
                {range.to ? format(range.to, 'yyyy-MM-dd') : null}
              </p>
              <div className="flex justify-around gap-1">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </footer>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
