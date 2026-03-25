import { create } from 'zustand';

interface GameStore {
  totalJam: number;
  currentCombo: number;
  turnStartTime: number;
  isHintUsed: boolean;

  startTurn: () => void;
  useHint: () => void;
  handleTurnResult: (isWin: boolean) => number; // returns jam earned this turn
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  totalJam: 0,
  currentCombo: 0,
  turnStartTime: Date.now(),
  isHintUsed: false,

  startTurn: () => set({ turnStartTime: Date.now(), isHintUsed: false }),

  useHint: () => set({ isHintUsed: true }),

  handleTurnResult: (isWin: boolean) => {
    const state = get();

    if (!isWin) {
      set({ currentCombo: 0, isHintUsed: false, turnStartTime: Date.now() });
      return 0;
    }

    // Base score
    let earned = 10;

    // Speed bonus: answered within 5 seconds
    const elapsed = Date.now() - state.turnStartTime;
    if (elapsed <= 5000) earned += 5;

    // Hint penalty
    if (state.isHintUsed) earned -= 3;

    // Combo
    const newCombo = state.currentCombo + 1;

    // Combo bonus: every 3rd combo
    if (newCombo % 3 === 0) earned += 10;

    // Ensure non-negative
    const newTotal = Math.max(0, state.totalJam + earned);

    set({
      totalJam: newTotal,
      currentCombo: newCombo,
      isHintUsed: false,
      turnStartTime: Date.now(),
    });

    return earned;
  },

  resetAll: () => set({
    totalJam: 0,
    currentCombo: 0,
    turnStartTime: Date.now(),
    isHintUsed: false,
  }),
}));
