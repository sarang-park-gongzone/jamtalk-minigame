import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GameId } from '../types';
import { GAME_CONFIGS } from '../types';
import { getTopScores, type LeaderboardEntry } from '../stores/useLeaderboard';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

const GAME_TABS: GameId[] = ['wordchain', 'capital', 'english', 'speaking'];
const MEDALS = ['', '🥇', '🥈', '🥉'];

export default function LeaderboardModal({ visible, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<GameId>('wordchain');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (visible) {
      setEntries(getTopScores(activeTab));
    }
  }, [visible, activeTab]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 mx-4 shadow-2xl max-w-sm w-full animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-wordchain-text">🏆 리더보드</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
          {GAME_TABS.map(id => {
            const config = GAME_CONFIGS[id];
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-white shadow text-wordchain-text'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {config.emoji} {config.name}
              </button>
            );
          })}
        </div>

        {/* Rankings */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              아직 기록이 없어요!
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rank = idx + 1;
              const medal = MEDALS[rank] || '';
              const isTop3 = rank <= 3;
              return (
                <div
                  key={`${entry.date}-${idx}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isTop3 ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}
                >
                  <span className={`w-8 text-center font-semibold ${
                    isTop3 ? 'text-lg' : 'text-sm text-gray-400'
                  }`}>
                    {medal || rank}
                  </span>
                  <span className="flex-1 text-sm font-medium text-wordchain-text truncate">
                    {entry.playerName}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: GAME_CONFIGS[activeTab].themeColor }}
                  >
                    {entry.score}점
                  </span>
                  <span className="text-xs text-gray-300">
                    {new Date(entry.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
