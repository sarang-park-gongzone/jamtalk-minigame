import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';

interface FloatingPoint {
  id: number;
  amount: number;
}

let nextId = 0;

export default function JamEffect() {
  const [floats, setFloats] = useState<FloatingPoint[]>([]);
  const [comboShow, setComboShow] = useState(false);
  const combo = useGameStore(s => s.currentCombo);
  useGameStore(s => s.totalJam);

  // Show combo effect on multiples of 3
  useEffect(() => {
    if (combo > 0 && combo % 3 === 0) {
      setComboShow(true);
      const t = setTimeout(() => setComboShow(false), 1500);
      return () => clearTimeout(t);
    }
  }, [combo]);

  return (
    <>
      {/* Floating points */}
      {floats.map(f => (
        <div
          key={f.id}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-50 text-2xl font-semibold text-yellow-500 animate-slideUp"
          onAnimationEnd={() => setFloats(fs => fs.filter(x => x.id !== f.id))}
        >
          +{f.amount}
        </div>
      ))}

      {/* Combo effect */}
      {comboShow && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-4xl font-semibold text-orange-500 animate-popIn">
            {combo} COMBO!
          </div>
        </div>
      )}
    </>
  );
}

// Helper to trigger floating effect from game hooks
export function useJamEffect() {
  const [floats, setFloats] = useState<FloatingPoint[]>([]);

  const showFloat = (amount: number) => {
    const id = nextId++;
    setFloats(fs => [...fs, { id, amount }]);
    setTimeout(() => setFloats(fs => fs.filter(f => f.id !== id)), 1000);
  };

  const FloatingPoints = () => (
    <>
      {floats.map(f => (
        <div
          key={f.id}
          className="fixed left-1/2 top-1/3 -translate-x-1/2 pointer-events-none z-50 text-3xl font-semibold text-yellow-500 animate-slideUp"
        >
          +{f.amount}
        </div>
      ))}
    </>
  );

  return { showFloat, FloatingPoints };
}
