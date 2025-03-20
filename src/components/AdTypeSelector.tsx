import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // shadcn/ui 드롭다운
import { Checkbox } from '@/components/ui/checkbox'; // shadcn/ui 체크박스
import { Button } from '@/components/ui/button'; // shadcn/ui 버튼
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

// 하드코딩된 광고 타입 목록
export const adTypes = ['banner', 'native', 'video'] as const;
type AdType = (typeof adTypes)[number]; // 'banner' | 'native' | 'video'

interface AdTypeSelectorProps {
  isOpen: boolean;
  selectedAdTypes?: AdType[];
  setIsOpen: (open: boolean) => void;
  onSelectionChange?: (selectedAdTypes: AdType[]) => void; // 선택된 광고 타입 전달 (선택)
  onSelectionComplete?: () => void;
  onDeselectAll?: () => void;
}

export function AdTypeSelector({
  isOpen,
  selectedAdTypes = [],
  setIsOpen,
  onSelectionChange,
  onSelectionComplete,
  onDeselectAll,
}: AdTypeSelectorProps) {
  const [confirmedAdTypes, setConfirmedAdTypes] = useState<AdType[]>([...selectedAdTypes]); // 확정된 선택 상태
  const [tempSelectedAdTypes, setTempSelectedAdTypes] = useState<AdType[]>([...selectedAdTypes]); // 임시 선택 상태
  const [isConfirmed, setIsConfirmed] = useState(false); // 완료 버튼 클릭 여부
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 체크박스 상태 토글 (임시 상태만 업데이트)
  const handleCheckboxChange = (adType: AdType) => {
    setTempSelectedAdTypes((prev) =>
      prev.includes(adType) ? prev.filter((t) => t !== adType) : [...prev, adType],
    );
  };

  // 완료 버튼 클릭 핸들러
  const handleComplete = () => {
    setConfirmedAdTypes(tempSelectedAdTypes); // 임시 선택을 확정 상태로 반영
    onSelectionChange?.(tempSelectedAdTypes); // 선택된 광고 타입 전달
    setIsOpen(false); // 드롭다운 닫기
    if (onSelectionComplete) {
      onSelectionComplete();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isConfirmed) {
      setTempSelectedAdTypes([]); // 완료 없이 닫히면 임시 선택 해제
    }
    if (!open) {
      setIsConfirmed(false); // 닫힐 때마다 완료 상태 리셋
    }
  };

  // 표시 텍스트 생성 (확정된 선택만 표시)
  const getDisplayText = () => {
    if (confirmedAdTypes.length === 0) return 'Ad Type';

    const names = confirmedAdTypes.map((t) => capitalize(t)); // 첫 글자 대문자
    if (names.length <= 2) {
      return `Ad Type: ${names.join(', ')}`;
    } else {
      return `Ad Type: ${names.slice(0, 2).join(', ')} 외 ${names.length - 2}`;
    }
  };

  // 첫 글자 대문자 변환 헬퍼 함수
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // 광고 타입 목록을 열로 나누기 (최대 4개 per 열, 여기선 3개라 1열로 충분)
  const columns = [];
  const itemsPerColumn = 4;
  for (let i = 0; i < adTypes.length; i += itemsPerColumn) {
    columns.push(adTypes.slice(i, i + itemsPerColumn));
  }

  useEffect(() => {
    if (!isConfirmed && tempSelectedAdTypes.length === 0 && confirmedAdTypes.length > 0) {
      setConfirmedAdTypes([]);
      setIsOpen(false);
      onDeselectAll?.();
    }
  }, [JSON.stringify(tempSelectedAdTypes), JSON.stringify(confirmedAdTypes)]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="justify-between truncate">
          <span className="truncate">{getDisplayText()}</span>
          <span>{isOpen ? <ChevronDown /> : <ChevronUp />}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-2">
        <div className="grid grid-cols-1 gap-4">
          {' '}
          {/* 광고 타입 3개라 1열로 충분 */}
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {column.map((adType) => (
                <div key={adType} className="flex items-center gap-2">
                  <Checkbox
                    id={`adtype-${adType}`}
                    checked={tempSelectedAdTypes.includes(adType)}
                    onCheckedChange={() => handleCheckboxChange(adType)}
                  />
                  <Label htmlFor={`adtype-${adType}`} className="cursor-pointer">
                    {capitalize(adType)}
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
