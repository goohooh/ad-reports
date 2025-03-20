import { useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // shadcn/ui 드롭다운
import { Checkbox } from '@/components/ui/checkbox'; // shadcn/ui 체크박스
import { Button } from '@/components/ui/button'; // shadcn/ui 버튼
import { Label } from '@/components/ui/label';
import { Platform, platforms } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlatformSelectorProps {
  isOpen: boolean;
  selectedPlatforms?: Platform[];
  setIsOpen: (open: boolean) => void;
  onSelectionChange?: (selectedPlatforms: Platform[]) => void; // 선택된 플랫폼 전달 (선택)
  onSelectionComplete?: () => void;
}

export function PlatformSelector({
  isOpen,
  selectedPlatforms = [],
  setIsOpen,
  onSelectionChange,
  onSelectionComplete,
}: PlatformSelectorProps) {
  const [confirmedPlatforms, setConfirmedPlatforms] = useState<Platform[]>([...selectedPlatforms]); // 확정된 선택 상태
  const [tempSelectedPlatforms, setTempSelectedPlatforms] = useState<Platform[]>([
    ...selectedPlatforms,
  ]); // 임시 선택 상태
  const [isConfirmed, setIsConfirmed] = useState(false); // 완료 버튼 클릭 여부
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 체크박스 상태 토글 (임시 상태만 업데이트)
  const handleCheckboxChange = (platform: Platform) => {
    setTempSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  // 완료 버튼 클릭 핸들러
  const handleComplete = () => {
    setConfirmedPlatforms(tempSelectedPlatforms); // 임시 선택을 확정 상태로 반영
    onSelectionChange?.(tempSelectedPlatforms); // 선택된 플랫폼 전달
    setIsOpen(false); // 드롭다운 닫기
    if (onSelectionComplete) {
      onSelectionComplete();
    }
  };

  // 드롭다운이 닫힐 때 임시 선택 초기화
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isConfirmed) {
      setTempSelectedPlatforms([]); // 완료 없이 닫히면 임시 선택 해제
    }
    if (!open) {
      setIsConfirmed(false); // 닫힐 때마다 완료 상태 리셋
    }
  };

  // 표시 텍스트 생성 (확정된 선택만 표시)
  const getDisplayText = () => {
    if (confirmedPlatforms.length === 0) return 'Platform';

    const names = confirmedPlatforms.map((p) => p.toUpperCase()); // 예: 'ios' -> 'IOS'
    if (names.length <= 2) {
      return `Platform: ${names.join(', ')}`;
    } else {
      return `Platform: ${names.slice(0, 2).join(', ')} 외 ${names.length - 2}`;
    }
  };

  // 플랫폼 목록을 열로 나누기 (최대 4개 per 열, 여기선 3개라 1열로 충분)
  const columns = [];
  const itemsPerColumn = 4;
  for (let i = 0; i < platforms.length; i += itemsPerColumn) {
    columns.push(platforms.slice(i, i + itemsPerColumn));
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="justify-between">
          <span>{getDisplayText()}</span>
          <span>{isOpen ? <ChevronDown /> : <ChevronUp />}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-4">
        <div className="grid grid-cols-1 gap-4">
          {' '}
          {/* 플랫폼 3개라 1열로 충분 */}
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {column.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={tempSelectedPlatforms.includes(platform)}
                    onCheckedChange={() => handleCheckboxChange(platform)}
                  />
                  <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                    {platform.toUpperCase()}
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
