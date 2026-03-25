import { useState } from 'react';
import { Home, MessageCircle } from 'lucide-react';

interface GNBProps {
  onGoHome?: () => void;
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** 오늘 기준 해당 주의 월~일 날짜 배열 반환 */
function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function GNB({ onGoHome }: GNBProps) {
  const today = new Date();
  const weekDates = getWeekDates(today);
  const todayIdx = (today.getDay() + 6) % 7;
  const [selectedIdx, setSelectedIdx] = useState(todayIdx);

  return (
    <nav className="flex items-center justify-between px-4 lg:px-8 py-2.5 bg-white/40 backdrop-blur-sm">
      {/* Home */}
      <button
        onClick={onGoHome}
        className="flex flex-col items-center gap-0.5 text-[#5A6B6A] hover:text-[#3A4B4A] transition-colors"
      >
        <Home size={22} />
        <span className="text-[10px] font-medium">홈</span>
      </button>

      {/* Weekday calendar */}
      <div className="flex items-center bg-[#38D9C5] rounded-full px-2 py-1.5 gap-0.5">
        {WEEKDAYS.map((label, i) => {
          const isSelected = i === selectedIdx;
          const isToday = i === todayIdx;
          const date = weekDates[i];

          return (
            <button
              key={label}
              onClick={() => setSelectedIdx(i)}
              className={`relative px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-[#2A2A2A] text-white px-4'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              {isSelected ? `${formatDate(date)} ${label}` : label}
              {/* 오늘 표시 점 (선택되지 않았을 때) */}
              {isToday && !isSelected && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Parent consultation */}
      <button className="flex flex-col items-center gap-0.5 text-[#5A6B6A] hover:text-[#3A4B4A] transition-colors">
        <MessageCircle size={22} />
        <span className="text-[10px] font-medium">학부모 상담</span>
      </button>
    </nav>
  );
}
