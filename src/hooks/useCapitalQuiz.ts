import { useState, useCallback, useRef } from 'react';
import type { GamePhase, CountryData } from '../types';
import { COUNTRIES } from '../data/capitals';
import { CAPITAL_MESSAGES, pickMessage } from '../data/messages';
import { AVATAR_SCENARIOS } from '../constants/scenarios';

const MAX_ROUNDS = 10;

export function useCapitalQuiz(echo: (msg: string) => void, echoAndWait: (msg: string, fallbackMs?: number) => Promise<void>) {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [playerName] = useState('사랑');
  const [inputValue, setInputValue] = useState('');
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<CountryData | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; capital: string } | null>(null);
  const [history, setHistory] = useState<{ country: CountryData; correct: boolean; usedHint: boolean }[]>([]);
  const [lastEvent, setLastEvent] = useState<'correct' | 'wrong' | null>(null);

  const usedCountriesRef = useRef<Set<string>>(new Set());
  const hintUsedRef = useRef(false);

  const pickNextCountry = useCallback((): CountryData | null => {
    const available = COUNTRIES.filter(c => !usedCountriesRef.current.has(c.name));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const startRound = useCallback(() => {
    const country = pickNextCountry();
    if (!country) {
      endGame();
      return;
    }

    usedCountriesRef.current.add(country.name);
    setCurrentCountry(country);
    setShowHint(false);
    setLastAnswer(null);
    setInputValue('');
    hintUsedRef.current = false;
    setIsInputEnabled(true);

    const msg = pickMessage(CAPITAL_MESSAGES.question, {
      flag: country.flag,
      name: country.name,
    });
    setSpeechText(msg);
    echo(msg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [echo, pickNextCountry]);

  const startGame = useCallback(() => {
    usedCountriesRef.current = new Set();
    setRound(1);
    setScore(0);
    setHistory([]);
    setIsGameOver(false);
    startRound();
  }, [startRound]);

  const handleStartPlaying = useCallback(async () => {
    const msg = AVATAR_SCENARIOS.jigu.greeting;
    setSpeechText(msg);
    setPhase('playing');
    await echoAndWait(msg);
    startGame();
  }, [echoAndWait, startGame]);

  const endGame = useCallback(async () => {
    setIsInputEnabled(false);
    setIsGameOver(true);
    const resultMsg = score >= 50 ? AVATAR_SCENARIOS.jigu.win : AVATAR_SCENARIOS.jigu.lose;
    setSpeechText(resultMsg);
    await echoAndWait(resultMsg);
    setPhase('result');
  }, [echoAndWait, score]);

  const submitAnswer = useCallback((answer: string) => {
    if (!answer.trim() || !isInputEnabled || !currentCountry) return;

    const trimmed = answer.trim();
    const isCorrect = trimmed === currentCountry.capital;
    const points = isCorrect ? (hintUsedRef.current ? 5 : 10) : 0;

    setIsInputEnabled(false);
    setInputValue('');

    if (isCorrect) {
      setScore(s => s + points);
      const msgs = hintUsedRef.current ? CAPITAL_MESSAGES.correctWithHint : CAPITAL_MESSAGES.correct;
      const msg = pickMessage(msgs);
      setSpeechText(msg);
      echo(msg);
      setLastEvent('correct');
      setTimeout(() => setLastEvent(null), 500);
    } else {
      const msg = pickMessage(CAPITAL_MESSAGES.wrong, { capital: currentCountry.capital });
      setSpeechText(msg);
      echo(msg);
      setLastEvent('wrong');
      setTimeout(() => setLastEvent(null), 500);
    }

    setLastAnswer({ correct: isCorrect, capital: currentCountry.capital });
    setHistory(h => [...h, { country: currentCountry, correct: isCorrect, usedHint: hintUsedRef.current }]);

    // Next round or end
    setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        endGame();
      } else {
        setRound(r => r + 1);
        startRound();
      }
    }, 2000);
  }, [isInputEnabled, currentCountry, round, echo, startRound, endGame]);

  const requestHint = useCallback(() => {
    if (!currentCountry) return;
    setShowHint(true);
    hintUsedRef.current = true;
    const msg = pickMessage(CAPITAL_MESSAGES.hint, { hint: currentCountry.hint });
    setSpeechText(msg);
    echo(msg);
  }, [currentCountry, echo]);

  return {
    phase, setPhase,
    round, score, playerName, speechText,
    inputValue, setInputValue,
    isInputEnabled, isGameOver,
    currentCountry, showHint, lastAnswer, history, lastEvent,
    handleStartPlaying,
    submitAnswer,
    requestHint,
    startGame,
    maxRounds: MAX_ROUNDS,
  };
}
