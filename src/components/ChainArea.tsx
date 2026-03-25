import { useEffect, useRef } from 'react';
import type { WordChip } from '../types';

interface ChainAreaProps {
  chain: WordChip[];
  themeColor: string;
}

export default function ChainArea({ chain, themeColor }: ChainAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chain]);

  if (chain.length === 0) return null;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {chain.map((chip, idx) => (
        <div
          key={idx}
          className={`flex animate-popIn ${chip.type === 'ai' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`inline-flex items-center px-4 py-2.5 rounded-2xl font-semibold text-sm shadow-sm max-w-[70%] ${
              chip.type === 'ai'
                ? 'bg-white text-wordchain-text rounded-tl-sm'
                : 'text-white rounded-tr-sm'
            }`}
            style={chip.type === 'player' ? { background: themeColor } : undefined}
          >
            {chip.word}
          </div>
        </div>
      ))}
    </div>
  );
}
