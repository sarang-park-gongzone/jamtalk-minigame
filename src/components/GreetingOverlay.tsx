import { useState } from 'react';

interface GreetingOverlayProps {
  visible: boolean;
  onComplete: (name: string) => void;
  themeColor: string;
}

export default function GreetingOverlay({ visible, onComplete, themeColor }: GreetingOverlayProps) {
  const [name, setName] = useState('');

  if (!visible) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
      <div className="text-center animate-slideUp bg-white rounded-3xl p-8 mx-4 shadow-2xl max-w-sm w-full">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-xl font-semibold text-wordchain-text mb-2">안녕하세요!</h2>
        <p className="text-wordchain-text-light text-sm mb-6">이름을 알려주세요!</p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-center text-lg mb-4"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: themeColor }}
        >
          시작하기!
        </button>
      </div>
    </div>
  );
}
