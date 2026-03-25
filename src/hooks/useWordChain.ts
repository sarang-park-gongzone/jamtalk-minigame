import { useState, useCallback, useRef, useEffect } from 'react';
import type { WordChip, Score, GamePhase } from '../types';
import {
  getLastChar, applyDueum, getDueumVariants,
  findWordsStartingWith, isInDict, EASY_ENDINGS, WORD_CATEGORIES,
} from '../data/dictionary';
import { WORDCHAIN_MESSAGES, pickMessage } from '../data/messages';
import { AVATAR_SCENARIOS } from '../constants/scenarios';

const MAX_ROUNDS = 5;
const HINT_DELAY = 10000;

function pickAiLoseRounds(): Set<number> {
  const candidates = [3, 4, 5];
  const count = Math.random() < 0.5 ? 1 : 2;
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return new Set(shuffled.slice(0, count));
}

export function useWordChain(echo: (msg: string) => void, echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>) {
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
  const aiLoseRoundsRef = useRef<Set<number>>(new Set());
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentLastCharRef = useRef('');

  // Clear hint timer
  const clearHintTimer = useCallback(() => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, []);

  // Start hint timer
  const startHintTimer = useCallback(() => {
    clearHintTimer();
    hintTimerRef.current = setTimeout(() => {
      requestHint();
    }, HINT_DELAY);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearHintTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearHintTimer();
  }, [clearHintTimer]);

  // AI picks a word
  const aiPickWord = useCallback((lastChar: string, shouldLose: boolean): string | null => {
    if (shouldLose) return null;

    const candidates = findWordsStartingWith(lastChar)
      .filter(w => !usedWordsRef.current.has(w));

    if (candidates.length === 0) return null;

    // Prefer words ending in easy letters
    const easy = candidates.filter(w => EASY_ENDINGS.includes(getLastChar(w)));
    const pool = easy.length > 0 ? easy : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  // Start game
  const startGame = useCallback(() => {
    aiLoseRoundsRef.current = pickAiLoseRounds();
    usedWordsRef.current = new Set();
    setChain([]);
    setRound(1);
    setScore({ player: 0, ai: 0 });
    setIsGameOver(false);

    // AI starts with a word
    const starters = ['사과', '나무', '바다', '하늘', '고래', '무지개', '토끼'];
    const word = starters[Math.floor(Math.random() * starters.length)];
    usedWordsRef.current.add(word);

    const lastChar = getLastChar(word);
    currentLastCharRef.current = lastChar;

    setChain([{ word, type: 'ai' }]);
    setScore(s => ({ ...s, ai: s.ai + 1 }));

    const msg = pickMessage(WORDCHAIN_MESSAGES.aiFirst, { word });
    setSpeechText(msg);
    echo(msg);

    setIsInputEnabled(true);
    startHintTimer();
  }, [echo, startHintTimer]);

  // Start playing: wait for greeting speech to finish, then start game
  const handleStartPlaying = useCallback(async () => {
    const msg = AVATAR_SCENARIOS.hana.greeting;
    setSpeechText(msg);
    setPhase('playing');
    await echoAndWait(msg);
    startGame();
  }, [echoAndWait, startGame]);

  // AI turn
  const doAiTurn = useCallback(() => {
    setIsInputEnabled(false);
    clearHintTimer();

    const lastChar = currentLastCharRef.current;
    const shouldLose = aiLoseRoundsRef.current.has(round);

    const thinkMsg = pickMessage(WORDCHAIN_MESSAGES.aiThinking);
    setSpeechText(thinkMsg);
    echo(thinkMsg);

    setTimeout(() => {
      const word = aiPickWord(lastChar, shouldLose);

      if (!word) {
        // AI loses this round
        const msg = pickMessage(WORDCHAIN_MESSAGES.aiLose, { lastChar });
        setSpeechText(msg);
        echo(msg);
        setScore(s => ({ ...s, player: s.player + 1 }));

        if (round >= MAX_ROUNDS) {
          setTimeout(() => endGame(), 1500);
        } else {
          setRound(r => r + 1);
          // AI starts new round
          setTimeout(() => {
            const starters = ['사과', '나무', '바다', '하늘', '고래'];
            const newWord = starters.filter(w => !usedWordsRef.current.has(w))[0] || '사과';
            usedWordsRef.current.add(newWord);
            currentLastCharRef.current = getLastChar(newWord);
            setChain(c => [...c, { word: newWord, type: 'ai' }]);
            setScore(s => ({ ...s, ai: s.ai + 1 }));

            const m = pickMessage(WORDCHAIN_MESSAGES.aiFirst, { word: newWord });
            setSpeechText(m);
            echo(m);
            setIsInputEnabled(true);
            startHintTimer();
          }, 1500);
        }
        return;
      }

      usedWordsRef.current.add(word);
      const newLastChar = getLastChar(word);
      currentLastCharRef.current = newLastChar;

      setChain(c => [...c, { word, type: 'ai' }]);
      setScore(s => ({ ...s, ai: s.ai + 1 }));

      const msg = pickMessage(WORDCHAIN_MESSAGES.aiTurn, { word, lastChar: newLastChar });
      setSpeechText(msg);
      echo(msg);

      if (round >= MAX_ROUNDS) {
        setTimeout(() => endGame(), 2000);
      } else {
        setIsInputEnabled(true);
        startHintTimer();
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, aiPickWord, echo, clearHintTimer, startHintTimer]);

  // End game
  const endGame = useCallback(async () => {
    clearHintTimer();
    setIsInputEnabled(false);
    setIsGameOver(true);

    // Determine winner
    setScore(s => {
      const w = s.player > s.ai ? 'player' : s.ai > s.player ? 'ai' : 'draw';
      setWinner(w);
      return s;
    });

    // Wait one tick for winner state to settle, then speak result
    await new Promise(r => setTimeout(r, 100));
    const resultMsg = score.player > score.ai ? AVATAR_SCENARIOS.hana.win : AVATAR_SCENARIOS.hana.lose;
    setSpeechText(resultMsg);
    await echoAndWait(resultMsg);
    setPhase('result');
  }, [clearHintTimer, echoAndWait, score]);

  // Submit player word
  const submitWord = useCallback((word: string) => {
    if (!word.trim() || !isInputEnabled) return;

    const trimmed = word.trim();
    const lastChar = currentLastCharRef.current;
    const variants = getDueumVariants(lastChar);
    const appliedFirst = applyDueum(trimmed[0]);

    // Check chain rule
    if (!variants.includes(trimmed[0]) && !variants.includes(appliedFirst)) {
      const msg = pickMessage(WORDCHAIN_MESSAGES.playerInvalid, { lastChar });
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    // Check duplicate
    if (usedWordsRef.current.has(trimmed)) {
      const msg = pickMessage(WORDCHAIN_MESSAGES.playerDuplicate);
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    // Check dictionary
    if (!isInDict(trimmed)) {
      const msg = pickMessage(WORDCHAIN_MESSAGES.playerNotInDict);
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
      return;
    }

    // Valid word!
    clearHintTimer();
    usedWordsRef.current.add(trimmed);
    currentLastCharRef.current = getLastChar(trimmed);

    setChain(c => [...c, { word: trimmed, type: 'player' }]);
    setScore(s => ({ ...s, player: s.player + 1 }));
    setInputValue('');

    const msg = pickMessage(WORDCHAIN_MESSAGES.playerSuccess, { word: trimmed });
    setSpeechText(msg);
    echo(msg);

    setLastEvent('correct');
    setTimeout(() => setLastEvent(null), 500);

    // AI turn after delay
    setTimeout(() => doAiTurn(), 1500);
  }, [isInputEnabled, echo, clearHintTimer, doAiTurn]);

  // Request hint
  const requestHint = useCallback(() => {
    const lastChar = currentLastCharRef.current;
    const candidates = findWordsStartingWith(lastChar)
      .filter(w => !usedWordsRef.current.has(w));

    if (candidates.length > 0) {
      const hintWord = candidates[0];
      const category = WORD_CATEGORIES[hintWord];
      const msg = category
        ? pickMessage(WORDCHAIN_MESSAGES.hint, { lastChar, category })
        : pickMessage(WORDCHAIN_MESSAGES.hintNoCategory, { lastChar });
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
