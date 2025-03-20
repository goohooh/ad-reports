import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Metric, metrics } from '@/types';

interface MetricSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectionComplete: (selectedMetrics: Metric[]) => void;
  selectedMetrics: Metric[];
}

export function MetricSelectorDialog({
  open,
  onOpenChange,
  onSelectionComplete,
  selectedMetrics: initialMetrics,
}: MetricSelectorDialogProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setSelectedMetrics(initialMetrics.filter((m) => metrics.includes(m as Metric)) as Metric[]);
    }
  }, [open, initialMetrics]);

  const handleCheckboxChange = (metric: Metric) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric],
    );
  };

  const handleComplete = () => {
    onSelectionComplete(selectedMetrics);
    onOpenChange(false); // 다이얼로그 닫기
  };

  const handleClose = () => {
    setSelectedMetrics(initialMetrics.filter((m) => metrics.includes(m as Metric)) as Metric[]); // 초기값으로 되돌리기
    onOpenChange(false); // 다이얼로그 닫기
  };

  // 다이얼로그가 닫힐 때 선택 초기화 (외부 클릭 포함)
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setSelectedMetrics(initialMetrics.filter((m) => metrics.includes(m as Metric)) as Metric[]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Metric 선택</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center gap-2">
              <Checkbox
                id={`metric-${metric}`}
                checked={selectedMetrics.includes(metric)}
                onCheckedChange={() => handleCheckboxChange(metric)}
              />
              <Label htmlFor={`metric-${metric}`} className="cursor-pointer">
                {metric.toUpperCase()}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          <Button onClick={handleComplete}>완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
