import { useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface AvatarContainerProps {
  className?: string;
  mockMode?: boolean;
  sdkStatus?: 'loading' | 'ready' | 'error';
  small?: boolean;
}

function hideAvatar() {
  const el = document.getElementById('klleon-avatar');
  if (!el) return;
  el.style.display = 'none';
  el.style.position = '';
  el.style.left = '';
  el.style.top = '';
  el.style.width = '';
  el.style.height = '';
  el.style.zIndex = '';
  el.style.clipPath = '';
  // Clear SDK's internal video/canvas to prevent ghost frames
  el.innerHTML = '';
}

export default function AvatarContainer({ className, mockMode, sdkStatus = 'loading', small }: AvatarContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById('klleon-avatar');
    if (!el || !containerRef.current) return;

    function updatePosition() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      el.style.display = 'block';
      el.style.position = 'fixed';
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.zIndex = '5';
      el.style.borderRadius = '1rem';
      el.style.overflow = 'hidden';
      el.style.clipPath = 'inset(0 round 1rem)';
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const interval = setInterval(updatePosition, 500);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(interval);
      hideAvatar();
    };
  }, []);

  // If height is explicitly set via className (e.g. h-full), skip default sizing
  const hasExplicitHeight = className?.includes('h-');
  const defaultStyle = hasExplicitHeight ? undefined : { aspectRatio: '3 / 4', maxHeight: '300px' };

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden rounded-2xl', className)} style={defaultStyle}>
      {mockMode && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100 rounded-2xl">
          <div className="text-center">
            <div className={cn('animate-float font-semibold text-wordchain-primary', small ? 'text-xl' : 'text-4xl')}>AI</div>
            {!small && <p className="text-sm text-wordchain-text-light mt-2">AI 선생님</p>}
          </div>
        </div>
      )}
      {!small && (
        <div className="sdk-status mt-1 justify-center absolute bottom-1 left-0 right-0">
          <div className={cn('sdk-status-dot', sdkStatus)} />
          <span>{sdkStatus === 'ready' ? '연결됨' : sdkStatus === 'loading' ? '연결 중...' : '연결 오류'}</span>
        </div>
      )}
    </div>
  );
}
