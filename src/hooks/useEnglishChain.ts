import { useState, useCallback, useRef, useEffect } from 'react';
import type { WordChip, Score, GamePhase } from '../types';
import {
  findEnglishWords, isEnglishWord, EASY_END_LETTERS,
  START_WORDS, ENGLISH_CATEGORIES,
} from '../data/englishDict';
import { ENGLISH_MESSAGES, pickMessage } from '../data/messages';
import { AVATAR_SCENARIOS } from '../constants/scenarios';

const MAX_ROUNDS = 5;
const HINT_DELAY = 10000;

function pickAiLoseRound(): number {
  return 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
}

export function useEnglishChain(echo: (msg: string) => void, echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>) {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [chain, setChain] = useState<WordChip[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState<Score>({ player: 0, ai: 0 });
  const [playerName] = useState('사랑');
  const [inputValue, setInputValue] = useState('');
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | 'draw'>('draw');
  const [lastEvent, setLastEvent] = useState<'correct' | 'wrong' | null>(null);

  const usedWordsRef = useRef<Set<string>>(new Set());
  const aiLoseRoundRef = useRef(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentLastCharRef = useRef('');

  const clearHintTimer = useCallback(() => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearHintTimer();
  }, [clearHintTimer]);

  const aiPickWord = useCallback((lastChar: string, shouldLose: boolean): string | null => {
    if (shouldLose) return null;

    const candidates = findEnglishWords(lastChar)
      .filter(w => !usedWordsRef.current.has(w));

    if (candidates.length === 0) return null;

    // Prefer words ending in easy letters
    const easy = candidates.filter(w => EASY_END_LETTERS.includes(w[w.length - 1]));
    const pool = easy.length > 0 ? easy : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const startHintTimer = useCallback(() => {
    clearHintTimer();
    hintTimerRef.current = setTimeout(() => {
      requestHint();
    }, HINT_DELAY);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearHintTimer]);

  const startGame = useCallback(() => {
    aiLoseRoundRef.current = pickAiLoseRound();
    usedWordsRef.current = new Set();
    setChain([]);
    setRound(1);
    setScore({ player: 0, ai: 0 });
    setIsGameOver(false);

    const word = START_WORDS[Math.floor(Math.random() * START_WORDS.length)];
    usedWordsRef.current.add(word);

    const lastChar = word[word.length - 1];
    currentLastCharRef.current = lastChar;

    setChain([{ word, type: 'ai' }]);
    setScore(s => ({ ...s, ai: s.ai + 1 }));

    const msg = pickMessage(ENGLISH_MESSAGES.aiFirst, { word, lastChar });
    setSpeechText(msg);
    echo(msg);

    setIsInputEnabled(true);
    startHintTimer();
  }, [echo, startHintTimer]);

  const handleStartPlaying = useCallback(async () => {
    const msg = AVATAR_SCENARIOS.emily.greeting;
    setSpeechText(msg);
    setPhase('playing');
    await echoAndWait(msg);
    startGame();
  }, [echoAndWait, startGame]);

  const endGame = useCallback(async () => {
    clearHintTimer();
    setIsInputEnabled(false);
    setIsGameOver(true);
    setScore(s => {
      const w = s.player > s.ai ? 'player' : s.ai > s.player ? 'ai' : 'draw';
      setWinner(w);
      return s;
    });

    await new Promise(r => setTimeout(r, 100));
    const resultMsg = score.player > score.ai ? AVATAR_SCENARIOS.emily.win : AVATAR_SCENARIOS.emily.lose;
    setSpeechText(resultMsg);
    await echoAndWait(resultMsg);
    setPhase('result');
  }, [clearHintTimer, echoAndWait, score]);

  const doAiTurn = useCallback(() => {
    setIsInputEnabled(false);
    clearHintTimer();

    const lastChar = currentLastCharRef.current;
    const shouldLose = round >= aiLoseRoundRef.current;

    const thinkMsg = pickMessage(ENGLISH_MESSAGES.aiThinking);
    setSpeechText(thinkMsg);
    echo(thinkMsg);

    setTimeout(() => {
      const word = aiPickWord(lastChar, shouldLose);

      if (!word) {
        const msg = pickMessage(ENGLISH_MESSAGES.aiLose, { lastChar });
        setSpeechText(msg);
        echo(msg);
        setScore(s => ({ ...s, player: s.player + 1 }));

        if (round >= MAX_ROUNDS) {
          setTimeout(() => endGame(), 1500);
        } else {
          setRound(r => r + 1);
          setTimeout(() => {
            const available = START_WORDS.filter(w => !usedWordsRef.current.has(w));
            const newWord = available[0] || 'apple';
            usedWordsRef.current.add(newWord);
            currentLastCharRef.current = newWord[newWord.length - 1];
            setChain(c => [...c, { word: newWord, type: 'ai' }]);
            setScore(s => ({ ...s, ai: s.ai + 1 }));

            const m = pickMessage(ENGLISH_MESSAGES.aiFirst, { word: newWord, lastChar: newWord[newWord.length - 1] });
            setSpeechText(m);
            echo(m);
            setIsInputEnabled(true);
            startHintTimer();
          }, 1500);
        }
        return;
      }

      usedWordsRef.current.add(word);
      const newLastChar = word[word.length - 1];
      currentLastCharRef.current = newLastChar;

      setChain(c => [...c, { word, type: 'ai' }]);
      setScore(s => ({ ...s, ai: s.ai + 1 }));

      const msg = pickMessage(ENGLISH_MESSAGES.aiTurn, { word, lastChar: newLastChar });
      setSpeechText(msg);
      echo(msg);

      if (round >= MAX_ROUNDS) {
        setTimeout(() => endGame(), 2000);
      } else {
        setIsInputEnabled(true);
        startHintTimer();
      }
    }, 1500);
  }, [round, aiPickWord, echo, clearHintTimer, startHintTimer, endGame]);

  const submitWord = useCallback((word: string) => {
    if (!word.trim() || !isInputEnabled) return;

    const trimmed = word.trim().toLowerCase();
    const lastChar = currentLastCharRef.current;

    if (trimmed[0] !== lastChar) {
      const msg = pickMessage(ENGLISH_MESSAGES.playerInvalid, { lastChar });
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    if (usedWordsRef.current.has(trimmed)) {
      const msg = pickMessage(ENGLISH_MESSAGES.playerDuplicate);
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    if (!isEnglishWord(trimmed)) {
      const msg = pickMessage(ENGLISH_MESSAGES.playerNotInDict);
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    clearHintTimer();
    usedWordsRef.current.add(trimmed);
    currentLastCharRef.current = trimmed[trimmed.length - 1];

    setChain(c => [...c, { word: trimmed, type: 'player' }]);
    setScore(s => ({ ...s, player: s.player + 1 }));
    setInputValue('');

    const msg = pickMessage(ENGLISH_MESSAGES.playerSuccess, { word: trimmed });
    setSpeechText(msg);
    echo(msg);

    setLastEvent('correct');
    setTimeout(() => setLastEvent(null), 500);

    setTimeout(() => doAiTurn(), 1500);
  }, [isInputEnabled, echo, clearHintTimer, doAiTurn]);

  const requestHint = useCallback(() => {
    const lastChar = currentLastCharRef.current;
    const candidates = findEnglishWords(lastChar)
      .filter(w => !usedWordsRef.current.has(w));

    if (candidates.length > 0) {
      const hintWord = candidates[0];
      const category = ENGLISH_CATEGORIES[hintWord];
      const msg = category
        ? pickMessage(ENGLISH_MESSAGES.hint, { lastChar, category })
        : pickMessage(ENGLISH_MESSAGES.hintNoCategory, { lastChar });
      setSpeechText(msg);
      echo(msg);
    }
  }, [echo]);

  return {
    phase, setPhase,
    chain, round, score, playerName, speechText,
    inputValue, setInputValue,
    isInputEnabled, isGameOver, winner, lastEvent,
    handleStartPlaying,
    submitWord,
    requestHint,
    startGame,
    maxRounds: MAX_ROUNDS,
  };
}
