import { playClickSound } from '../utils/soundUtils';

interface ExitModalProps {
  visible: boolean;
  onContinue: () => void;
  onExit: () => void;
}

export default function ExitModal({ visible, onContinue, onExit }: ExitModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 mx-4 shadow-2xl max-w-sm w-full text-center opacity-0"
        style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
      >
        <div className="text-4xl mb-4">?</div>
        <h2 className="text-lg font-semibold text-wordchain-text mb-2">
          이 수업을 정말 종료하시겠습니까?
        </h2>
        <p className="text-sm text-wordchain-text-light mb-6">
          지금 나가면 진행 상황이 저장되지 않아요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { playClickSound(); onContinue(); }}
            className="flex-1 py-3 rounded-xl bg-wordchain-primary text-white font-semibold
              transition-all duration-150 active:scale-95 hover:brightness-110"
          >
            계속 학습하기
          </button>
          <button
            onClick={() => { playClickSound(); onExit(); }}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-wordchain-text font-semibold
              transition-all duration-150 active:scale-95 hover:bg-gray-200"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
