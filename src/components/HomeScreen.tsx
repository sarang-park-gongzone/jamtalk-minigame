import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameId } from '../types';
import { GAME_CONFIGS } from '../types';
import { playClickSound } from '../utils/soundUtils';
import { ChevronLeft, ChevronRight, Mic, Trophy } from 'lucide-react';
import LeaderboardModal from './LeaderboardModal';
import AvatarContainer from './AvatarContainer';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface HomeScreenProps {
  onSelectGame: (id: GameId) => void;
  mockMode?: boolean;
  sdkStatus?: 'loading' | 'ready' | 'error';
  speechText?: string;
  echo?: (msg: string) => void;
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

const DEFAULT_SPEECH = '안녕~! 만나서 반가워\n오늘도 재밌는 놀이를 해볼까?';

export default function HomeScreen({ onSelectGame, mockMode, sdkStatus, speechText, echo }: HomeScreenProps) {
  const [startIdx, setStartIdx] = useState(0);
  const hasAnimated = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Mic: voice input → echo to avatar
  const echoRef = useRef(echo);
  echoRef.current = echo;
  const handleVoiceResult = useCallback((text: string) => {
    if (echoRef.current && text.trim()) {
      echoRef.current(text.trim());
    }
  }, []);
  const voice = useVoiceInput({ onResult: handleVoiceResult, lang: 'ko-KR' });
  const fullText = speechText || DEFAULT_SPEECH;
  const [displayedText, setDisplayedText] = useState('');
  const charIdxRef = useRef(0);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    charIdxRef.current = 0;
  }, [fullText]);

  // Typewriter synced to TTS: type while speaking, speed matches TTS (~120ms/char)
  useEffect(() => {
    if (charIdxRef.current >= fullText.length) return;

    // Calculate speed: distribute remaining chars over estimated TTS duration
    // Korean TTS ~ 6-8 chars/sec, so ~130ms per char
    const msPerChar = 130;

    const interval = setInterval(() => {
      charIdxRef.current++;
      if (charIdxRef.current <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIdxRef.current));
      } else {
        clearInterval(interval);
      }
    }, msPerChar);

    return () => clearInterval(interval);
  }, [fullText]);
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
      {/* Leaderboard — above cards */}
      <div className="flex justify-center mt-3">
        <button
          onClick={() => { playClickSound(); setShowLeaderboard(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 text-[#5A6B6A] text-xs font-semibold hover:bg-white/70 active:scale-95 transition-all"
        >
          <Trophy size={14} />
          리더보드
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 xl:px-12">
      <div className="flex items-center justify-center w-full">
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
        <div className="flex-1 flex items-stretch gap-5 lg:gap-8 mx-2 lg:mx-4" style={{ maxWidth: '1400px' }}>
          {/* Avatar section — same flex-1 as game cards */}
          <div
            className="flex flex-col items-center animate-fadeIn shrink-0"
            style={{ flex: '1.5' }}
          >
            {/* Avatar card */}
            <div className="w-full relative h-[280px] lg:h-[340px]">
              <AvatarContainer
                className="w-full h-full rounded-2xl lg:rounded-3xl bg-[#EDE8E0]"
                mockMode={mockMode}
                sdkStatus={sdkStatus}
                small
              />
            </div>
            {/* Mic icon */}
            <div className="relative mt-3">
              <button
                onClick={voice.toggleRecording}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md z-20 transition-all active:scale-90 ${
                  voice.isRecording
                    ? 'bg-[#38D9C5] text-white animate-micPulse'
                    : 'bg-[#38D9C5] text-white hover:bg-[#2CC4B0]'
                }`}
              >
                <Mic size={22} />
              </button>
              {voice.isRecording && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-[#38D9C5] font-semibold animate-pulse whitespace-nowrap">듣는 중...</span>
              )}
            </div>
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
                className="relative rounded-2xl lg:rounded-3xl overflow-hidden
                  hover:shadow-2xl hover:-translate-y-2
                  active:scale-[0.97] transition-all duration-200
                  flex flex-col justify-start p-6 lg:p-8 text-left h-[280px] lg:h-[340px]"
                style={{
                  background: color,
                  flex: '1.3',
                  ...(shouldAnimate ? { opacity: 0, animation: `fadeIn 0.4s ease-out ${delay}s forwards` } : {}),
                }}
              >
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white leading-tight">
                  {config.name}
                </h3>
                <p className="text-sm lg:text-base text-white/80 mt-3 leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
                {id === 'speaking' && (
                  <img
                    src="/images/speaking-emily.png"
                    alt="따라 말해봐"
                    className="absolute bottom-0 -right-2 h-[70%] object-contain pointer-events-none drop-shadow-lg"
                  />
                )}
                {id === 'capital' && (
                  <img
                    src="/images/travel-jigu.png"
                    alt="나라 여행 퀴즈"
                    className="absolute bottom-0 -right-2 h-[63%] object-contain pointer-events-none drop-shadow-lg"
                  />
                )}
                {id === 'wordchain' && (
                  <img
                    src="/images/wordchain-hana.png"
                    alt="우리말 대결"
                    className="absolute bottom-0 -right-4 w-[120%] object-contain pointer-events-none drop-shadow-lg"
                  />
                )}
                {id === 'english' && (
                  <img
                    src="/images/abc-emily.png"
                    alt="ABC 놀이"
                    className="absolute bottom-0 right-4 h-[79%] object-contain pointer-events-none drop-shadow-lg"
                  />
                )}
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

      {/* Speech bubble */}
      <div className="flex justify-center w-full mt-3 px-4 lg:px-8 xl:px-12">
        <div className="w-full bg-black/60 backdrop-blur-md text-white text-xs lg:text-sm text-center px-6 py-4 rounded-xl overflow-hidden flex items-center justify-center" style={{ maxWidth: '1400px' }}>
          <span className="leading-relaxed">
            {displayedText}
            {displayedText.length < fullText.length && (
              <span className="inline-block w-0.5 h-3.5 bg-white/70 ml-0.5 animate-pulse align-middle" />
            )}
          </span>
        </div>
      </div>

      {/* Dots indicator — bottom center */}
      <div className="flex justify-center gap-2 py-4">
        {Array.from({ length: gameList.length - VISIBLE_COUNT + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { playClickSound(); setStartIdx(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === startIdx ? 'bg-[#38D9C5] w-5' : 'bg-[#B0C4C0]'}`}
          />
        ))}
      </div>
      </div>

      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}
