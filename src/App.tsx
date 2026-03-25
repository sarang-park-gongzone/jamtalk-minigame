import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameId, AppPhase } from './types';
import { GAME_CONFIGS, HOME_AVATAR_ID } from './types';
import { useKlleonSdk } from './hooks/useKlleonSdk';
import GNB from './components/GNB';
import HomeScreen from './components/HomeScreen';
import WordChainGame from './components/WordChainGame';
import CapitalGame from './components/CapitalGame';
import EnglishChainGame from './components/EnglishChainGame';
import PatternSpeakingGame from './components/PatternSpeakingGame';

const HOME_GREETING = '안녕! 재미있는 대화가 톡톡 터지는 곳, 잼톡에 온 걸 환영해! 오늘은 나랑 어떤 놀이를 해볼까? 원하는 게임을 콕! 골라줘.';

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('home');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const greetedRef = useRef(false);

  const currentAvatarId = selectedGame
    ? GAME_CONFIGS[selectedGame].avatarId
    : HOME_AVATAR_ID;

  const { isReady, mockMode, sdkStatus, echo, echoAndWait, currentSpeechText } = useKlleonSdk(currentAvatarId);

  useEffect(() => {
    if (appPhase !== 'home') {
      greetedRef.current = false;
      return;
    }
    if (!isReady || greetedRef.current) return;
    greetedRef.current = true;
    const timer = setTimeout(() => echo(HOME_GREETING), 500);
    return () => clearTimeout(timer);
  }, [appPhase, isReady]);

  const handleSelectGame = useCallback((id: GameId) => {
    setSelectedGame(id);
    setAppPhase('game');
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedGame(null);
    setAppPhase('home');
  }, []);

  return (
    <div className="w-full mx-auto min-h-[100dvh] h-[100dvh] flex flex-col bg-[#E0F7F0]">
      <GNB onGoHome={handleGoHome} />
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-white/30 backdrop-blur-sm overflow-hidden flex flex-col">
          {appPhase === 'home' && (
            <HomeScreen
              onSelectGame={handleSelectGame}
              mockMode={mockMode}
              sdkStatus={sdkStatus}
              speechText={currentSpeechText}
              echo={echo}
            />
          )}
          {appPhase === 'game' && selectedGame === 'wordchain' && (
            <WordChainGame
              key="wordchain"
              echo={echo}
              echoAndWait={echoAndWait}
              mockMode={mockMode}
              sdkStatus={sdkStatus}
              onGoHome={handleGoHome}
            />
          )}
          {appPhase === 'game' && selectedGame === 'capital' && (
            <CapitalGame
              key="capital"
              echo={echo}
              echoAndWait={echoAndWait}
              mockMode={mockMode}
              sdkStatus={sdkStatus}
              onGoHome={handleGoHome}
            />
          )}
          {appPhase === 'game' && selectedGame === 'english' && (
            <EnglishChainGame
              key="english"
              echo={echo}
              echoAndWait={echoAndWait}
              mockMode={mockMode}
              sdkStatus={sdkStatus}
              onGoHome={handleGoHome}
            />
          )}
          {appPhase === 'game' && selectedGame === 'speaking' && (
            <PatternSpeakingGame
              key="speaking"
              echo={echo}
              echoAndWait={echoAndWait}
              mockMode={mockMode}
              sdkStatus={sdkStatus}
              onGoHome={handleGoHome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
