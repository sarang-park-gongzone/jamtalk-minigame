import { useCallback, useEffect, useState } from 'react';
import { GAME_CONFIGS } from '../types';
import { useCapitalQuiz } from '../hooks/useCapitalQuiz';
import { useVoiceInput } from '../hooks/useVoiceInput';
import AvatarContainer from './AvatarContainer';
import Header from './Header';
import SpeechBubble from './SpeechBubble';
import StartOverlay from './StartOverlay';
import ResultOverlay from './ResultOverlay';
import ConfettiEffect from './ConfettiEffect';
import { Send, Lightbulb, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import { playCorrectSound, playWrongSound, playGameStartSound } from '../utils/soundUtils';

interface CapitalGameProps {
  echo: (msg: string) => void;
  echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>;
  mockMode: boolean;
  sdkStatus: 'loading' | 'ready' | 'error';
  onGoHome: () => void;
}

export default function CapitalGame({ echo, echoAndWait, mockMode, sdkStatus, onGoHome }: CapitalGameProps) {
  const config = GAME_CONFIGS.capital;
  const game = useCapitalQuiz(echo, echoAndWait);
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
    game.submitAnswer(text);
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
        history={game.history}
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

      {/* Quiz area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {game.currentCountry && (
          <div className="text-center animate-popIn">
            <div className="text-7xl mb-4">{game.currentCountry.flag}</div>
            <h2 className="text-2xl font-semibold text-wordchain-text mb-2">
              {game.currentCountry.name}
            </h2>
            <p className="text-wordchain-text-light text-sm mb-4">
              이 나라의 수도는?
            </p>

            {/* Hint display */}
            {game.showHint && (
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm font-semibold mb-4 animate-fadeIn">
                초성 힌트: {game.currentCountry.hint}
              </div>
            )}

            {/* Last answer feedback */}
            {game.lastAnswer && (
              <div className={cn(
                'text-sm font-semibold mb-2 animate-fadeIn',
                game.lastAnswer.correct ? 'text-green-500' : 'text-red-400'
              )}>
                {game.lastAnswer.correct ? '정답!' : `오답 - 정답: ${game.lastAnswer.capital}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
          <button
            onClick={game.requestHint}
            disabled={!game.isInputEnabled || game.showHint}
            className={cn(
              'p-2 rounded-xl transition-all',
              game.isInputEnabled && !game.showHint
                ? 'text-wordchain-warning hover:bg-yellow-50 animate-hintGlow'
                : 'text-gray-300'
            )}
          >
            <Lightbulb size={20} />
          </button>
          <input
            type="text"
            value={game.inputValue}
            onChange={e => game.setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                game.submitAnswer(game.inputValue);
              }
            }}
            disabled={!game.isInputEnabled}
            placeholder="수도 이름을 입력하세요"
            className="flex-1 outline-none text-wordchain-text bg-transparent px-2 py-2 text-sm"
            autoComplete="off"
          />
          <button
            onClick={voice.toggleRecording}
            disabled={!game.isInputEnabled}
            className={cn(
              'p-2 rounded-xl transition-all',
              voice.isRecording ? 'text-wordchain-accent animate-micPulse bg-pink-50' : 'text-gray-400',
              !game.isInputEnabled && 'text-gray-300'
            )}
          >
            <Mic size={20} />
          </button>
          <button
            onClick={() => game.submitAnswer(game.inputValue)}
            disabled={!game.isInputEnabled || !game.inputValue.trim()}
            className="p-2 rounded-xl text-white transition-all disabled:opacity-40"
            style={{ background: config.themeColor }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
