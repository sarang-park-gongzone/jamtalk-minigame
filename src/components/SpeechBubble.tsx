interface SpeechBubbleProps {
  text: string;
  themeColor: string;
}

export default function SpeechBubble({ text }: SpeechBubbleProps) {
  if (!text) return null;

  return (
    <div className="px-4 py-2">
      <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md text-sm text-wordchain-text animate-fadeIn">
        {text}
      </div>
    </div>
  );
}
