import { useCallback, useEffect, useState } from 'react';
import { GAME_CONFIGS } from '../types';
import { useWordChain } from '../hooks/useWordChain';
import { useVoiceInput } from '../hooks/useVoiceInput';
import AvatarContainer from './AvatarContainer';
import Header from './Header';
import ChainArea from './ChainArea';
import InputArea from './InputArea';
import SpeechBubble from './SpeechBubble';
import StartOverlay from './StartOverlay';
import ResultOverlay from './ResultOverlay';
import ConfettiEffect from './ConfettiEffect';
import { playCorrectSound, playWrongSound, playGameStartSound } from '../utils/soundUtils';

interface WordChainGameProps {
  echo: (msg: string) => void;
  echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>;
  mockMode: boolean;
  sdkStatus: 'loading' | 'ready' | 'error';
  onGoHome: () => void;
}

export default function WordChainGame({ echo, echoAndWait, mockMode, sdkStatus, onGoHome }: WordChainGameProps) {
  const config = GAME_CONFIGS.wordchain;
  const game = useWordChain(echo, echoAndWait);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (game.lastEvent === 'correct') {
      playCorrectSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else if (game.lastEvent === 'wrong') {
      playWrongSound();
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
  }, [game.lastEvent]);

  const handleVoiceResult = useCallback((text: string) => {
    game.setInputValue(text);
    game.submitWord(text);
  }, [game]);

  const voice = useVoiceInput({ onResult: handleVoiceResult, lang: 'ko-KR' });

  return (
    <div className={`relative flex flex-col h-full ${shaking ? 'animate-shake' : ''}`}>
      <ConfettiEffect active={showConfetti} intensity="small" />
      <StartOverlay
        gameConfig={config}
        onStart={() => { playGameStartSound(); game.handleStartPlaying(); }}
        visible={game.phase === 'start'}
      />
      <ResultOverlay
        visible={game.phase === 'result'}
        playerName={game.playerName}
        score={game.score}
        chain={game.chain}
        winner={game.winner}
        gameConfig={config}
        onRestart={() => {
          game.setPhase('playing');
          game.startGame();
        }}
        onGoHome={onGoHome}
      />

      {/* Game UI */}
      <Header
        gameName={config.name}
        teacherName={config.teacherName}
        themeColor={config.themeColor}
        round={game.round}
        maxRounds={game.maxRounds}
        score={game.score}
        onGoHome={onGoHome}
      />

      <div className="flex flex-col items-center px-4 pt-3">
        <AvatarContainer
          className="w-80"
          mockMode={mockMode}
          sdkStatus={sdkStatus}
        />
        <SpeechBubble text={game.speechText} themeColor={config.themeColor} />
      </div>

      <ChainArea chain={game.chain} themeColor={config.themeColor} />

      <InputArea
        value={game.inputValue}
        onChange={game.setInputValue}
        onSubmit={() => game.submitWord(game.inputValue)}
        onHint={game.requestHint}
        isInputEnabled={game.isInputEnabled}
        placeholder="끝말잇기 단어를 입력하세요"
        themeColor={config.themeColor}
        isRecording={voice.isRecording}
        toggleRecording={voice.toggleRecording}
      />
    </div>
  );
}
