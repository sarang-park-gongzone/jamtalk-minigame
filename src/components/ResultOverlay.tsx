import { useEffect, useRef, useState } from 'react';
import type { GameConfig, WordChip, CountryData } from '../types';
import type { GameId } from '../types';
import { Home, RotateCcw, Share2 } from 'lucide-react';
import ConfettiEffect from './ConfettiEffect';
import { playGameEndSound } from '../utils/soundUtils';
import { saveScore } from '../stores/useLeaderboard';

interface ResultOverlayProps {
  visible: boolean;
  playerName: string;
  score: number | { player: number; ai: number };
  chain?: WordChip[];
  history?: { country: CountryData; correct: boolean; usedHint: boolean }[];
  winner?: 'player' | 'ai' | 'draw';
  gameConfig: GameConfig;
  onRestart: () => void;
  onGoHome: () => void;
}

export default function ResultOverlay({
  visible, playerName, score, chain, history,
  winner, gameConfig, onRestart, onGoHome,
}: ResultOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      playGameEndSound();
      if (winner === 'player') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Save score to leaderboard (once per result)
      if (!savedRef.current) {
        savedRef.current = true;
        const numericScore = typeof score === 'number'
          ? score
          : (score as { player: number; ai: number }).player;
        const newRank = saveScore({
          playerName,
          score: numericScore,
          gameId: gameConfig.id as GameId,
          date: new Date().toISOString(),
        });
        if (newRank <= 10) setRank(newRank);
      }
    } else {
      setShowConfetti(false);
      setRank(null);
      savedRef.current = false;
    }
  }, [visible, winner, playerName, score, gameConfig.id]);

  if (!visible) return null;

  const isChainGame = typeof score !== 'number';
  const title = winner === 'player'
    ? `${playerName}님 승리!`
    : winner === 'ai'
    ? 'AI 승리!'
    : '무승부!';

  const handleShare = async () => {
    const scoreText = isChainGame
      ? `${(score as { player: number; ai: number }).player} : ${(score as { player: number; ai: number }).ai}`
      : `${score}점`;
    const text = `잼톡 JamTalk - ${gameConfig.name}\n${title}\n점수: ${scoreText}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl overflow-y-auto">
      <ConfettiEffect active={showConfetti} intensity="large" />
      <div className="text-center animate-slideUp bg-white rounded-3xl p-6 mx-4 shadow-2xl max-w-sm w-full my-4">
        <h2 className="text-2xl font-semibold text-wordchain-text mb-1">{title}</h2>
        {rank !== null && rank <= 3 && (
          <p className="text-sm font-semibold text-wordchain-warning animate-popIn">
            🎉 {rank}위 달성!
          </p>
        )}

        {/* Score */}
        <div
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-semibold text-lg my-3"
          style={{ background: gameConfig.themeColor }}
        >
          {isChainGame ? (
            <>
              <span>{(score as { player: number; ai: number }).player}</span>
              <span className="opacity-50">:</span>
              <span>{(score as { player: number; ai: number }).ai}</span>
            </>
          ) : (
            <span>{score}점</span>
          )}
        </div>

        {/* Word chain history */}
        {chain && chain.length > 0 && (
          <div className="mt-3 mb-4 max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1 justify-center">
              {chain.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full text-xs text-white"
                  style={{
                    background: c.type === 'ai' ? gameConfig.themeColor : '#00CEC9',
                  }}
                >
                  {c.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Capital quiz history */}
        {history && history.length > 0 && (
          <div className="mt-3 mb-4 max-h-40 overflow-y-auto">
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-3 py-1.5 bg-gray-50 rounded-lg">
                  <span>{h.country.flag} {h.country.name}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">{h.country.capital}</span>
                    {h.correct ? <span className="text-green-500">O</span> : <span className="text-red-400">X</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-wordchain-text font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home size={18} />
            홈으로
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            style={{ background: gameConfig.themeColor }}
          >
            <RotateCcw size={18} />
            다시하기
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-3 rounded-xl bg-wordchain-accent text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
