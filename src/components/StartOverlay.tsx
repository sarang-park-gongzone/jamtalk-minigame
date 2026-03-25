import type { GameConfig } from '../types';

interface StartOverlayProps {
  gameConfig: GameConfig;
  onStart: () => void;
  visible: boolean;
}

export default function StartOverlay({ gameConfig, onStart, visible }: StartOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
      <div className="text-center animate-slideUp">
        <h1 className="text-3xl font-semibold text-white mb-3">{gameConfig.name}</h1>
        <p className="text-white/80 mb-8 text-sm px-8">{gameConfig.description}</p>
        <button
          onClick={onStart}
          className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-xl
            bg-gradient-to-r ${gameConfig.themeGradient}
            hover:scale-105 active:scale-95 transition-transform`}
        >
          게임 시작!
        </button>
      </div>
    </div>
  );
}
