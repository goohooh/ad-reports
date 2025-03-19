import { useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // shadcn/ui 드롭다운
import { Checkbox } from '@/components/ui/checkbox'; // shadcn/ui 체크박스
import { Button } from '@/components/ui/button'; // shadcn/ui 버튼
import { Label } from '@/components/ui/label';

// 하드코딩된 플랫폼 목록
export const platforms = ['ios', 'android', 'web'] as const;
type Platform = (typeof platforms)[number]; // 'ios' | 'android' | 'web'

interface PlatformSelectorProps {
  onSelectionChange?: (selectedPlatforms: Platform[]) => void; // 선택된 플랫폼 전달 (선택)
  nextSelectorRef?: React.RefObject<HTMLButtonElement>; // 다음 셀렉터로 포커스 이동
}

export function PlatformSelector({ onSelectionChange, nextSelectorRef }: PlatformSelectorProps) {
  const [tempSelectedPlatforms, setTempSelectedPlatforms] = useState<Platform[]>([]); // 임시 선택 상태
  const [confirmedPlatforms, setConfirmedPlatforms] = useState<Platform[]>([]); // 확정된 선택 상태
  const [isOpen, setIsOpen] = useState(false); // 드롭다운 열림 상태
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
    if (nextSelectorRef?.current) {
      nextSelectorRef.current.focus(); // 다음 셀렉터로 포커스 이동
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="w-[200px] justify-between truncate">
          <span className="truncate">{getDisplayText()}</span>
          <span>▼</span>
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
