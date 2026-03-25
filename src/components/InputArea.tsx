import { Send, Lightbulb, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import { playClickSound } from '../utils/soundUtils';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  isInputEnabled: boolean;
  placeholder?: string;
  themeColor: string;
  isRecording?: boolean;
  toggleRecording?: () => void;
}

export default function InputArea({
  value, onChange, onSubmit, onHint,
  isInputEnabled, placeholder = '단어를 입력하세요',
  themeColor, isRecording, toggleRecording,
}: InputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className={cn(
        'flex items-center gap-1 bg-white rounded-2xl shadow-lg p-2 border-2 transition-all',
        isInputEnabled ? 'border-transparent ring-2 ring-offset-1' : 'border-transparent',
      )} style={isInputEnabled ? { '--tw-ring-color': themeColor + '40' } as React.CSSProperties : undefined}>
        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isInputEnabled}
          placeholder={isInputEnabled ? placeholder : '상대 차례입니다...'}
          className="flex-1 outline-none text-wordchain-text bg-transparent px-3 py-2 text-sm"
          autoComplete="off"
        />

        {/* Action buttons grouped on right */}
        <div className="flex items-center gap-1">
          {/* Hint */}
          <button
            onClick={() => { playClickSound(); onHint(); }}
            disabled={!isInputEnabled}
            className={cn(
              'p-2 rounded-xl transition-all duration-150 active:scale-90',
              isInputEnabled
                ? 'text-wordchain-warning hover:bg-yellow-50'
                : 'text-gray-300'
            )}
          >
            <Lightbulb size={18} />
          </button>

          {/* Mic */}
          {toggleRecording && (
            <button
              onClick={() => { playClickSound(); toggleRecording(); }}
              disabled={!isInputEnabled}
              className={cn(
                'p-2 rounded-xl transition-all duration-150 active:scale-90',
                isRecording ? 'text-wordchain-accent animate-micPulse bg-pink-50' : 'text-gray-400',
                !isInputEnabled && 'text-gray-300'
              )}
            >
              <Mic size={18} />
            </button>
          )}

          {/* Send */}
          <button
            onClick={() => { playClickSound(); onSubmit(); }}
            disabled={!isInputEnabled || !value.trim()}
            className="p-2 rounded-xl text-white transition-all duration-150 active:scale-90 disabled:opacity-30"
            style={{ background: themeColor }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
