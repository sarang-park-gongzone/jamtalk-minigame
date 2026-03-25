import { useState, useRef } from 'react';
import type { GameId } from '../types';
import { GAME_CONFIGS } from '../types';
import { playClickSound } from '../utils/soundUtils';
import { ChevronLeft, ChevronRight, Mic, Trophy } from 'lucide-react';
import LeaderboardModal from './LeaderboardModal';
import AvatarContainer from './AvatarContainer';

interface HomeScreenProps {
  onSelectGame: (id: GameId) => void;
  mockMode?: boolean;
  sdkStatus?: 'loading' | 'ready' | 'error';
}

const gameList: GameId[] = ['speaking', 'english', 'capital', 'wordchain'];

const cardColors: Record<GameId, string> = {
  speaking: '#8DB665',
  english: '#6C8EF5',
  capital: '#F06292',
  wordchain: '#8B7CF6',
};

const cardDescriptions: Record<GameId, string> = {
  speaking: '에밀리가 말하면\n나도 따라 말해',
  english: '찰스와 영어 단어로\n놀아 보자!',
  capital: '지구 선생님과\n세계 여행을 떠나자',
  wordchain: '하나 선생님과\n우리말로 대결해 보자!',
};

const VISIBLE_COUNT = 3;

export default function HomeScreen({ onSelectGame, mockMode, sdkStatus }: HomeScreenProps) {
  const [startIdx, setStartIdx] = useState(0);
  const hasAnimated = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const canPrev = startIdx > 0;
  const canNext = startIdx + VISIBLE_COUNT < gameList.length;
  const visibleGames = gameList.slice(startIdx, startIdx + VISIBLE_COUNT);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        ref={(el) => { if (el) el.playbackRate = 0.5; }}
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src="/images/home-bg.mp4"
      />
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-4 lg:px-8 xl:px-12">
        {/* Prev arrow */}
        <button
          onClick={() => { playClickSound(); hasAnimated.current = true; setStartIdx(i => i - 1); }}
          disabled={!canPrev}
          className="shrink-0 text-[#5A6B6A] text-4xl lg:text-5xl font-light
            transition-all duration-150 active:scale-90 disabled:opacity-15 disabled:cursor-default
            hover:text-[#3A4B4A] p-2"
        >
          <ChevronLeft size={40} strokeWidth={1.5} />
        </button>

        {/* Avatar + Cards row */}
        <div className="flex-1 flex items-stretch gap-4 lg:gap-6 mx-2 lg:mx-4 max-w-6xl">
          {/* Avatar section */}
          <div
            className="shrink-0 w-56 lg:w-64 xl:w-72 flex flex-col items-center opacity-0"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards' }}
          >
            <div className="w-full relative" style={{ aspectRatio: '3 / 4', maxHeight: '380px' }}>
              <AvatarContainer
                className="w-full h-full rounded-2xl bg-[#EDE8E0]"
                mockMode={mockMode}
                sdkStatus={sdkStatus}
                small
              />
              {/* Speech bubble */}
              <div className="absolute bottom-4 left-3 right-3 z-10 bg-[#5A5A5A]/80 backdrop-blur-sm text-white text-xs lg:text-sm text-center px-4 py-3 rounded-xl leading-relaxed">
                안녕~! 만나서 반가워<br />오늘도 재밌는 놀이를 해볼까?
              </div>
            </div>
            {/* Mic icon */}
            <button className="mt-3 flex flex-col items-center gap-1 text-[#5A6B6A] hover:text-[#3A4B4A] transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                <Mic size={20} />
              </div>
            </button>
          </div>

          {/* Game cards */}
          {visibleGames.map((id, idx) => {
            const config = GAME_CONFIGS[id];
            const color = cardColors[id];
            const desc = cardDescriptions[id];
            const shouldAnimate = !hasAnimated.current;
            const delay = shouldAnimate ? 0.3 + idx * 0.1 : 0;

            return (
              <button
                key={id}
                onClick={() => { playClickSound(); onSelectGame(id); }}
                className="flex-1 rounded-2xl lg:rounded-3xl overflow-hidden
                  hover:shadow-2xl hover:-translate-y-2
                  active:scale-[0.97] transition-all duration-200
                  flex flex-col justify-start p-6 lg:p-8 text-left min-h-[280px] lg:min-h-[340px]"
                style={{
                  background: color,
                  ...(shouldAnimate ? { opacity: 0, animation: `fadeInUp 0.5s ease-out ${delay}s forwards` } : {}),
                }}
              >
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white leading-tight">
                  {config.name}
                </h3>
                <p className="text-sm lg:text-base text-white/80 mt-3 leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Next arrow */}
        <button
          onClick={() => { playClickSound(); hasAnimated.current = true; setStartIdx(i => i + 1); }}
          disabled={!canNext}
          className="shrink-0 text-[#5A6B6A] text-4xl lg:text-5xl font-light
            transition-all duration-150 active:scale-90 disabled:opacity-15 disabled:cursor-default
            hover:text-[#3A4B4A] p-2"
        >
          <ChevronRight size={40} strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom: dots + leaderboard */}
      <div className="flex items-center justify-center gap-4 pb-6">
        <div className="flex gap-2">
          {Array.from({ length: gameList.length - VISIBLE_COUNT + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { playClickSound(); setStartIdx(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === startIdx ? 'bg-[#38D9C5] w-5' : 'bg-[#B0C4C0]'}`}
            />
          ))}
        </div>
        <button
          onClick={() => { playClickSound(); setShowLeaderboard(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 text-[#5A6B6A] text-xs font-semibold hover:bg-white/70 active:scale-95 transition-all"
        >
          <Trophy size={14} />
          리더보드
        </button>
      </div>

      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}
