import { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_CONFIGS } from '../types';
import { SPEAKING_PATTERNS } from '../data/speakingPatterns';
import { AVATAR_SCENARIOS } from '../constants/scenarios';
import { playClickSound } from '../utils/soundUtils';
import AvatarContainer from './AvatarContainer';
import Header from './Header';
import SpeechBubble from './SpeechBubble';
import StartOverlay from './StartOverlay';
import ResultOverlay from './ResultOverlay';
import ExitModal from './ExitModal';
import { Mic, Volume2, Play, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatternSpeakingGameProps {
  echo: (msg: string) => void;
  echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>;
  mockMode: boolean;
  sdkStatus: 'loading' | 'ready' | 'error';
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function PatternSpeakingGame({ echo, echoAndWait, mockMode, sdkStatus, onGoHome }: PatternSpeakingGameProps) {
  const config = GAME_CONFIGS.speaking;

  const [phase, setPhase] = useState<Phase>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [matched, setMatched] = useState(false);
  const [userText, setUserText] = useState('');
  const [tooltip, setTooltip] = useState<{ word: string; meaning: string; x: number; y: number } | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const pattern = SPEAKING_PATTERNS[currentIdx];
  const total = SPEAKING_PATTERNS.length;

  // Cleanup audio URL
  const cleanupAudioUrl = useCallback(() => {
    if (userAudioUrl) {
      URL.revokeObjectURL(userAudioUrl);
      setUserAudioUrl(null);
    }
    audioChunksRef.current = [];
  }, [userAudioUrl]);

  // Start game
  const handleStart = useCallback(async () => {
    setPhase('playing');
    const msg = AVATAR_SCENARIOS.emilySpeaking.greeting;
    setSpeechText(msg);
    await echoAndWait(msg);
    setSpeechText(pattern.sentence);
    echo(pattern.sentence);
  }, [echoAndWait, echo, pattern]);

  // Check match (70% fuzzy)
  const checkMatch = useCallback((spoken: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const targetWords = normalize(pattern.sentence).split(/\s+/);
    const inputWords = normalize(spoken).split(/\s+/);
    let matchCount = 0;
    for (const tw of targetWords) {
      if (inputWords.includes(tw)) matchCount++;
    }
    return matchCount / targetWords.length >= 0.7;
  }, [pattern]);

  // Start recording (Speech Recognition + MediaRecorder simultaneously)
  const startRecording = useCallback(async () => {
    playClickSound();
    setUserText('');
    audioChunksRef.current = [];

    // 1. Start MediaRecorder for audio playback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setUserAudioUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        // Stop mic stream
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn('MediaRecorder unavailable:', err);
    }

    // 2. Start Speech Recognition for text matching
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setUserText(text);
        if (checkMatch(text)) {
          setMatched(true);
          setScore(s => s + 1);
          playClickSound();
          setSpeechText('Perfect! Great pronunciation!');
          echo('Perfect! Great pronunciation!');
        } else {
          setSpeechText(`I heard "${text}". Try again!`);
          echo(`I heard "${text}". Try again!`);
        }
        setIsRecording(false);
        // Stop MediaRecorder when speech recognition ends
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('SpeechRecognition unavailable:', err);
    }
  }, [checkMatch, echo]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Play model pronunciation (TTS)
  const playModelPronunciation = useCallback(() => {
    playClickSound();
    echo(pattern.sentence);
  }, [echo, pattern]);

  // Play user recording
  const playUserRecording = useCallback(() => {
    if (!userAudioUrl) return;
    playClickSound();
    const audio = new Audio(userAudioUrl);
    audio.play().catch(() => {});
  }, [userAudioUrl]);

  // Next sentence
  const nextSentence = useCallback(() => {
    playClickSound();
    cleanupAudioUrl();
    setMatched(false);
    setUserText('');
    if (currentIdx + 1 >= total) {
      const resultMsg = score >= total / 2 ? AVATAR_SCENARIOS.emilySpeaking.win : AVATAR_SCENARIOS.emilySpeaking.lose;
      setSpeechText(resultMsg);
      echo(resultMsg);
      setTimeout(() => setPhase('result'), 3000);
    } else {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextPattern = SPEAKING_PATTERNS[nextIdx];
      setSpeechText(nextPattern.sentence);
      echo(nextPattern.sentence);
    }
  }, [currentIdx, total, score, echo, cleanupAudioUrl]);

  // Word tooltip
  const handleWordClick = (word: string, e: React.MouseEvent) => {
    const hint = pattern.wordHints.find(h => h.word.toLowerCase() === word.toLowerCase().replace(/[^a-z]/g, ''));
    if (hint) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({ word: hint.word, meaning: hint.meaning, x: rect.left + rect.width / 2, y: rect.top - 10 });
      setTimeout(() => setTooltip(null), 3000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Render sentence with clickable words
  const renderSentence = () => {
    const words = pattern.sentence.split(' ');
    const hintWords = pattern.wordHints.map(h => h.word.toLowerCase());
    return (
      <p className="text-2xl lg:text-3xl font-semibold leading-[3] text-center">
        {words.map((word, i) => {
          const isHint = hintWords.includes(word.toLowerCase().replace(/[^a-z]/g, ''));
          return (
            <span
              key={i}
              onClick={isHint ? (e) => handleWordClick(word, e) : undefined}
              className={cn(
                'transition-colors duration-300 mx-1',
                matched ? 'text-green-500' : 'text-wordchain-text',
                isHint && !matched && 'underline decoration-dotted decoration-gray-400 cursor-pointer hover:text-wordchain-primary'
              )}
            >
              {word}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="relative flex flex-col h-full">
      <ExitModal
        visible={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={onGoHome}
      />

      <StartOverlay
        gameConfig={config}
        onStart={handleStart}
        visible={phase === 'start'}
      />

      <ResultOverlay
        visible={phase === 'result'}
        playerName="사랑"
        score={score}
        gameConfig={config}
        onRestart={() => {
          cleanupAudioUrl();
          setCurrentIdx(0);
          setScore(0);
          setMatched(false);
          setUserText('');
          setPhase('playing');
          const p = SPEAKING_PATTERNS[0];
          setSpeechText(p.sentence);
          echo(p.sentence);
        }}
        onGoHome={onGoHome}
      />

      {/* Header */}
      <div className="relative">
        <Header
          gameName={config.name}
          teacherName={config.teacherName}
          themeColor={config.themeColor}
          round={currentIdx + 1}
          maxRounds={total}
          score={score}
          onGoHome={() => setShowExitModal(true)}
        />
        <button
          onClick={() => { playClickSound(); setShowExitModal(true); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-all active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-4 pt-3">
        <AvatarContainer
          className="w-80"
          mockMode={mockMode}
          sdkStatus={sdkStatus}
        />
        <SpeechBubble text={speechText} themeColor={config.themeColor} />
      </div>

      {/* Sentence display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <p className="text-sm text-wordchain-text-light mb-3">{pattern.korean}</p>
        {renderSentence()}
        {userText && (
          <p className={cn('mt-4 text-sm', matched ? 'text-green-500' : 'text-red-400')}>
            "{userText}"
          </p>
        )}

        {/* Playback buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={playModelPronunciation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-md text-sm font-semibold text-wordchain-text
              transition-all duration-150 active:scale-95 hover:shadow-lg"
          >
            <Volume2 size={16} />
            모범 발음
          </button>
          {userAudioUrl && (
            <button
              onClick={playUserRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-md text-sm font-semibold text-white
                transition-all duration-150 active:scale-95 hover:shadow-lg"
              style={{ background: config.themeColor }}
            >
              <Play size={16} />
              내 발음
            </button>
          )}
        </div>

        {matched && (
          <button
            onClick={nextSentence}
            className="mt-4 px-6 py-2 rounded-xl text-white font-semibold transition-all duration-150 active:scale-95"
            style={{ background: config.themeColor }}
          >
            {currentIdx + 1 >= total ? '결과 보기' : '다음 문장'}
          </button>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-wordchain-text text-white text-xs px-3 py-2 rounded-lg shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-semibold">{tooltip.word}</span>: {tooltip.meaning}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-wordchain-text" />
        </div>
      )}

      {/* Mic button */}
      <div className="px-4 pb-6 pt-2 flex flex-col items-center">
        {isRecording && (
          <p className="text-sm text-wordchain-text-light mb-2 animate-fadeIn">
            이제 스피킹 하세요...
          </p>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-150 active:scale-90',
            isRecording && 'animate-micPulse'
          )}
          style={{ background: isRecording ? '#D63031' : config.themeColor }}
        >
          <Mic size={28} />
        </button>
      </div>
    </div>
  );
}
