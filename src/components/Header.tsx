import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { useEffect, useRef, useState } from 'react';
import { playClickSound } from '../utils/soundUtils';

interface HeaderProps {
  gameName: string;
  teacherName?: string;
  themeColor: string;
  round?: number;
  maxRounds?: number;
  score?: number | { player: number; ai: number };
  onGoHome: () => void;
}

export default function Header({ gameName, teacherName, themeColor, round, maxRounds, score, onGoHome }: HeaderProps) {
  const progress = round && maxRounds ? (round / maxRounds) * 100 : 0;
  const totalJam = useGameStore(s => s.totalJam);
  const [jamFlash, setJamFlash] = useState(false);
  const prevJamRef = useRef(totalJam);

  useEffect(() => {
    if (totalJam > prevJamRef.current) {
      setJamFlash(true);
      const t = setTimeout(() => setJamFlash(false), 600);
      return () => clearTimeout(t);
    }
    prevJamRef.current = totalJam;
  }, [totalJam]);

  return (
    <div>
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}
      >
        <button
          onClick={() => { playClickSound(); onGoHome(); }}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-all duration-150 text-sm active:scale-95"
        >
          <ArrowLeft size={18} />
          <span>홈</span>
        </button>

        <span className="font-semibold text-sm">{gameName}</span>

        <div className="flex items-center gap-2">
          {score !== undefined && (
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
              {typeof score === 'number' ? (
                `${score}점`
              ) : (
                <span>나 {score.player} : {score.ai} {teacherName || 'AI'}</span>
              )}
            </div>
          )}
          <div className={`bg-white/20 rounded-full px-3 py-1 text-sm font-semibold transition-all ${jamFlash ? 'text-yellow-300 scale-110' : ''}`}>
            {totalJam} Jam
          </div>
        </div>
      </div>

      {round !== undefined && maxRounds !== undefined && (
        <div className="w-full h-1.5 bg-gray-200">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: themeColor }}
          />
        </div>
      )}
    </div>
  );
}
