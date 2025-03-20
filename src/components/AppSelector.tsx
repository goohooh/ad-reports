import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // shadcn/ui 드롭다운
import { Checkbox } from '@/components/ui/checkbox'; // shadcn/ui 체크박스
import { Button } from '@/components/ui/button'; // shadcn/ui 버튼
import { Label } from '@/components/ui/label';
import fetchClient from '@/lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

type App = {
  id: string;
  name: string;
};

interface AppFilterResponse {
  data: App[];
}

interface AppSelectorProps {
  isOpen: boolean;
  selectedAppIds?: string[];
  setIsOpen: (open: boolean) => void;
  onSelectionChange?: (selectedApps: App[]) => void; // 선택된 앱 전달 (선택)
  onSelectionComplete?: () => void;
}

export function AppSelector({
  selectedAppIds = [],
  isOpen,
  setIsOpen,
  onSelectionChange,
  onSelectionComplete,
}: AppSelectorProps) {
  const [tempSelectedApps, setTempSelectedApps] = useState<string[]>([]); // 임시 선택 상태
  const [confirmedApps, setConfirmedApps] = useState<string[]>([...selectedAppIds]); // 확정된 선택 상태
  const [isConfirmed, setIsConfirmed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // react-query로 앱 데이터 가져오기
  const { data, error, isLoading } = useQuery<AppFilterResponse>({
    queryKey: ['appFilters'],
    queryFn: async () => {
      const response = await fetchClient('/api/filters');
      return response.data;
    },
  });

  // 로딩 중이거나 데이터/에러 처리
  if (isLoading || !data)
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  if (error)
    return (
      <Button variant="outline" disabled>
        Error
      </Button>
    );

  const apps = data.data;

  // 체크박스 상태 토글 (임시 상태만 업데이트)
  const handleCheckboxChange = (appId: string) => {
    setTempSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
    );
  };

  // 완료 버튼 클릭 핸들러
  const handleComplete = () => {
    setConfirmedApps(tempSelectedApps); // 임시 선택을 확정 상태로 반영
    const selected = apps.filter((app) => tempSelectedApps.includes(app.id));
    onSelectionChange?.(selected); // 선택된 앱 전달
    setIsOpen(false); // AppSelector 닫기
    if (onSelectionComplete) {
      onSelectionComplete();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isConfirmed) {
      setTempSelectedApps([]); // 완료 없이 닫히면 임시 선택 해제
    }
    if (!open) {
      setIsConfirmed(false); // 닫힐 때마다 완료 상태 리셋
    }
  };

  // 표시 텍스트 생성 (확정된 선택만 표시)
  const getDisplayText = () => {
    if (confirmedApps.length === 0) return 'App';

    const selected = apps.filter((app) => confirmedApps.includes(app.id));
    const names = selected.map((app) => app.name);
    if (names.length <= 2) {
      return `App: ${names.join(', ')}`;
    } else {
      return `App: ${names.slice(0, 2).join(', ')} 외 ${names.length - 2}`;
    }
  };

  // 앱 목록을 열로 나누기 (최대 4개 per 열)
  const columns = [];
  const itemsPerColumn = 4;
  for (let i = 0; i < apps.length; i += itemsPerColumn) {
    columns.push(apps.slice(i, i + itemsPerColumn));
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="justify-between">
          <span>{getDisplayText()}</span>
          <span>{isOpen ? <ChevronDown /> : <ChevronUp />}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-4">
        <div className="grid grid-cols-2 gap-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {column.map((app) => (
                <div key={app.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`app-${app.id}`}
                    checked={tempSelectedApps.includes(app.id)}
                    onCheckedChange={() => handleCheckboxChange(app.id)}
                  />
                  <Label htmlFor={`app-${app.id}`} className="cursor-pointer">
                    {app.name}
                  </Label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <footer className="mt-4 flex justify-end">
          <Button onClick={handleComplete} size="sm">
            완료
          </Button>
        </footer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
